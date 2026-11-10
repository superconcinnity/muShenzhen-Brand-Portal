const rules = require('./template-rules.json');
const segmenter = new Intl.Segmenter('zh', { granularity: 'grapheme' });
function validate(content) {
 const errors=[];
 for(const [key,rule] of Object.entries(rules.fields)) {
  if(typeof content[key]!=='string'){errors.push(`${rule.label}：必须填写文字`);continue;}
  const value=content[key].trim();
  const count=[...segmenter.segment(value)].length;
  if(count<rule.min || count>rule.max)errors.push(`${rule.label}：当前 ${count} 字符，要求 ${rule.min}–${rule.max} 字符`);
  if(/[\r\n\t]/u.test(value))errors.push(`${rule.label}：请使用单段文字，由模板自动换行`);
  if(!/[\p{L}\p{N}]/u.test(value))errors.push(`${rule.label}：不能只填写空格或符号`);
  if(['company','role'].includes(key) && /\p{Script=Han}/u.test(value))errors.push(`${rule.label}：请填写英文`);
  if(key==='description' && !/\p{Script=Han}/u.test(value))errors.push(`${rule.label}：请填写中文描述，可保留英文项目名`);
 }
 if(errors.length)throw new Error(errors.join('\n'));
 return true;
}
module.exports={validate};
if(require.main===module){validate(require('./content.json'));console.log('内容字段检查通过');}
