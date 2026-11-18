# 测试与适配范围

当前中文标题为IBM Plex Sans SC Medium 500，英文为Chakra Petch SemiBold 600，均为200px、单行。

## 工厂素材测试

使用BMW莱比锡工厂的航拍与装配线、LEGO越南工厂航拍、Dyson新加坡制造工厂内部人物图，共4种画面，分别检查两套配色。

- 完整英文厂名常超宽，需保留完整记录并提炼展示短标题。
- 原稿放大取景会裁掉新图的重要内容；新增window模式后，人物呈现更完整。
- window仍会裁切宽幅航拍，需确认主楼比重，不能据此声称呈现完整厂区。
- 字重更新后，8张海报重新导出并检查过标题范围。

## 同事Agent使用流程复核

从公开提交的干净副本安装依赖，测试默认两版、新照片与标题、文字转义、错误配置、独立SVG及导出状态。24项输入场景和5项交付检查已通过。字段拼写错误、空取景模式、错误metadata格式原先会被忽略，现已明确拦截；配色只接受brown和blue。

本次在macOS上用本机Chrome完成验证。npm ci成功；Chromium下载在本次50秒等待窗口内未完成，改用README中的CHROME_PATH步骤。该情况不等于其他环境无法安装；Windows、Linux未在本轮实际运行。

极端竖图、主体紧贴边缘、无法精简的超长名称仍需逐图处理。

素材来源：[BMW](https://www.bmwgroup-werke.com/leipzig/en.html)、[LEGO](https://www.lego.com/en-us/aboutus/news/2025/april/the-lego-group-opens-new-state-of-the-art-factory-in-Vietnam)、[Dyson](https://careers.dyson.com/en-gb/where-we-are/asia-pacific/singapore/)。测试不代表活动安排或品牌合作。
