const {content,symbols,grid}=window.POSTER_DATA;
if(content.testOnly){const note=document.createElement('div');note.className='test-note';note.textContent='模板测试 · 非品牌合作';document.querySelector('.poster').appendChild(note);}
for(const node of document.querySelectorAll('[data-field]'))node.textContent=content[node.dataset.field];
const poster=document.querySelector('.poster'),stage=document.querySelector('.stage');
// Same 20px unit / 180px column for all geometry. Decoration subdivision = 3 units.
const unit=grid.unit,margin=grid.margin,column=(grid.width-2*margin)/grid.columns,subgrid=grid.decorationStepUnits*unit;
for(const [key,value] of Object.entries({'unit':unit,'margin':margin,'column':column,'canvas-width':grid.width,'canvas-height':grid.height}))poster.style.setProperty('--'+key,value+'px');
for(const [name,area] of Object.entries({...grid.areas,focus:content.image.highlight})){
 const node=document.querySelector(name==='footer'?'footer':'.'+name);
 node.style.gridColumn=`${area.column} / span ${area.span}`;
 node.style.gridRow=`${area.row} / span ${area.rows}`;
}
for(const svg of document.querySelectorAll('.poster > svg'))svg.setAttribute('viewBox',`0 0 ${grid.width} ${grid.height}`);
const x=col=>margin+col*column,y=row=>row*unit;
const focusArea=content.image.highlight;
const focusBox={x:x(focusArea.column-1),y:y(focusArea.row-1),width:focusArea.span*column,height:focusArea.rows*unit};
const image=content.image,p=image.placement;
const background=document.querySelector('.background'),sharpPhoto=document.querySelector('.sharp-photo');
background.style.backgroundColor=image.baseColor||'#141414';
sharpPhoto.parentElement.style.backgroundColor=image.baseColor||'#141414';
background.style.backgroundImage=`url(${JSON.stringify(image.src)})`;
background.style.backgroundPosition=`${p.x}px ${p.y}px`;
background.style.backgroundSize=`${p.width}px ${p.height}px`;
sharpPhoto.style.backgroundImage=`url(${JSON.stringify(image.src)})`;
sharpPhoto.style.backgroundSize=`${p.width}px ${p.height}px`;
Object.assign(sharpPhoto.style,{left:(p.x-focusBox.x-2)+'px',top:(p.y-focusBox.y-2)+'px',width:p.width+'px',height:p.height+'px'});
const guideStartX=focusBox.x+focusBox.width*image.anchor.x;
const guideStartY=focusBox.y+focusBox.height*image.anchor.y;

