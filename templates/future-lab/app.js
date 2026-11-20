const {content,layout,symbols}=window.POSTER_DATA;
const poster=document.querySelector('.poster'),stage=document.querySelector('.stage');
for(const [key,value] of Object.entries(layout.colors))poster.style.setProperty('--'+key,value);
const fields={experimentZh:content.experiment.zh,experimentEn:content.experiment.en,descriptionZh:content.description.zh,descriptionEn:content.description.en,projectEn:content.project.en,projectZh:content.project.zh,creditHandle:content.credit.handle,creditTags:content.credit.tags.join(' · ')};
for(const [name,box] of Object.entries(layout.fields)){const node=document.querySelector('.'+name);Object.assign(node.style,{left:box.x+'px',top:box.y+'px',width:box.width+'px',height:box.height+'px'});if(name in fields)node.firstElementChild.textContent=fields[name];}
for(const node of document.querySelectorAll('.photo,.shade')){const b=layout.photo;Object.assign(node.style,{left:b.x+'px',top:b.y+'px',width:b.width+'px',height:b.height+'px'});}
const image=document.querySelector('.photo img');image.src=content.image.src;image.style.objectPosition=content.image.position||'center';
const decor=document.querySelector('.decorations');
for(const tile of layout.decorations){const node=document.createElement('div');node.className='tile';node.style.cssText=`left:${tile.x}px;top:${tile.y}px;background:${layout.colors[tile.color]}`;if(tile.symbol)node.innerHTML=`<svg viewBox="${tile.symbol==='slash'?'132 12 60 60':'230 14 48 56'}">${symbols[tile.symbol]}</svg>`;decor.appendChild(node);}
function resize(){const w=document.body.classList.contains('export')?layout.width:Math.min(innerWidth-32,810);const scale=w/layout.width;poster.style.transform=`scale(${scale})`;stage.style.width=w+'px';stage.style.height=layout.height*scale+'px';}
addEventListener('resize',resize);resize();document.querySelector('#grid-toggle').onclick=()=>poster.classList.toggle('show-grid');
window.posterReady=(async()=>{await Promise.all([document.fonts.load('500 88px Plex'),document.fonts.load('600 68px Plex'),document.fonts.load('500 40px Chakra'),document.fonts.load('600 80px Chakra')]);await document.fonts.ready;if(!image.complete)await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('图片加载失败'));});if(!image.naturalWidth)throw Error('图片加载失败');})();
