# Agent 制作入口

1. 读 [README.md](README.md)、[themes.json](themes.json) 与 [content-template.json](content-template.json)。为新活动复制独立 JSON，填写主办方提供的双语名称、所属单元、带时区的起止时间，以及可选图片。
2. 开幕仪式使用 main + ceremony，呈现完整、缩小的 S。普通开幕日活动用 main 的默认原画。硬件周、生物科技周、AI 周分别用机械手、植物、电路板。按所属周选图，跨主题活动也保留该周身份。
3. 实图放在 x=0、y=82、宽 1080、高 478 的图窗。横图默认居中裁切，方形插画保留完整轮廓。选图后检查人脸、产品和设备的关键部分。字标、图窗、信息底板、页脚沿用母版。
4. 英文标题按语义拆为一至两行，中文展示名占一行。长标题保留到 full_title，再提炼显示文案。session 可放机构、场次或额外付费信息。核对它与右侧主题标签的距离。
5. 运行 `python3 render.py <活动.json> --out <输出目录>`。打开实际 PNG，在小尺寸下复核标题、日期、星期和深圳时段，对照该周[样张](examples/PNG/)。交付 PNG、可编辑 SVG 和该场 JSON。随作品注明「视觉素材来源：mushenzhen」。
6. 四套[演示配置](examples/contents.json)可以批量导出。制作脚本只生成本地文件，发布活动是独立操作。

可直接交给 Agent 的任务示例：

> 读 templates/sola-covers/AGENTS.md，用硬件周母版制作这场活动的封面。采用我提供的现场照片和双语文案，英文标题按语义断行，以深圳时间显示时段。交我可编辑 SVG 和发布用 PNG。
