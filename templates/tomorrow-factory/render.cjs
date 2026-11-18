const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const sharp=require('sharp'),{chromium}=require('playwright');
const root=__dirname,configPath=path.resolve(process.argv[2]||path.join(root,'content.json'));
const output=path.resolve(process.argv[3]||path.join(root,'output',path.basename(configPath,'.json')));
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const runAt=new Date().toISOString();
const isRecord=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function allowedKeys(value,keys,name){
 const unknown=Object.keys(value).filter(key=>!keys.includes(key));
 if(unknown.length)throw Error(`${name} 有未知字段：${unknown.join('、')}。请检查拼写，避免忽略你的修改。`);
}
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(path.join(output,'render-status.json'),JSON.stringify({status:'running',runAt},null,2));
 const config=JSON.parse(fs.readFileSync(configPath,'utf8'));
 if(!isRecord(config))throw Error('配置必须为JSON对象');
 allowedKeys(config,['theme','image','titleZh','titleEn','metadata'],'配置');
 if(!isRecord(config.image))throw Error('image 必须为包含src的对象');
 allowedKeys(config.image,['src','framing','position'],'image');
 if(typeof config.image.src!=='string'||!config.image.src.trim())throw Error('image.src 必须为非空图片路径');
 if(config.metadata!==undefined&&!isRecord(config.metadata))throw Error('metadata 必须为对象，或省略该字段');
 const themes={brown:{background:'#795E4B',foreground:'#DFFF2F'},blue:{background:'#5456BE',foreground:'#ACC0BF'}};
 if(typeof config.theme!=='string'||!Object.hasOwn(themes,config.theme))throw Error('theme 只能为 brown 或 blue');
 for(const key of ['titleZh','titleEn'])if(typeof config[key]!=='string'||!config[key].trim()||/[\r\n\t\u2028\u2029]/.test(config[key]))throw Error(key+' 必须为非空单行文字');
 const source=path.resolve(root,config.image?.src||'');
 if(!fs.existsSync(source)||!fs.statSync(source).isFile())throw Error('图片不存在：'+source);
 const positions=['centre','center','top','bottom','left','right','attention','entropy'];
 const position=config.image.position===undefined?'centre':config.image.position;
 if(!positions.includes(position))throw Error('不支持的 image.position');
 // original reproduces the supplied design; window fits new images to the visible photo window.
 const framing=config.image.framing===undefined?'window':config.image.framing;
 if(!['original','window'].includes(framing))throw Error('image.framing 只能为 original 或 window');
 const photoWidth=framing==='window'?2192:4003,photoHeight=framing==='window'?1760:2252;
 const sourceMetadata=await sharp(source).metadata();
 const photo=await sharp(source).rotate().resize(photoWidth,photoHeight,{fit:'cover',position}).png().toBuffer();
 let svg=fs.readFileSync(path.join(root,'assets/template.svg'),'utf8').replace('__PHOTO_DATA__','data:image/png;base64,'+photo.toString('base64'));
 if(framing==='window'){
  if(!svg.includes('M3509.56 -67.5625'))throw Error('照片窗口路径与模板版本不匹配');
  svg=svg.replace(/<path d="M3509\.56 -67\.5625[^"]*" fill="url\(#pattern0_1200_201\)"\/>/, '<path d="M2632 0H440V1760H2632V0Z" fill="url(#pattern0_1200_201)"/>');
 }
 const {background,foreground}=themes[config.theme];svg=svg.replaceAll('#795E4B',background).replaceAll('#DFFF2F',foreground);
 // All variable titles use the confirmed real font weights, including the default sample.

 const fontZh=fs.readFileSync(path.join(root,'assets/IBMPlexSansSC-Medium.woff2')).toString('base64');
 const fontEn=fs.readFileSync(path.join(root,'assets/ChakraPetch-SemiBold.ttf')).toString('base64');
 svg=svg.replace('<defs>',`<defs><style>@font-face{font-family:Plex;font-weight:500;src:url(data:font/woff2;base64,${fontZh})} @font-face{font-family:Chakra;font-weight:600;src:url(data:font/ttf;base64,${fontEn})}</style>`);
 const fields=[{key:'titleZh',id:'title-zh',x:110,y:2380,family:'Plex',weight:500},{key:'titleEn',id:'title-en',x:110,y:2600,family:'Chakra',weight:600}];
 for(const f of fields){
  const tag=`<g id="${f.id}"><text x="${f.x}" y="${f.y}" fill="${foreground}" font-family="${f.family}" font-size="200" font-weight="${f.weight}" style="white-space:pre">${escape(config[f.key])}</text></g>`;
  svg=svg.replace(new RegExp(`<g id="${f.id}">[\\s\\S]*?</g>`),tag);
 }
 fs.mkdirSync(output,{recursive:true});
 const svgPath=path.join(output,'poster.svg');fs.writeFileSync(svgPath,svg);
 const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>明日出厂</title><style>body{margin:0;background:#222}svg{display:block;width:2632px;height:3509px}</style>${svg}</html>`;
 const htmlPath=path.join(output,'poster.html');fs.writeFileSync(htmlPath,html);
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  const page=await browser.newPage({viewport:{width:2632,height:3509},deviceScaleFactor:1});
  await page.goto(pathToFileURL(htmlPath).href);await page.evaluate(async()=>{await Promise.all([document.fonts.load('500 200px Plex'),document.fonts.load('600 200px Chakra')]);await document.fonts.ready;if(!document.fonts.check('500 200px Plex')||!document.fonts.check('600 200px Chakra'))throw Error('品牌字体加载失败');await Promise.all([...document.querySelectorAll('svg image')].map(el=>new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=()=>reject(Error('图片加载失败'));i.src=el.getAttributeNS('http://www.w3.org/1999/xlink','href')})))});
  const checks=await page.evaluate(()=>({titles:['title-zh','title-en'].map(id=>{const group=document.getElementById(id),text=group.querySelector('text');let b=group.getBBox();if(text){const style=getComputedStyle(text),ctx=document.createElement('canvas').getContext('2d');ctx.font=style.font;const m=ctx.measureText(text.textContent);b={x:Number(text.getAttribute('x'))-m.actualBoundingBoxLeft,y:Number(text.getAttribute('y'))-m.actualBoundingBoxAscent,width:m.actualBoundingBoxLeft+m.actualBoundingBoxRight,height:m.actualBoundingBoxAscent+m.actualBoundingBoxDescent};}return{id,x:b.x,y:b.y,width:b.width,height:b.height,pass:b.x>=100&&b.x+b.width<=2400&&b.y>=2180&&b.y+b.height<=2640}})}));
  checks.status='passed';checks.runAt=runAt;checks.fonts={titleZh:{family:'IBM Plex Sans SC',weight:500},titleEn:{family:'Chakra Petch',weight:600}};checks.theme=config.theme;checks.canvas={width:2632,height:3509};checks.image={width:photoWidth,height:photoHeight,fit:'cover',position,framing};
  const oriented=sourceMetadata.autoOrient||sourceMetadata;
  checks.sourceImage={width:oriented.width,height:oriented.height};
  checks.warnings=[];
  if(oriented.width<photoWidth||oriented.height<photoHeight)checks.warnings.push('源图需放大，实际清晰度请看高清PNG确认；导出尺寸不等于原图清晰度。');
  const overflow=checks.titles.filter(t=>!t.pass);
  if(overflow.length)throw Error('标题超出可用区域：'+overflow.map(t=>`${t.id} 实际宽 ${Math.round(t.width)}px，右边界 ${Math.round(t.x+t.width)}px（最大2400px）`).join('；')+'。请保留完整名称记录，提炼真实展示短标题；保持200px字号与单行。');
  await page.locator('svg').first().screenshot({path:path.join(output,'poster.png')});
  await sharp(path.join(output,'poster.png')).resize(658).toFile(path.join(output,'preview.png'));
  fs.writeFileSync(path.join(output,'validation.json'),JSON.stringify(checks,null,2));
  fs.copyFileSync(configPath,path.join(output,'content.json'));
  fs.writeFileSync(path.join(output,'render-status.json'),JSON.stringify({status:'passed',runAt},null,2));console.log('已导出：'+output);console.log(JSON.stringify(checks));
 }finally{await browser.close()}
})().catch(e=>{try{fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'render-status.json'),JSON.stringify({status:'failed',runAt,message:e.message},null,2))}catch{}console.error(e.message);process.exitCode=1});
