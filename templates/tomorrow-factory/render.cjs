const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const sharp=require('sharp'),{chromium}=require('playwright');
const root=__dirname,configPath=path.resolve(process.argv[2]||path.join(root,'content.json'));
const output=path.resolve(process.argv[3]||path.join(root,'output',path.basename(configPath,'.json')));
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
(async()=>{
 const config=JSON.parse(fs.readFileSync(configPath,'utf8'));
 const themes={brown:{background:'#795E4B',foreground:'#DFFF2F'},blue:{background:'#5456BE',foreground:'#ACC0BF'}};
 if(!themes[config.theme])throw Error('theme 只能为 brown 或 blue');
 for(const key of ['titleZh','titleEn'])if(typeof config[key]!=='string'||!config[key].trim()||/[\r\n]/.test(config[key]))throw Error(key+' 必须为非空单行文字');
 const source=path.resolve(root,config.image?.src||'');
 if(!fs.existsSync(source)||!fs.statSync(source).isFile())throw Error('图片不存在：'+source);
 const positions=['centre','center','top','bottom','left','right','attention','entropy'];
 if(!positions.includes(config.image.position||'centre'))throw Error('不支持的 image.position');
 // One crop feeds the original normalized image pattern, under the original mosaic masks.
 const photo=await sharp(source).rotate().resize(4003,2252,{fit:'cover',position:config.image.position||'centre'}).png().toBuffer();
 let svg=fs.readFileSync(path.join(root,'assets/template.svg'),'utf8').replace('__PHOTO_DATA__','data:image/png;base64,'+photo.toString('base64'));
 const {background,foreground}=themes[config.theme];svg=svg.replaceAll('#795E4B',background).replaceAll('#DFFF2F',foreground);
 const defaults={titleZh:'华秋电子-江门制造工厂',titleEn:'HUAQIU ELECTRONICS'};
 // Default outlined titles are preserved exactly. Replacements use local brand fonts.
 const fontZh=fs.readFileSync(path.join(root,'assets/Plex-Regular.woff2')).toString('base64');
 const fontEn=fs.readFileSync(path.join(root,'assets/ChakraPetch-Regular.ttf')).toString('base64');
 svg=svg.replace('<defs>',`<defs><style>@font-face{font-family:Plex;src:url(data:font/woff2;base64,${fontZh})} @font-face{font-family:Chakra;src:url(data:font/ttf;base64,${fontEn})}</style>`);
 const fields=[{key:'titleZh',id:'title-zh',x:110,y:2380,family:'Plex'},{key:'titleEn',id:'title-en',x:110,y:2600,family:'Chakra'}];
 for(const f of fields)if(config[f.key]!==defaults[f.key]){
  const tag=`<g id="${f.id}"><text x="${f.x}" y="${f.y}" fill="${foreground}" font-family="${f.family}" font-size="200" font-weight="400" style="white-space:pre">${escape(config[f.key])}</text></g>`;
  svg=svg.replace(new RegExp(`<g id="${f.id}">[\\s\\S]*?</g>`),tag);
 }
 fs.mkdirSync(output,{recursive:true});
 const svgPath=path.join(output,'poster.svg');fs.writeFileSync(svgPath,svg);
 const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>明日出厂</title><style>body{margin:0;background:#222}svg{display:block;width:2632px;height:3509px}</style>${svg}</html>`;
 const htmlPath=path.join(output,'poster.html');fs.writeFileSync(htmlPath,html);
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  const page=await browser.newPage({viewport:{width:2632,height:3509},deviceScaleFactor:1});
  await page.goto(pathToFileURL(htmlPath).href);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('svg image')].map(el=>new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=()=>reject(Error('图片加载失败'));i.src=el.getAttributeNS('http://www.w3.org/1999/xlink','href')})))});
  const checks=await page.evaluate(()=>({titles:['title-zh','title-en'].map(id=>{const group=document.getElementById(id),text=group.querySelector('text');let b=group.getBBox();if(text){const style=getComputedStyle(text),ctx=document.createElement('canvas').getContext('2d');ctx.font=style.font;const m=ctx.measureText(text.textContent);b={x:Number(text.getAttribute('x'))-m.actualBoundingBoxLeft,y:Number(text.getAttribute('y'))-m.actualBoundingBoxAscent,width:m.actualBoundingBoxLeft+m.actualBoundingBoxRight,height:m.actualBoundingBoxAscent+m.actualBoundingBoxDescent};}return{id,x:b.x,y:b.y,width:b.width,height:b.height,pass:b.x>=100&&b.x+b.width<=2400&&b.y>=2180&&b.y+b.height<=2640}})}));
  checks.theme=config.theme;checks.canvas={width:2632,height:3509};checks.image={width:4003,height:2252,fit:'cover',position:config.image.position||'centre'};
  if(checks.titles.some(t=>!t.pass))throw Error('标题超出可用区域，请精简标题或明确调整排版；保持字号，不自动压缩字宽。'+JSON.stringify(checks.titles));
  await page.locator('svg').first().screenshot({path:path.join(output,'poster.png')});
  await sharp(path.join(output,'poster.png')).resize(658).toFile(path.join(output,'preview.png'));
  fs.writeFileSync(path.join(output,'validation.json'),JSON.stringify(checks,null,2));
  fs.copyFileSync(configPath,path.join(output,'content.json'));console.log('已导出：'+output);console.log(JSON.stringify(checks));
 }finally{await browser.close()}
})().catch(e=>{console.error(e.message);process.exitCode=1});
