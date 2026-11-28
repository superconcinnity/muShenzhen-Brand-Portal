# 三套品牌演示模板

## 入口
先明确品牌，再进入对应目录。不得将三个品牌的装饰混合使用。
- mushenzhen：muShenzhen，10 个版式，含主品牌及 Machines / Intelligence / Life Week。
- garage：Garage，2 个版式。
- human-flourishing：Human Flourishing，3 个版式。内页 A、B 来自不同画板，保留两种人物位置。

## 最简工作方式
1. 读取品牌目录的 template.json，了解版式、字号、位置、可替换字段及字数建议。
2. 参考 content.example.json，按用户内容生成自己的 content.json。每页选一个 layout ID，content 中使用该版式的字段名。
3. 运行 `python3 render.py content.json output.html`。脚本会把生成的 HTML、所需图形及字体复制到输出目录。输出请放在新的目录，勿覆盖模板。
4. 用浏览器打开输出 HTML，检查每页。文字过长应精简或拆页，不得挤压品牌装饰或任意缩小字号。

## 文件约定
- index.html：可离线打开、切页、编辑文字、保存 HTML、导出内容 JSON。
- template.json：版式定义。尺寸及字号单位为 1920×1080 画布的 CSS px。
- assets/*.svg：从设计师 AI 画板提取的品牌底图，文字占位符已移除，保留矢量图形。
- assets/*.png：同版式 1920×1080 底图，供不支持 SVG 的工具使用。
- fonts/：原版中文字体 IBM Plex Sans SC Regular。
- content.example.json：可直接生成的完整示例。

## 品牌保护和内容规则
固定标识、插图、边框、主题周名称和页脚口号不修改、不拉伸、不跨品牌拼接。
可修改 title、subtitle、body 等字段，或者在内页正文区域加入用户提供的图片、数据图表。现有 render.py 仅支持文字字段，图片/图表需要另行编辑 HTML 或 PPT。
文字可编辑；底图作为完整品牌图形保留，不承诺每个装饰在 PowerPoint 中都是原生可编辑形状。
单页只表达一个主要主题。封面保持一行短标题和一行副标题。内页正文建议最多 5 行。
尺寸、品牌和任何事实以用户提供的内容为准，不虚构数据或人物。
无需访问飞书、GitHub 或其他账户就能使用此包。

## 交付检查
输出品牌准确；所有图形和字体加载正常；标题/正文无截断；1920×1080 比例保持不变；每页内容可编辑。
编辑保存的 HTML 必须与 assets、fonts 文件夹一起转发，不能只发一个 HTML。
