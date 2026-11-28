"""Create 1080 px V3 event covers from a single JSON object or an array."""
import argparse
import base64
import json
import os
import re
import shutil
import subprocess
import tempfile
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from pathlib import Path
from xml.etree import ElementTree as ET
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent
FONTS = ROOT / 'assets/fonts'
THEMES = json.loads((ROOT / 'themes.json').read_text(encoding='utf-8'))
LOGO = re.sub(r'^.*?<svg[^>]*>|</svg>\s*$', '', (ROOT / 'assets/wordmark.svg').read_text(), flags=re.S)
GREEN, DARK = '#DFFF2F', '#212121'
CST = timezone(timedelta(hours=8))
WEEK = 'MON TUE WED THU FRI SAT SUN'.split()
NATIVE = bool(shutil.which('hb-view') and shutil.which('rsvg-convert'))


@lru_cache(maxsize=512)
def shape(text, chinese, size):
    font = FONTS / ('IBMPlexSansSC-SemiBold.otf' if chinese else 'ChakraPetch-Bold.ttf')
    if not NATIVE:
        from PIL import ImageFont
        return ImageFont.truetype(str(font), size).getlength(text), ''
    raw = subprocess.check_output(['hb-view', '--margin=0', '--background=none', '--logical',
                                   f'--font-size={size}', '--output-format=svg', str(font), '--', text])
    root = ET.fromstring(raw)
    paths = {g.get('id'): g.find('{*}path').get('d') for g in root.iterfind('.//{*}g')
             if g.find('{*}path') is not None}
    ink = []
    for use in root.iterfind('.//{*}use'):
        key = use.get('{http://www.w3.org/1999/xlink}href')[1:]
        if key in paths:
            ink.append(f'<path transform="translate({use.get("x")} 0)" d="{paths[key]}"/>')
    if not ink and text.strip():
        raise ValueError('hb-view did not produce glyph outlines; use the documented tool versions')
    return float(root.get('width')), ''.join(ink)


def local_time(value):
    stamp = datetime.fromisoformat(value.replace('Z', '+00:00'))
    if stamp.tzinfo is None:
        raise ValueError('Supply a timezone offset in start and end')
    return stamp.astimezone(CST)


