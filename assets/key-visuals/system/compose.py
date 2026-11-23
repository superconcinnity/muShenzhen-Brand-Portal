#!/usr/bin/env python3
"""Compose and validate official theme extensions using only repository assets."""
import argparse, copy, json, math, re, sys
from pathlib import Path
import xml.etree.ElementTree as E
HERE=Path(__file__).resolve().parent
REPO=HERE.parents[2]
C=json.loads((HERE/'contract.json').read_text())
NS='http://www.w3.org/2000/svg';E.register_namespace('',NS)
def elem(tag,**attrs):return E.Element('{'+NS+'}'+tag,{k:str(v) for k,v in attrs.items()})
def check(c):
 def require(ok,msg):
  if not ok:raise ValueError(msg)
 def number(v):return type(v) in (int,float) and math.isfinite(v)
 def integer(v):return number(v) and int(v)==v
 require(c.get('theme') in C['themes'],'unknown theme')
 require(all(integer(c.get(k)) and c[k]>0 for k in ['width','height','cell']),'width/height/cell must be positive integers')
 require(c['width']%c['cell']==c['height']%c['cell']==0,'canvas must contain whole square cells; pad/recompose')
 cols,rows=c['width']//c['cell'],c['height']//c['cell'];theme=C['themes'][c['theme']]
 colors={**C['sharedColors'],'accent':theme['accent'],'support':theme['support']}
 require(c.get('background','ink') in colors,'unknown background color role')
 require(bool(c.get('logos')),'include canonical mushenzhen logo')
 require(any(l.get('family')=='mushenzhen' for l in c['logos']),'mushenzhen attribution/logo missing')
 for b in c.get('blocks',[]):
  require(all(integer(b.get(k)) for k in ['x','y','w','h']),'block must use integer grid units')
  require(b['w']>0 and b['h']>0 and b['x']>=0 and b['y']>=0 and b['x']+b['w']<=cols and b['y']+b['h']<=rows,'block outside canvas')
  require(b.get('color') in colors,'wrong-theme or unknown color role')
 for s in c.get('symbols',[]):
  require(s.get('name') in theme['symbols'],'wrong-theme symbol')
  require(integer(s.get('x')) and integer(s.get('y')) and 0<=s['x']<cols and 0<=s['y']<rows,'symbol must occupy a grid cell')
  require(integer(s.get('span',1)) and s.get('span',1)>0 and s['x']+s.get('span',1)<=cols and s['y']+s.get('span',1)<=rows,'symbol span must be a positive whole square of cells')
  require(s.get('color') in colors,'wrong-theme symbol color')
  for sy in range(s['y'],s['y']+s.get('span',1)):
   for sx in range(s['x'],s['x']+s.get('span',1)):
    bg=c.get('background','ink')
    for b in c.get('blocks',[]):
     if b['x']<=sx<b['x']+b['w'] and b['y']<=sy<b['y']+b['h']:bg=b['color']
    require(colors[s['color']]!=colors[bg],'invisible symbol: foreground equals background within its span')
 for l in c['logos']:
  require(l.get('family') in ['mushenzhen',c['theme']] and l.get('form','simple') in ['full','simple'] and l.get('variant','green') in ['green','white','black'],'invalid logo family/form/variant')
  require(all(number(l.get(k)) for k in ['x','y','width']) and l['width']>0,'invalid logo placement')
  require(not any(k in l for k in ['height','scaleX','scaleY','rotation']),'logo supports uniform width scaling only')
  p=REPO/'assets/logos'/l.get('form','simple')/f"{l['family']}-{l.get('form','simple')}-{l.get('variant','green')}.svg"
  require(p.exists(),'logo missing');r=E.parse(p).getroot();vb=list(map(float,r.get('viewBox').split()));h=l['width']*vb[3]/vb[2]
  require(l['x']>=0 and l['y']>=0 and l['x']+l['width']<=c['width'] and l['y']+h<=c['height'],'logo clipped')
 require(not c.get('slogan') or c['slogan']=='a city for makers','wrong slogan')
 return colors

def prefix_ids(root,prefix):
 ids={e.get('id'):prefix+e.get('id') for e in root.iter() if e.get('id')}
 for e in root.iter():
  for k,v in list(e.attrib.items()):
   if k=='id':e.set(k,ids[v])
   else:
    for a,b in ids.items():v=v.replace('url(#'+a+')','url(#'+b+')')
    e.set(k,v)
 return root

def render(c):
 colors=check(c);cell=c['cell'];theme=C['themes'][c['theme']]
 root=elem('svg',width=c['width'],height=c['height'],viewBox=f"0 0 {c['width']} {c['height']}",fill='none')
 meta=elem('metadata');meta.text=json.dumps(c,ensure_ascii=False);root.append(meta)
 root.append(elem('rect',x=0,y=0,width=c['width'],height=c['height'],fill=colors[c.get('background','ink')]))
 blocks=elem('g',id='grid-blocks',**{'shape-rendering':'crispEdges'});root.append(blocks)
 for b in c.get('blocks',[]):blocks.append(elem('rect',x=b['x']*cell,y=b['y']*cell,width=b['w']*cell,height=b['h']*cell,fill=colors[b['color']]))
 for i,s in enumerate(c.get('symbols',[])):
  art=E.parse((HERE/theme['strip']).resolve()).getroot();window=C['symbolWindows'][theme['symbols'].index(s['name'])]
  art.set('viewBox',' '.join(map(str,window)));art.set('x',str(s['x']*cell));art.set('y',str(s['y']*cell));art.set('width',str(cell*s.get('span',1)));art.set('height',str(cell*s.get('span',1)));art.set('overflow','hidden')
  for e in art.iter():
   for attr in ['fill','stroke']:
    if e.get(attr) in ['black','#000000']:e.set(attr,colors[s['color']])
  root.append(prefix_ids(art,f's{i}-'))
 for i,l in enumerate(c['logos']):
  p=REPO/'assets/logos'/l.get('form','simple')/f"{l['family']}-{l.get('form','simple')}-{l.get('variant','green')}.svg"
  art=E.parse(p).getroot();vb=list(map(float,art.get('viewBox').split()));art.set('x',str(l['x']));art.set('y',str(l['y']));art.set('width',str(l['width']));art.set('height',str(l['width']*vb[3]/vb[2]));root.append(prefix_ids(art,f'l{i}-'))
 if c.get('slogan'):
  t=elem('text',x=2*cell,y=c['height']-cell,fill=colors['green'],**{'font-family':'sans-serif','font-size':cell*.55});t.text=c['slogan'];root.append(t)
 return E.tostring(root,encoding='unicode')

def main():
 p=argparse.ArgumentParser();p.add_argument('config');p.add_argument('--out');p.add_argument('--verify-svg');a=p.parse_args();c=json.loads(Path(a.config).read_text());svg=render(c)
 if a.verify_svg and Path(a.verify_svg).read_text()!=svg:raise ValueError('SVG differs from checked config/canonical assets; re-render or inspect custom artwork separately')
 if a.out:Path(a.out).write_text(svg)
 print('PASS: square grid, official theme glyph/color roles, canonical uniform logos, content checks. Visual review still required.')
if __name__=='__main__':
 try:main()
 except (ValueError,KeyError,TypeError) as e:print('FAIL:',e,file=sys.stderr);sys.exit(1)
