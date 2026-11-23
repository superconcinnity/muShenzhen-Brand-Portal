import copy, importlib.util, json, unittest, subprocess, tempfile, sys
from pathlib import Path
HERE=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('compose',HERE/'compose.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class Contract(unittest.TestCase):
 def setUp(self):self.c=json.loads((HERE/'examples/main-square.json').read_text())
 def invalid(self,edit):
  edit(self.c)
  with self.assertRaises(ValueError):m.render(self.c)
 def test_actual_svg_tampering_is_rejected(self):
  with tempfile.TemporaryDirectory() as directory:
   config=Path(directory)/'config.json';svg=Path(directory)/'art.svg'
   config.write_text(json.dumps(self.c));svg.write_text(m.render(self.c).replace('width="1080"','width="999"',1))
   result=subprocess.run([sys.executable,str(HERE/'compose.py'),str(config),'--verify-svg',str(svg)],capture_output=True,text=True)
   self.assertNotEqual(result.returncode,0);self.assertIn('SVG differs',result.stderr)
 def test_examples(self):
  for p in (HERE/'examples').glob('*.json'):self.assertIn('<svg',m.render(json.loads(p.read_text())))
 def test_rectangular_grid(self):self.invalid(lambda c:c.update(height=1079))
 def test_fractional_block(self):self.invalid(lambda c:c['blocks'][0].update(x=.5))
 def test_wrong_theme_color(self):self.invalid(lambda c:c['blocks'][0].update(color='life-blue'))
 def test_wrong_theme_symbol(self):self.invalid(lambda c:c['symbols'][0].update(name='robot'))
 def test_offgrid_symbol(self):self.invalid(lambda c:c['symbols'][0].update(y=1.2))
 def test_distorted_logo(self):self.invalid(lambda c:c['logos'][0].update(height=30))
 def test_missing_brand(self):self.invalid(lambda c:c.update(logos=[]))
 def test_hidden_symbol(self):self.invalid(lambda c:c['symbols'][0].update(color='accent'))
 def test_multicell_symbol_stays_square(self):
  self.c['symbols']=[{'x':1,'y':1,'span':2,'name':'hourglass','color':'ink'}]
  svg=m.render(self.c);self.assertIn('width="72" height="72"',svg)
 def test_multicell_visibility_checks_every_cell(self):
  self.c['blocks']=[{'x':1,'y':1,'w':1,'h':1,'color':'accent'}]
  self.c['symbols']=[{'x':1,'y':1,'span':4,'name':'slash','color':'ink'}]
  with self.assertRaisesRegex(ValueError,'within its span'):m.render(self.c)
 def test_invalid_span(self):self.invalid(lambda c:c['symbols'][0].update(span=1.5))
 def test_missing_theme(self):self.invalid(lambda c:c.pop('theme'))
 def test_original_clipping_and_white_survive(self):
  self.c['theme']='machines';self.c['symbols']=[{'x':1,'y':1,'name':'qi','color':'ink'}]
  svg=m.render(self.c);self.assertIn('clipPath',svg);self.assertIn('white',svg)
