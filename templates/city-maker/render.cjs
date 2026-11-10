const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = __dirname;
const configPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root,'content.json');
const outputDir = process.argv[3] ? path.resolve(process.argv[3]) : path.join(root,'output');
const htmlPath = process.argv[3] ? path.join(outputDir,'index.html') : path.join(root,'index.html');
const c = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const rules = require('./template-rules.json');
require('./validate.cjs').validate(c);
for(const key of Object.keys(rules.fields)) c[key]=c[key].trim();
const escape = s => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
const uri = (file, mime) => `data:${mime};base64,${fs.readFileSync(path.join(root, file)).toString('base64')}`;
const portraitMime = {'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'}[path.extname(c.portrait).toLowerCase()];
if(!portraitMime) throw new Error('照片请使用 PNG、JPEG 或 WebP 格式');
// Align the visible artwork, excluding the standard SVG's transparent margins.
const logo = fs.readFileSync(path.join(root, 'assets/logo.svg'), 'utf8')
 .replaceAll('#DFFF2F', c.accent)
 .replace('width="400" height="150" viewBox="0 0 400 150"', 'width="374.778015" height="130.234589" viewBox="10.617010 10.611707 374.778015 130.234589"');
const logoHeight = 105;
const logoWidth = logoHeight * 374.778015 / 130.234589;
const logoX = rules.safeArea.right - logoWidth;
const logoY = 82; // Visible cap top of C/M; excludes the y descender.

