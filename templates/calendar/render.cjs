// npm install --no-save playwright; then: node render.cjs
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const checkOnly=process.argv.includes('--check');
(async()=>{
 let browser;
 try {browser=await chromium.launch({headless:true});}
 catch {browser=await chromium.launch({headless:true,channel:'chrome'});}
 try {
 const out=path.join(__dirname,'output');fs.mkdirSync(out,{recursive:true});
 const page=await browser.newPage({viewport:{width:1586,height:1640},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.join(__dirname,'index.html'));await page.evaluate(()=>document.fonts.ready);
 if(!checkOnly)await page.locator('#calendar').screenshot({path:path.join(out,'calendar.png')});
 const serialized=await page.locator('#calendar').evaluate(e=>e.outerHTML);
 const embedded=serialized.replace('assets/ChakraPetch-Bold.ttf', 'data:font/ttf;base64,'+fs.readFileSync(path.join(__dirname,'assets/ChakraPetch-Bold.ttf')).toString('base64')).replace(/href="assets\/([^\"]+)"/g,(_,name)=>{const ext=path.extname(name);const mime={'.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'}[ext];if(!mime)throw Error('Unsupported image: '+name);return `href="data:${mime};base64,${fs.readFileSync(path.join(__dirname,'assets',name)).toString('base64')}"`});
 if(!checkOnly)fs.writeFileSync(path.join(out,'calendar.svg'),embedded);
 await page.setViewportSize({width:390,height:844});if(!checkOnly)await page.screenshot({path:path.join(out,'mobile-preview.png'),fullPage:true});
 const report=await page.evaluate(()=>({wrongFontSizes:[...document.querySelectorAll('[data-title-kind]')].filter(e=>Number(e.getAttribute('font-size'))!==(e.dataset.titleKind==='calendar'?26:32)).map(e=>e.textContent),supportedFrame:calendar.start==='2026-11-29'&&calendar.end==='2026-12-18',titleOverflows:[...document.querySelectorAll('[data-max-width]')].filter(e=>Math.max(...[...e.querySelectorAll('tspan')].map(t=>t.getComputedTextLength()))>Number(e.dataset.maxWidth)+.5).map(e=>e.textContent),brandFontLoaded:document.fonts.check('700 26px "Chakra Petch"'),days:calendar.days.length,start:label(dateAt(0)),end:label(dateAt(19)),firstWeekday:dateAt(0).getDay(),lastWeekday:dateAt(19).getDay(),horizontalOverflow:document.documentElement.scrollWidth>innerWidth}));
 if(report.wrongFontSizes.length||!report.supportedFrame||report.titleOverflows.length||!report.brandFontLoaded||errors.length||report.days!==20||report.firstWeekday!==0||report.lastWeekday!==5||report.horizontalOverflow)throw Error(JSON.stringify({errors,report}));
 await page.setViewportSize({width:1586,height:1547});
 await page.setContent('<img style="width:100%;display:block" id="export">');
 await page.locator('#export').evaluate((e,svg)=>{e.src='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg)))},embedded);
 await page.locator('#export').evaluate(e=>e.decode());
 fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify({errors,...report},null,2));
 console.log(JSON.stringify({errors,...report,export:'Standalone SVG with embedded images; PNG 1586 × 1547'}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