def draw(event, config_dir, out):
    key = event['key']
    theme = THEMES[event['theme']]
    if event.get('ceremony') and event['theme'] != 'main':
        raise ValueError('ceremony is reserved for the opening ceremony')
    image = ROOT / ('assets/art/ceremony.png' if event.get('ceremony') else theme['picture'])
    if event.get('image'):
        image = config_dir / event['image']
    data = image.read_bytes()
    if data.startswith(b'\xff\xd8\xff'):
        mime = 'jpeg'
    elif data.startswith(b'\x89PNG\r\n\x1a\n'):
        mime = 'png'
    else:
        raise ValueError(f'Expected JPEG or PNG: {image}')
    mode = event.get('image_fit', 'slice')
    bg = event.get('image_background', DARK)
    if mode not in ('slice', 'meet') or not re.fullmatch(r'white|#[0-9a-fA-F]{6}', bg):
        raise ValueError('Use slice or meet and a hex image background')
    start, end = local_time(event['start']), local_time(event['end'])
    if end <= start:
        raise ValueError('End time must follow start time')
    lines = event['title_en']
    if not isinstance(lines, list) or len(lines) not in (1, 2) or not all(
            isinstance(line, str) and line.strip() and '\n' not in line for line in lines):
        raise ValueError('Supply one or two English title lines')
    ink = theme['ink']
    common = ['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1080" height="1080" viewBox="0 0 1080 1080">',
              f'<title>{escape(event["full_title"])}</title>', '<rect width="1080" height="1080" fill="#212121"/>',
              f'<g id="wordmark" transform="translate(34 24) scale(.84)">{LOGO}</g>',
              f'<g id="picture-window"><rect x="0" y="82" width="1080" height="478" fill="{bg}"/>',
              f'<image id="replace-event-image" x="0" y="82" width="1080" height="478" preserveAspectRatio="xMidYMid {mode}" xlink:href="data:image/{mime};base64,{base64.b64encode(data).decode()}"/>',
              '</g>', f'<rect y="560" width="1080" height="400" fill="{theme["panel"]}"/>']
    editable, outlines = common.copy(), common.copy()

    def label(field, x, y, text, size, cap, color=ink, chinese=False, right=False):
        width, glyphs = shape(text, chinese, size)
        if width > cap:
            size = max(18, int(size * cap / width))
            width, glyphs = shape(text, chinese, size)
        if size < 18 or width > cap + 2:
            raise ValueError(f'Shorten {field} for {key}')
        family = 'IBM Plex Sans SC' if chinese else 'Chakra Petch'
        anchor = 'end' if right else 'start'
        editable.append(f'<text id="{field}" x="{x}" y="{y}" fill="{color}" font-family="{family}" font-weight="{600 if chinese else 700}" text-anchor="{anchor}" font-size="{size}">{escape(text)}</text>')
        outlines.append(f'<g fill="{color}" transform="translate({x-width if right else x} {y})">{glyphs}</g>')
        return width

    label('program', 1042, 55, theme['english'], 35, 650, GREEN, right=True)
    tag_width = label('program-zh', 1042, 610, theme['chinese'], 32, 230, chinese=True, right=True)
    if session := event.get('session', '').strip():
        label('session', 38, 611, session, 31, 1042-tag_width-38-20, chinese=bool(re.search(r'[\u3400-\u9fff]', session)))
    base = 132 if len(lines) == 2 else 140
    size = min(base, *(int(base * 1000 / max(1, shape(line, False, base)[0])) for line in lines))
    if size < 18:
        raise ValueError('Shorten or rebreak the English title')
    for index, line in enumerate(lines):
        label(f'title-en-{index+1}', 35, 718+111*index if len(lines) == 2 else 782, line, size, 1005)
    if chinese := event.get('title_zh'):
        label('title-zh', 38, 920, chinese, 62, 1005, chinese=True)
    label('date', 37, 1050, start.strftime('%m.%d'), 90, 280, GREEN)
    label('weekday', 324, 1047, WEEK[start.weekday()], 37, 105, GREEN)
    label('time', 1043, 1048, f'{start:%H:%M}–{end:%H:%M}', 65, 582, GREEN, right=True)
    with tempfile.TemporaryDirectory(dir=out) as temp:
        temp = Path(temp).resolve()
        svg, png = temp/'editable.svg', temp/'cover.png'
        svg.write_text('\n'.join(editable + ['</svg>']), encoding='utf-8')
        if NATIVE:
            outline = temp/'outlines.svg'
            outline.write_text('\n'.join(outlines + ['</svg>']), encoding='utf-8')
            subprocess.run(['rsvg-convert', str(outline), '-o', str(png)], check=True)
        else:
            fc = temp/'fonts.conf'
            fc.write_text('<fontconfig><dir>'+escape(str(FONTS))+'</dir><cachedir>'+escape(str(temp/'cache'))+'</cachedir></fontconfig>')
            subprocess.run(['inkscape', str(svg), '--export-type=png', f'--export-filename={png}'], check=True,
                           env={**os.environ, 'FONTCONFIG_FILE': str(fc)})
        for ext, path in [('SVG', svg), ('PNG', png)]:
            (out/ext).mkdir(exist_ok=True)
            path.replace(out/ext/(key+'.'+ext.lower()))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('config', type=Path)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    if not NATIVE and not shutil.which('inkscape'):
        parser.error('Install hb-view and rsvg-convert, or Inkscape and Pillow')
    data = json.loads(args.config.read_text(encoding='utf-8'))
    records = data if isinstance(data, list) else [data]
    keys = [r['key'] for r in records]
    if not keys or len(set(keys)) != len(keys) or not all(re.fullmatch(r'[A-Za-z0-9_-]+', k) for k in keys):
        parser.error('Supply unique filename keys using letters, digits, dashes or underscores')
    args.out.mkdir(parents=True, exist_ok=True)
    for record in records:
        try:
            draw(record, args.config.resolve().parent, args.out)
        except (ValueError, KeyError, OSError, subprocess.CalledProcessError, ImportError) as exc:
            parser.exit(1, f"{record['key']}: {exc}\n")
    print(f'{len(records)} PNG/SVG pairs in {args.out}')


if __name__ == '__main__':
    main()