// Foreground polygons are manually annotated in source-image normalized coordinates.
const foreground=(content.decoration?.foregroundPolygons||[]).map(poly=>poly.map(([u,v])=>[p.x+u*p.width,p.y+v*p.height]));
function insidePolygon(px,py,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
 const [xi,yi]=poly[i],[xj,yj]=poly[j];if(((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi))inside=!inside;
}return inside;}
function edgeDistance(px,py,poly){let min=Infinity;for(let i=0;i<poly.length;i++){
 const a=poly[i],b=poly[(i+1)%poly.length],dx=b[0]-a[0],dy=b[1]-a[1];
 const t=Math.max(0,Math.min(1,((px-a[0])*dx+(py-a[1])*dy)/(dx*dx+dy*dy||1)));
 min=Math.min(min,Math.hypot(px-a[0]-t*dx,py-a[1]-t*dy));
}return min;}
let marks='';
for(let row=0,py=4*unit;py<=54*unit;row++,py+=subgrid){
 for(let col=0,px=margin;px<=x(6);col++,px+=subgrid){
  const topBand=py<focusBox.y-unit;
  const sideBand=py>=focusBox.y-unit&&py<=focusBox.y+focusBox.height+3*unit&&(px<focusBox.x||px>focusBox.x+focusBox.width);
  const lowerLeft=py>=focusBox.y+focusBox.height+4*unit&&py<=y(53)&&px<=x(2);
  const decor=content.decoration;
  if(decor){
   if(decor.mode==='none')continue;
   const pad=decor.mode==='surround'?2*unit:unit;
   const inRect=(r)=>px>=r.x-pad&&px<=r.x+r.width+pad&&py>=r.y-pad&&py<=r.y+r.height+pad;
   const title=grid.areas.product;
   if(inRect(focusBox)||inRect({x:x(title.column-1),y:y(title.row-1),width:title.span*column,height:title.rows*unit})||(decor.exclusions||[]).some(inRect))continue;
   if(decor.mode==='sparse'&&(row+col)%3!==0)continue;
   if(decor.mode==='surround'){
    if(!foreground.length)throw Error('Surround mode requires manually annotated foreground polygons');
    if(decor.backgroundExtent!=='canvas'&&(px<p.x||px>p.x+p.width||py<p.y||py>p.y+p.height))continue;
    if(foreground.some(poly=>insidePolygon(px,py,poly)))continue;
    const distance=Math.min(...foreground.map(poly=>edgeDistance(px,py,poly)));
    const buffer=decor.buffer??40,range=decor.range??360;
    if(distance<buffer+8||distance>range)continue;
    const band=distance<buffer+100?1:distance<buffer+220?2:3;
    if((row+col)%band!==0)continue;
   }
  }else if(!topBand&&!sideBand&&!lowerLeft)continue;
  // Repeating six-cell rhythm, rather than a random mix.
  const hourglass=content.decoration ? ((Math.floor(row-2*Math.sin(col*Math.PI/9))+60)%6<2) : (col+Math.floor(row/2))%6<2;
  const scale=hourglass?.22:.15;
  marks+=`<g transform="translate(${px} ${py}) scale(${scale}) translate(${hourglass?'-254 -42':'-161.5355 -41.53565'})" opacity="${(hourglass?.6:.36)*(content.decoration?.intensity??1)}">${hourglass?symbols.hourglass:symbols.slash}</g>`;
 }
}
document.querySelector('.ornaments').innerHTML=marks;
let handles='';for(const px of [focusBox.x,focusBox.x+focusBox.width/2,focusBox.x+focusBox.width])for(const py of [focusBox.y,focusBox.y+focusBox.height])handles+=`<rect x="${px-8}" y="${py-8}" width="16" height="16" fill="#DFFF2F"/>`;
const titleArea=grid.areas.product;
const guideEndX=x(titleArea.column-1+titleArea.span/2);
const guideEndY=y(titleArea.row-1)-grid.guide.titleGapUnits*unit;
const guideElbowY=guideEndY-grid.guide.lastLegUnits*unit;
document.querySelector('.annotations').innerHTML=`<g fill="none" stroke="#DFFF2F" stroke-width="1"><path d="M${guideStartX} ${guideStartY}V${guideElbowY}H${guideEndX}V${guideEndY}"/><circle cx="${guideStartX}" cy="${guideStartY}" r="12"/><circle cx="${guideEndX}" cy="${guideEndY}" r="2" fill="#DFFF2F"/></g>${handles}`;
function resize(){const width=document.body.classList.contains('export')?grid.width:Math.min(innerWidth-32,930);const scale=width/grid.width;poster.style.transform=`scale(${scale})`;stage.style.width=width+'px';stage.style.height=grid.height*scale+'px';}
document.querySelector('#grid-toggle').onclick=()=>{const on=poster.classList.toggle('show-grid');document.querySelector('#grid-toggle').textContent=on?'隐藏网格':'显示网格';};
addEventListener('resize',resize);resize();
window.posterReady=document.fonts.ready.then(()=>{
 const series=document.querySelector('.series');
 const value=series.textContent;
 const ctx=document.createElement('canvas').getContext('2d');
 ctx.font='400 94px Chakra';
 const letters=Array.from(value);
 series.setAttribute('aria-label',value);
 series.textContent='';
 letters.forEach((letter,index)=>{
  const metrics=ctx.measureText(letter),cell=document.createElement('span');
  cell.setAttribute('aria-hidden','true');
  let width=metrics.width,shift=0;
  if(index===0){shift=metrics.actualBoundingBoxLeft;width+=shift;}
  if(index===letters.length-1)width=metrics.actualBoundingBoxRight;
  cell.style.width=width+'px';
  const glyph=document.createElement('span');glyph.textContent=letter;glyph.style.left=shift+'px';
  cell.appendChild(glyph);series.appendChild(cell);
 });
 return {unit,column,margin};
});