const logoUri = `data:image/svg+xml;base64,${Buffer.from(logo).toString('base64')}`;
const text = (value,x,y,size,extra='') => `<text x="${x}" y="${y}" font-size="${size}" ${extra}>${escape(value)}</text>`;
const label = (id,value,size,anchor,y,align,maxWidth) => `<g data-label="${id}" data-anchor="${anchor}" data-y="${y}" data-align="${align}" data-max="${maxWidth}" data-size="${size}"><rect fill="${c.accent}"/>${text(value,0,0,size,`style="fill:${c.background}"`)}</g>`;
// Browser font measurements give every label a content-sized frame.
function autoLayout() {
 const ns='http://www.w3.org/2000/svg', boxes={};
 document.querySelectorAll('[data-label]').forEach(g=>{
  const t=g.querySelector('text'),r=g.querySelector('rect');
  const raw=t.textContent,size=+g.dataset.size,padX=18,padY=18,max=+g.dataset.max;
  const lines=[];let line='';
  const tokens=g.dataset.label==='role' ? [raw] : raw.match(/[A-Za-z0-9]+(?:['’.-][A-Za-z0-9]+)*| +|[^A-Za-z0-9 ]/gu)||[];
  for(const ch of tokens){
   if(ch==='\n'){lines.push(line);line='';continue;}
   t.textContent=line+ch;
   if(t.getComputedTextLength()>max-padX*2 && line){lines.push(line.trimEnd());line=ch.trimStart();}else line+=ch;
  }
  lines.push(line);t.textContent='';
  lines.forEach((l,i)=>{const span=document.createElementNS(ns,'tspan');span.setAttribute('x',padX);span.setAttribute('y',padY+size*.85+i*size*1.2);span.textContent=l;t.appendChild(span);});
  const width=Math.ceil(Math.max(...[...t.children].map(n=>n.getComputedTextLength()))+2*padX);
  const height=Math.ceil(size*1.2*lines.length+2*padY);
  let y=+g.dataset.y;
  if(g.dataset.label==='company')y=boxes.role.y+boxes.role.height;
  if(g.dataset.label==='description')y=1559-height;
  if(g.dataset.label==='name')y=1364.5;
  const x=+g.dataset.anchor-(g.dataset.align==='right'?width:0);
  g.setAttribute('transform',`translate(${x} ${y})`);r.setAttribute('width',width);r.setAttribute('height',height);
  boxes[g.dataset.label]={x,y,width,height,lines};
 });
 // Stack name directly above the description, which stays anchored to the photo bottom.
 const name=document.querySelector('[data-label="name"]');
 boxes.name.y=boxes.description.y-boxes.name.height;
 name.setAttribute('transform',`translate(${boxes.name.x} ${boxes.name.y})`);
 return boxes;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="2631" height="3509" viewBox="0 0 1368 1824">
<title>City Maker — ${escape(c.name)}</title>
<defs><style>
@font-face{font-family:Chakra;font-weight:700;src:url('${uri('assets/ChakraPetch-Bold.ttf','font/ttf')}')}
@font-face{font-family:Plex;font-weight:600;src:url('${uri('assets/Plex-SemiBold.otf','font/otf')}')}
@font-face{font-family:Plex;font-weight:400;src:url('${uri('assets/Plex-Regular.woff2','font/woff2')}')}
text{font-family:Plex,sans-serif;font-weight:600;fill:${c.accent}}
</style></defs>
<rect width="1368" height="1824" fill="${c.background}"/>
${text(c.title,62,187,150,'style="font-family:Chakra;font-weight:700"')}
${text(c.titleZh,69,361,145,'letter-spacing="2"')}
<image x="${logoX}" y="${logoY}" width="${logoWidth}" height="${logoHeight}" preserveAspectRatio="xMidYMid meet" xlink:href="${logoUri}"/>
<g id="website-row">
<g stroke="${c.accent}" stroke-width="4"><path d="M648 434l27-28 M686 434l27-28 M727 434l27-28 M765 434l27-28"/></g>
${text(c.website,832,435,58,'style="font-weight:400"')}
</g>
<image x="170" y="531.8" width="1028.5" height="1028" preserveAspectRatio="xMidYMid slice" xlink:href="${uri(c.portrait,portraitMime)}"/>
${label('role',c.role,rules.fontSizes[rules.fields.role.size],rules.safeArea.right,531.5,'right',rules.fields.role.maxWidth)}
${label('company',c.company,rules.fontSizes[rules.fields.company.size],rules.safeArea.right,0,'right',rules.fields.company.maxWidth)}
${label('name',c.name,rules.fontSizes[rules.fields.name.size],rules.safeArea.left,0,'left',rules.fields.name.maxWidth)}
${label('description',c.description,rules.fontSizes[rules.fields.description.size],170.5,0,'left',rules.fields.description.maxWidth)}
<g stroke="${c.accent}" stroke-width="4"><path d="M73 1669l27-28 M73 1720l27-28"/></g>
${text(c.footerZh,108,1670,43,'style="font-weight:400"')}
${text(c.footerEn,108,1722,43,'style="font-weight:400"')}
${c.testOnly ? text("模板测试 · 非活动嘉宾",990,1718,23,'style="font-weight:400"') : ""}
</svg>`;
(async()=>{
 fs.mkdirSync(outputDir,{recursive:true});

 const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>City Maker · ${escape(c.name)}</title><style>html,body{margin:0;background:${c.background}}svg{display:block;width:100%;height:auto}</style>${svg}</html>`;
 fs.writeFileSync(htmlPath,html);
 const opts={headless:true};
 if(process.env.CHROME_PATH) opts.executablePath=process.env.CHROME_PATH;
 const browser=await chromium.launch(opts);
 try {
 const page=await browser.newPage({viewport:{width:2631,height:3509},deviceScaleFactor:1});
 await page.goto('file://'+htmlPath);
 await page.evaluate(()=>document.fonts.ready);
 if(!await page.evaluate(()=>document.fonts.check('700 150px Chakra')&&document.fonts.check('600 60px Plex')&&document.fonts.check('400 43px Plex'))) throw new Error('Font loading failed');
 await page.evaluate(right=>{
  const group=document.querySelector('#website-row'), t=group.querySelector('text');
  const ctx=document.createElement('canvas').getContext('2d');
  ctx.font='400 58px Plex';
  const inkRight=832+ctx.measureText(t.textContent).actualBoundingBoxRight;
  group.setAttribute('transform',`translate(${right-inkRight} 20)`);
 },rules.safeArea.right);
 const labels=await page.evaluate(autoLayout);
 for(const [key,box] of Object.entries(labels)){
  const rule=rules.fields[key];
  const a=rules.safeArea;
  if(box.x<a.left || box.y<a.top || box.x+box.width>a.right || box.y+box.height>a.bottom) throw new Error(`${rule.label} 超出内容安全边界，请精简文案。`);
  if(box.lines.length>rule.maxLines || box.width>rule.maxWidth) throw new Error(`${rule.label} 超出版面：最多 ${rule.maxLines} 行、宽 ${rule.maxWidth}，请精简文案；不会自动缩小字号。`);
 }
 const rendered=await page.locator('svg').evaluate(n=>n.outerHTML);
 fs.writeFileSync(path.join(outputDir,'poster.svg'),rendered);
 fs.writeFileSync(htmlPath,html.replace(svg,rendered));
 fs.writeFileSync(path.join(outputDir,'layout.json'),JSON.stringify(labels,null,2));
 const metrics = await page.locator('text').evaluateAll(nodes=>nodes.map(n=>({text:n.textContent,x:n.getBBox().x,width:n.getBBox().width})));
 if(metrics.some(n=>n.x+n.width>1368))throw new Error('Text exceeds poster width: '+JSON.stringify(metrics));
 await page.screenshot({path:path.join(outputDir,'poster.png'),fullPage:true});
 // Verify visible pixels, including glyph overhangs and SVG logo paths.
 const {data,info}=await require('sharp')(path.join(outputDir,'poster.png')).raw().toBuffer({resolveWithObject:true});
 const bg=c.background.slice(1).match(/../g).map(v=>parseInt(v,16));
 const a=rules.safeArea,tolerance=1;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
  const px=x*1368/info.width,py=y*1824/info.height;
  if(px>=a.left-tolerance&&px<=a.right+tolerance&&py>=a.top-tolerance&&py<=a.bottom+tolerance)continue;
  const i=(y*info.width+x)*info.channels;
  if(bg.some((v,j)=>Math.abs(data[i+j]-v)>12))throw new Error('内容超出安全边界，请调整排版');
 }

 await page.setViewportSize({width:684,height:912});
 await page.reload();
 await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:path.join(outputDir,'preview.png'),fullPage:true});
 console.log(JSON.stringify({fontLoaded:await page.evaluate(()=>document.fonts.check('700 150px Chakra')&&document.fonts.check('600 60px Plex')&&document.fonts.check('400 43px Plex')),metrics},null,2));
 } finally { await browser.close(); }
})().catch(error=>{console.error(error.message);process.exitCode=1;});
