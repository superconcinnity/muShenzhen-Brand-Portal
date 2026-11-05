# 云端开发交接（2026-11-05）

仓库：superconcinnity/muShenzhen-Brand-Portal。工作目录：tools/duotone。
线上：https://mushenzhen.xyz/tools/duotone/ 。本次迁移仅 Photo Studio，不包括旧像素海报编辑器、历史试稿或本地工作区。

已确认：双色素描底图，无局部底色色块；符号跟随图像细节与明暗，coverage 为固定网格的稳定子集；默认 grid=36（按4003px宽度）、size=1.15。四套主题自动切换元素。交换明暗不变成自定义。已删除“少一点绿”和“更浓的素描”快捷按钮。

预览快速模式为1400px宽，高清处理按4003px宽；导出再缩放至指定尺寸，最大8000px长边/36MP。5%–200%缩放只影响画布显示，不影响输出尺寸。符号 SVG 同时替换 fill/stroke，保留 none，避免黑边。

已知边界：不含 Garage/Human Flourishing 主题；尚无服务器、账号或云端照片存储。参数 JSON v1 新增 symbolTheme；旧参数未声明时保留原机器人组，避免改变旧作品。尚未配置 GitHub 自动部署；用户本机 Cloudflare 登录不会随迁移转移到云端。

接手时读取 AGENTS.md，运行 npm test、npm run build，再启动预览；不要自行重设计已确认效果。后续按用户要求修改，使用 codex/ 分支和 PR。
