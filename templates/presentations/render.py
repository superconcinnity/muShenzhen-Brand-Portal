#!/usr/bin/env python3
"""Generate an offline HTML deck from content.json; Python standard library only."""
import argparse,html,json,re,shutil
from pathlib import Path

def render(content_path,output):
 root=Path(__file__).resolve().parent
 content=json.loads(content_path.read_text(encoding='utf-8'))
 brand=content.get('brand')
 if brand not in ('mushenzhen','garage','human-flourishing'):raise ValueError('brand 必须为 mushenzhen、garage 或 human-flourishing')
 folder=root/brand
 if output.resolve().parent==folder:raise ValueError('请输出到新的目录，避免覆盖模板')
 spec=json.loads((folder/'template.json').read_text());layouts={l['id']:l for l in spec['layouts']}
 if not isinstance(content.get('slides'),list) or not content['slides']:raise ValueError('slides 必须为非空列表')
 sections=[];options=[]
 for i,s in enumerate(content['slides']):
  if s.get('layout') not in layouts:raise ValueError(f'第 {i+1} 页：版式不存在')
  layout=layouts[s['layout']];values=s.get('content',{});allowed={f['key'] for f in layout['fields']}
  if set(values)-allowed:raise ValueError(f'第 {i+1} 页包含未知字段：{set(values)-allowed}')
  fields=[]
  for f in layout['fields']:
   value=values.get(f['key'],'')
   if not isinstance(value,str):raise ValueError('字段内容必须为字符串')
   if len(value)>f['maxCharacters'] or len(value.splitlines())>f['maxLines']:raise ValueError(f'第 {i+1} 页 {f["key"]} 太长，请精简或拆页（建议最多 {f["maxCharacters"]} 字 / {f["maxLines"]} 行）')
   style=f"left:{f['x']}px;top:{f['y']}px;width:{f['width']}px;height:{f['height']}px;font-size:{f['fontSize']}px;color:{f['color']};text-align:{f['align']}"
   fields.append(f'<div class="field" data-field="{f["key"]}" style="{style}">{html.escape(value)}</div>')
  sections.append(f'<section class="slide" data-layout="{layout["id"]}" aria-label="{html.escape(layout["name"])}"><img class="brand-bg" src="{layout["background"]}" alt="">'+''.join(fields)+'</section>')
  options.append(f'<option value="{i}">{i+1}. {html.escape(layout["name"])}</option>')
 text=(folder/'index.html').read_text()
 text=re.sub(r'(?<=<div class="deck-stage">).*?(?=</div></main>)',lambda m:''.join(sections),text,flags=re.S)
 text=re.sub(r'(?<=aria-label="选择版式">).*?(?=</select>)',lambda m:''.join(options),text,flags=re.S)
 output.parent.mkdir(parents=True,exist_ok=True)
 for asset in ['assets','fonts']:shutil.copytree(folder/asset,output.parent/asset,dirs_exist_ok=True)
 output.write_text(text,encoding='utf-8')
 print(f'已生成 {len(sections)} 页：{output}')
if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('content',type=Path);parser.add_argument('output',type=Path);args=parser.parse_args()
 try:render(args.content,args.output)
 except (ValueError,KeyError) as e:parser.error(str(e))
