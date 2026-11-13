const fs=require('fs'),path=require('path'),{chromium}=require('playwright'),sharp=require('sharp');
const root=__dirname;
const configPath=process.argv[2]?path.resolve(process.argv[2]):path.join(root,'content.json');
const outputDir=process.argv[3]?path.resolve(process.argv[3]):path.join(root,'output');
const isTest=Boolean(process.argv[3]);
const content=JSON.parse(fs.readFileSync(configPath,'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(root,'grid.json'),'utf8'));
// Optional product-title width stays on the same shared grid.
if(content.productLayout){
 const a=content.productLayout;
 if(!Number.isInteger(a.column)||!Number.isInteger(a.span)||a.column<1||a.span<1||a.column+a.span>grid.columns+1)throw Error('Invalid product title columns');
 grid.areas.product={...grid.areas.product,column:a.column,span:a.span};
}
// Annotation is manual; only snapping the enclosing frame to the shared grid is automatic.
if(content.image.target){
 const t=content.image.target,p=content.image.placement,cw=(grid.width-2*grid.margin)/grid.columns,pad=t.padding??grid.unit;
 if(![t.x,t.y,t.width,t.height,pad].every(Number.isFinite)||t.x<0||t.y<0||t.width<=0||t.height<=0||t.x+t.width>1||t.y+t.height>1||pad<0)throw Error('Invalid annotated product bounds');
 const left=Math.floor((p.x+t.x*p.width-pad-grid.margin)/cw);
 const right=Math.ceil((p.x+(t.x+t.width)*p.width+pad-grid.margin)/cw);
 const top=Math.floor((p.y+t.y*p.height-pad)/grid.unit);
 const bottom=Math.ceil((p.y+(t.y+t.height)*p.height+pad)/grid.unit);
 content.image.highlight={column:left+1,span:right-left,row:top+1,rows:bottom-top};
}

// Include frame handles in the top safe area; shift the entire photo, never crop the target.
const safety=grid.imageSafety;
const minFrameTop=Math.ceil((safety.topInsetUnits*grid.unit+safety.handleHalfSize)/grid.unit)*grid.unit;
const actualFrameTop=(content.image.highlight.row-1)*grid.unit;
const photoShiftY=Math.max(0,minFrameTop-actualFrameTop);
content.image.placement.y+=photoShiftY;
content.image.highlight.row+=photoShiftY/grid.unit;

// Reserve a grid-aligned corridor between the frame, elbow and product title.
const guide=grid.guide;
const frameBottom=(content.image.highlight.row-1+content.image.highlight.rows)*grid.unit;
const minimumTitleTop=frameBottom+(guide.frameClearanceUnits+guide.lastLegUnits+guide.titleGapUnits)*grid.unit;
grid.areas.product.row=Math.max(grid.areas.product.row,Math.ceil(minimumTitleTop/grid.unit)+1);
if((grid.areas.product.row-1+grid.areas.product.rows)*grid.unit>(grid.areas.eyebrow.row-1)*grid.unit-grid.unit)throw Error('Insufficient space for guide corridor and title; recompose image');

fs.mkdirSync(outputDir,{recursive:true});
const htmlPath=isTest?path.join(outputDir,'index.html'):path.join(root,'index.html');
const brand=fs.readFileSync(path.join(root,'assets/symbols.svg'),'utf8');
const paths=[...brand.matchAll(/<path\b[^>]*\/>/g)].map(m=>m[0].replaceAll('fill="black"','fill="#DFFF2F"'));
const dataScript='window.POSTER_DATA='+JSON.stringify({grid,content,symbols:{slash:paths[0],hourglass:paths.slice(1,4).join('')}}).replaceAll('<','\\u003c')+';';
if(isTest){
 const base=path.relative(outputDir,root).split(path.sep).join('/')+'/';
 let html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('<head>','<head><base href="'+base+'">').replace('<script src="data.js"></script>','<script>'+dataScript+'</script>');
 fs.writeFileSync(htmlPath,html);
}else fs.writeFileSync(path.join(root,'data.js'),dataScript);

(async()=>{
const imagePath=path.resolve(root,content.image.src);
const metadata=await sharp(imagePath).metadata();
const p=content.image.placement,h=content.image.highlight;
if(![p.x,p.y,p.width,p.height].every(Number.isFinite)||p.width<=0||p.height<=0)throw Error('Invalid image placement');
const ratioError=Math.abs((p.width/p.height)/(metadata.width/metadata.height)-1);
if(ratioError>.01)throw Error('Image aspect ratio would be stretched; preserve original proportions');
if(!Object.values(h).every(Number.isInteger)||h.column<1||h.span<1||h.row<1||h.rows<1||h.column+h.span>grid.columns+1)throw Error('Highlight must use valid grid rows/columns');
const cw=(grid.width-2*grid.margin)/grid.columns;
const fb={x:grid.margin+(h.column-1)*cw,y:(h.row-1)*grid.unit,w:h.span*cw,h:h.rows*grid.unit};
if(fb.x<p.x||fb.y<p.y||fb.x+fb.w>p.x+p.width||fb.y+fb.h>p.y+p.height)throw Error('Highlight extends outside the product image');
if(fb.y+fb.h>(grid.areas.product.row-1)*grid.unit-grid.unit)throw Error('Highlight overlaps the product title or its required gap');
let targetCoverage=null;
if(content.image.target){const t=content.image.target;
 const b={x:p.x+t.x*p.width,y:p.y+t.y*p.height,width:t.width*p.width,height:t.height*p.height};
 const contained=b.x>=fb.x&&b.y>=fb.y&&b.x+b.width<=fb.x+fb.w&&b.y+b.height<=fb.y+fb.h;
 targetCoverage={label:t.label,bounds:b,highlight:fb,contained};
 if(!contained)throw Error('Highlight cuts off the annotated product');
}

if(![content.image.anchor.x,content.image.anchor.y].every(v=>Number.isFinite(v)&&v>=0&&v<=1))throw Error('Guide anchor must stay within the highlight');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});try{
const page=await browser.newPage({viewport:{width:1240,height:1660},deviceScaleFactor:2});
await page.goto(require('url').pathToFileURL(htmlPath).href);
await page.evaluate(async()=>{document.body.classList.add('export');dispatchEvent(new Event('resize'));await window.posterReady;
 await Promise.all([window.POSTER_DATA.content.image.src].filter(Boolean).map(src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=()=>reject(new Error('Image failed to load: '+src));img.src=src;})));
});
const checks=await page.evaluate(()=>{
const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}};
return{fonts:document.fonts.check('700 80px Chakra')&&document.fonts.check('400 21px Plex'),focus:box('.focus'),product:box('.product'),eyebrow:box('.eyebrow'),identity:box('.identity'),series:box('.series'),footer:box('footer'),overflow:[...document.querySelectorAll('[data-field]')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.dataset.field).concat([...document.querySelectorAll('.product,.identity,.company,.eyebrow')].filter(e=>e.scrollHeight>e.clientHeight+1).map(e=>e.className+':height'))};
});
fs.writeFileSync(path.join(outputDir,'validation.json'),JSON.stringify(checks,null,2));
checks.targetCoverage=targetCoverage;
checks.imageSafety={topInset:safety.topInsetUnits*grid.unit,frameTop:checks.focus.y,handleTop:checks.focus.y-safety.handleHalfSize,photoShiftY};
if(checks.imageSafety.handleTop<checks.imageSafety.topInset)throw Error("Highlight enters top safe area");
const titleTop=checks.product.y, endY=titleTop-guide.titleGapUnits*grid.unit, elbowY=endY-guide.lastLegUnits*grid.unit;
checks.guide={frameBottom,elbowY,endY,titleTop,frameClearance:elbowY-frameBottom,lastLeg:endY-elbowY,titleGap:titleTop-endY};
if(checks.guide.frameClearance<guide.frameClearanceUnits*grid.unit)throw Error('Guide too close to highlight');
if(!checks.fonts||checks.overflow.length)throw Error(JSON.stringify(checks));
for(const key of ['focus','product','eyebrow','identity','series','footer']){const b=checks[key];if((b.x-grid.margin)%cw||b.y%grid.unit||b.width%cw||b.height%grid.unit)throw Error('Grid violation: '+key)}
fs.mkdirSync(outputDir,{recursive:true});
await page.locator('.poster').screenshot({path:path.join(outputDir,'poster.png')});
await page.evaluate(()=>document.querySelector('.poster').classList.add('show-grid'));
await page.locator('.poster').screenshot({path:path.join(outputDir,'grid-proof.png')});
for(const n of ['poster','grid-proof'])await sharp(path.join(outputDir,n+'.png')).resize(744).toFile(path.join(outputDir,n+'-preview.png'));
fs.writeFileSync(path.join(outputDir,'validation.json'),JSON.stringify(checks,null,2));console.log(checks);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
