const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require('playwright'),sharp=require('sharp');
const root=__dirname,configPath=path.resolve(process.argv[2]||path.join(root,'content.json'));
const output=path.resolve(process.argv[3]||path.join(root,'output',path.basename(configPath,'.json'))),runAt=new Date().toISOString();
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const labels={'image':'视觉图设置','image.src':'视觉图','event':'活动名称','event.zh':'活动名称中文','event.en':'活动名称英文','description':'一句话介绍','description.zh':'一句话介绍中文','description.en':'一句话介绍英文','organizer':'组织机构名称','organizer.zh':'活动组织机构名称中文','organizer.en':'活动组织机构名称英文'};
const label=name=>labels[name]||name;
function keys(value,allowed,name){if(!isObject(value))throw Error('请补充'+label(name)+'（'+name+'），格式参照content-template.json。');const bad=Object.keys(value).filter(k=>!allowed.includes(k));if(bad.length)throw Error(label(name)+'中的字段可能拼错了：'+bad.join('、')+'。请按content-template.json填写。');}
function line(value,name){if(typeof value!=='string'||!value.trim())throw Error('请补充'+label(name)+'（'+name+'）。');if(/[\r\n\t\u2028\u2029]/.test(value))throw Error(label(name)+'请填写为一行文字，不要手动换行或插入制表符。');}
const placeholders={'event.zh':['活动名称中文'],'event.en':['EVENT NAME'],'description.zh':['用一句话说明本次活动的内容。'],'description.en':['Describe the event in one clear sentence.'],'organizer.zh':['活动组织机构中文名称','组织机构中文名称'],'organizer.en':['ORGANIZER NAME']};
const json=x=>JSON.stringify(x).replaceAll('<','\\u003c');
(async()=>{
 fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'render-status.json'),JSON.stringify({status:'running',runAt}));
 if(!fs.existsSync(configPath))throw Error('找不到配置文件：'+configPath+'。请从content-template.json复制一份新配置。');
 let content;try{content=JSON.parse(fs.readFileSync(configPath,'utf8'));}catch{throw Error('配置文件JSON格式不正确，请检查逗号、引号和括号。');}
 keys(content,['image','event','description','organizer','metadata'],'配置');
 keys(content.image,['src','position'],'image');line(content.image.src,'image.src');
 const positions=['center','top','bottom','left','right'];const position=content.image.position===undefined?'center':content.image.position;if(!positions.includes(position))throw Error('image.position只能为center/top/bottom/left/right');content.image.position=position;
 for(const name of ['event','description','organizer']){keys(content[name],['zh','en'],name);for(const lang of ['zh','en'])line(content[name][lang],name+'.'+lang);}
 if(content.metadata!==undefined&&!isObject(content.metadata))throw Error('metadata必须为对象');
 const source=path.resolve(root,content.image.src);if(!fs.existsSync(source)||!fs.statSync(source).isFile())throw Error('找不到视觉图：'+content.image.src+'。请将原图放入assets/，再填写相对此模板目录的路径。');
 let imageBuffer;try{imageBuffer=await sharp(source).rotate().webp({quality:96}).toBuffer();}catch{throw Error('视觉图无法读取，请确认文件完整，并使用JPG、PNG或WebP等常见格式。');}const meta=await sharp(imageBuffer).metadata();
 const layout=JSON.parse(fs.readFileSync(path.join(root,'layout.json')));
 for(const [name,box] of Object.entries(layout.fields)){if(!Object.values(box).every(v=>Number.isInteger(v)&&v%layout.unit===0)||box.x<0||box.y<0||box.x+box.width>layout.width||box.y+box.height>layout.height)throw Error('版块不符合网格：'+name);}
 const vector=fs.readFileSync(path.join(root,'assets/brand-symbols.svg'),'utf8');const paths=[...vector.matchAll(/<path\b[^>]*\/>/g)].map(x=>x[0].replaceAll('fill="black"','fill="#212121"'));
 const data={content,layout,symbols:{slash:paths[0],hourglass:paths.slice(1,4).join('')}};
 // Local preview reads project-relative resources. Exports embed their own photo and fonts.
 if(!process.argv[3])fs.writeFileSync(path.join(root,'data.js'),'window.POSTER_DATA='+json(data)+';');
 const embedded=JSON.parse(JSON.stringify(data));embedded.content.image.src='data:image/webp;base64,'+imageBuffer.toString('base64');
 let css=fs.readFileSync(path.join(root,'style.css'),'utf8');css=css.replace(/url\('([^']+)'\)/g,(_,file)=>{const mime=file.endsWith('.woff2')?'font/woff2':'font/ttf';return`url(data:${mime};base64,${fs.readFileSync(path.join(root,file)).toString('base64')})`;});
 let html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>').replace('<script src="data.js"></script>','<script>window.POSTER_DATA='+json(embedded)+';</script>').replace('<script src="app.js"></script>','<script>'+fs.readFileSync(path.join(root,'app.js'),'utf8')+'</script>');
 const htmlPath=path.join(output,'poster.html');fs.writeFileSync(htmlPath,html);
 let browser;try{browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});}catch{throw Error('浏览器未就绪。请先执行npm run setup；已有Chrome时，可按README设置CHROME_PATH。');}
 try{
  const page=await browser.newPage({viewport:{width:1080,height:1440},deviceScaleFactor:2});await page.goto(pathToFileURL(htmlPath).href);
  await page.evaluate(async()=>{document.body.classList.add('export');dispatchEvent(new Event('resize'));await window.posterReady;});
  const checks=await page.evaluate(()=>{
   const fields=[...document.querySelectorAll('.field')].map(node=>{const b=node.getBoundingClientRect(),t=node.firstElementChild.getBoundingClientRect();return{name:node.classList[1],width:t.width,maxWidth:b.width,pass:t.left>=b.left-.1&&t.right<=b.right+.1&&t.top>=b.top-.1&&t.bottom<=b.bottom+.1};});
   const intersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
   const collisions=[];for(const field of document.querySelectorAll('.field'))for(const tile of document.querySelectorAll('.tile'))if(intersects(field.firstElementChild.getBoundingClientRect(),tile.getBoundingClientRect()))collisions.push(field.classList[1]);
   return{fields,collisions,fonts:['500 88px Plex','600 68px Plex','500 40px Chakra','600 80px Chakra'].every(font=>document.fonts.check(font))};
  });
  const overflow=checks.fields.filter(f=>!f.pass);if(!checks.fonts)throw Error('品牌字体加载失败');if(overflow.length){const names=overflow.map(x=>label(x.name.replace(/(Zh|En)$/,m=>m==='Zh'?'.zh':'.en')));const organization=overflow.some(x=>x.name.startsWith('organizer'));throw Error(names.join('、')+'太长，当前区域放不下。'+(organization?'请提供组织机构确认过的简称，或明确调整版式；不要擅自截断机构名称。':'请提炼文案后重试，保持字号与单行。'));}if(checks.collisions.length)throw Error('文字与装饰重叠，请精简以下内容：'+checks.collisions.map(x=>label(x.replace(/(Zh|En)$/,m=>m==='Zh'?'.zh':'.en'))).join('、')+'。');
  checks.status='passed';checks.runAt=runAt;checks.canvas={width:1080,height:1440,exportScale:2};checks.image={width:meta.width,height:meta.height,position};checks.warnings=[];
  const pending=Object.entries(placeholders).filter(([name,values])=>{const [group,lang]=name.split('.');return values.some(value=>value.toLowerCase()===content[group][lang].trim().toLowerCase());}).map(([name])=>label(name));
  if(pending.length)checks.warnings.push('仍有占位文字：'+pending.join('、')+'。请提供正式内容后再交付。');
  if(source===path.join(root,'assets/sample-photo.webp'))checks.warnings.push('当前使用AI清理的演示照片，正式制作请确认替换为活动原图。');
  if(meta.width<2160||meta.height<1680)checks.warnings.push('图片会放大用于2倍导出，请查看高清PNG确认清晰度。');
  await page.locator('.poster').screenshot({path:path.join(output,'poster.png')});await page.evaluate(()=>document.querySelector('.poster').classList.add('show-grid'));await page.locator('.poster').screenshot({path:path.join(output,'grid-proof.png')});
  for(const name of ['poster','grid-proof'])await sharp(path.join(output,name+'.png')).resize(648).toFile(path.join(output,name==='poster'?'preview.png':'grid-preview.png'));
  fs.writeFileSync(path.join(output,'validation.json'),JSON.stringify(checks,null,2));fs.copyFileSync(configPath,path.join(output,'content.json'));fs.writeFileSync(path.join(output,'render-status.json'),JSON.stringify({status:'passed',runAt},null,2));console.log('已生成海报。');console.log('高清PNG：'+path.join(output,'poster.png'));console.log('快速预览：'+path.join(output,'preview.png'));for(const warning of checks.warnings)console.log('待确认：'+warning);
 }finally{await browser.close()}
})().catch(e=>{try{fs.writeFileSync(path.join(output,'render-status.json'),JSON.stringify({status:'failed',runAt,message:e.message},null,2))}catch{}console.error('本次未生成新成品：'+e.message);console.error('请勿交付该目录中上次生成的图片。');process.exitCode=1});
