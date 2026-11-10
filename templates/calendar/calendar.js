// Fixed artwork template. Edit content.js for ordinary content changes.
const calendar = CALENDAR_CONTENT;

const ns = 'http://www.w3.org/2000/svg';
const svg = document.querySelector('#calendar');
svg.setAttribute('font-family','Arial, Helvetica, sans-serif');
function add(tag, attributes, parent=svg) {
  const e=document.createElementNS(ns,tag);
  Object.entries(attributes).forEach(([k,v])=>e.setAttribute(k,v));
  parent.append(e); return e;
}
add('style',{}).textContent = "@font-face{font-family:'Chakra Petch';src:url('assets/ChakraPetch-Bold.ttf') format('truetype');font-weight:700;font-style:normal;}";
function rect(x,y,width,height,fill,extra={}) {return add('rect',{x,y,width,height,fill,...extra});}
function text(content,x,y,size=26,fill='#000',weight=700,lineHeight=26) {
  const t=add('text',{x,y,fill,'font-size':size,'font-weight':weight,'font-family':weight===700?'Chakra Petch, Arial, sans-serif':'Arial, Helvetica, sans-serif'});
  content.split('\n').forEach((line,i)=>{const s=add('tspan',{x,dy:i?lineHeight:0},t);s.textContent=line});return t;
}
function photo(name,x,y,w,h){ add('image',{href:`assets/${name}.webp`,x,y,width:w,height:h,preserveAspectRatio:'xMidYMid slice'}); }
function dateAt(offset){const d=new Date(`${calendar.start}T12:00:00`);d.setDate(d.getDate()+offset);return d;}
function label(d){return `${d.getMonth()+1}.${String(d.getDate()).padStart(2,'0')}`;}
rect(0,0,1586,1547,'#FFFFFF');
add('image',{href:'assets/mushenzhen.svg',x:47,y:48,width:203,height:75});
// Event information: outlined brand type below the logo.
['11.29 — 12.18','OCT-LOFT','C2'].forEach((line,i)=>{
 const info=text(line,47,194.23799934387208+i*48,33,'#FFFFFF',700);
 info.setAttribute('stroke','#000000');
 info.setAttribute('stroke-width','1.3');
 info.setAttribute('stroke-linejoin','round');
});
const left=322, gridTop=151, cw=174, rh=190;
'MTWTFSS'.split('').forEach((s,i)=>text(s,left+cw*i+cw/2,113,76,'#ACC0BF',700).setAttribute('text-anchor','middle'));
function themeLabel(key,y,h,range){
 const t=calendar.themes[key];
 rect(46,y+20,1,h-36,t.color);
 text(t.title,61,y+64,key==='intelligence'?29:38,t.ink,700,39);
 text(range,61,y+h-44,20,'#000',400);
 rect(61,y+h-25,221,15,t.color);
}
themeLabel('machines',gridTop+rh,rh,'11.30–12.06');
themeLabel('life',gridTop+rh*2,rh,'12.07–12.13');
themeLabel('intelligence',gridTop+rh*3,rh,'12.14–12.18');
// Monday-first calendar: opening Sunday occupies the final cell of row one.
for(let i=0;i<28;i++){
 const row=Math.floor(i/7),col=i%7;
 const x=left+col*cw,y=gridTop+row*rh;
 const offset=i-6,entry=offset>=0?calendar.days[offset]:null;
 if(entry){
  const date=dateAt(offset);
  const [title,,feature,status]=entry;
  const t=row===0||offset===19?{color:'#DFFF2F',ink:'#000'}:calendar.themes[['machines','life','intelligence'][row-1]];
  if(feature||row===0)rect(x+4,y+1,cw-4,rh-2,t.color);
  else if(row>0)rect(x+4,y+rh-36,cw-4,19,t.color);
  const titleSize=26;
  const heading=text(title,x+17,y+35,titleSize,feature||row===0?'#000':(col>=5?'#000':t.ink),700,titleSize+3);
  heading.setAttribute('data-max-width',cw-30);
  heading.setAttribute('data-title-kind','calendar');
  if(status)text(status,x+17,y+rh-49,11,'#000',400);
  text(date.getDate()===1||offset<=1?label(date):String(date.getDate()),x+17,y+rh-19,26,'#000');
 }
 rect(x,y,7,rh,'#ACC0BF',{'fill-opacity':'.48'});
 rect(x,y,cw,rh,'none',{stroke:'#ACC0BF','stroke-width':1.25});
}
rect(0,952,1586,595,'#DFFF2F');
const xs=[48,296,545,793,1042,1267,1539], y1=1002,y2=1251,bottom=1498;
function tile(col,row,caption,title,yellow=false){const x=xs[col],y=row?y2:y1,w=xs[col+1]-x,h=(row?bottom:y2)-y;
 rect(x,y,w,h,yellow?'#ACC0BF':'#FFFFFF',{stroke:'#b0b29d','stroke-width':2});
 text(caption,x+12,y+46,24,'#000',400);
 const lines=title.split('\n').length;const heading=text(title,x+12,y+h-25-(lines-1)*35,32,'#000',700,35);heading.setAttribute('data-max-width',w-24);heading.setAttribute('data-title-kind','extra');
}
// Supplementary activities, outside the theme headlines.
EXTRA_CARDS.forEach(args=>tile(...args));



photo(PHOTO_ASSETS.body,xs[3],y1,xs[4]-xs[3],249);


photo(PHOTO_ASSETS.outdoor,xs[0],y2,xs[2]-xs[0],247);


photo(PHOTO_ASSETS.city,xs[4],y2,xs[5]-xs[4],247);

text('OPEN PROGRAMME · DATES & FORMATS MAY EVOLVE · PHOTOS FOR ATMOSPHERE',48,1530,16,'#000',400);
// Titles are edited to fit at fixed sizes: 26px calendar, 32px supplementary cards.
// Full daily records remain in sources/schedule.json; never shrink individual titles.
