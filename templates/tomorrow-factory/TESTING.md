# 三轮素材测试：结论与适配边界

本轮用3个品牌、4张图片测试：BMW莱比锡工厂航拍与装配线、LEGO越南工厂航拍、Dyson新加坡制造工厂内部人物。第三轮分别导出棕色、蓝色，共8张。测试只用于验证版式，不代表活动安排或品牌合作；网上原图与测试成品不随本公开包分发。

| 轮次 | 输入与结果 | 模板规则 |
| --- | --- | --- |
| 第一轮 | 较完整英文厂名均超宽，被200px单行规则拦截 | 保存完整厂名，提炼真实展示短标题 |
| 第二轮 | 短标题通过；实际看图发现原稿放大取景裁掉戴森两侧人物 | 字体和布局检查通过后仍需看照片 |
| 第三轮 | 按可见窗口取景，两套配色8张成功导出并逐张查看 | 新图优先window；保留original用于原稿复现 |

## 实际观察

- 宝马航拍是很宽的1920 × 672图；window仍会左右裁切，适合展示厂区局部，不能宣称显示完整园区。
- 宝马装配线是1280 × 854图；属于内部生产细节，不能因标题是工厂名就误称为外观全景。
- 乐高图是3318 × 1487的航拍；要检查主楼与门头是否有足够视觉比重。
- 戴森图是3840 × 2162的双人场景；original裁掉两侧人物，window显示得更完整，仍需确认头部、手部和展品没有被像素块遮挡。
- 长中文名称“戴森新加坡先进制造工厂”在200px下Regular测试时实际宽度约2178px，可以放下；字符数多不代表一定超宽。
- 完整英文名 BMW GROUP PLANT LEIPZIG / LEGO MANUFACTURING VIETNAM / DYSON SINGAPORE ADVANCED MANUFACTURING 超宽。测试展示短标题采用 BMW LEIPZIG / LEGO VIETNAM / DYSON SAM，完整名称另存。它们是排版提炼，不能当作重新确认的官方名称。
- 增加window时曾验证原稿模式照片取景保持一致；后续可变标题统一更新为中文Medium 500 / 英文SemiBold 600，因此字体外观以更新后的预览为准。

## 来源

- BMW：[工厂官方页面](https://www.bmwgroup-werke.com/leipzig/en.html)，含航拍与生产线图片。
- LEGO：[越南工厂官方介绍](https://www.lego.com/en-us/aboutus/news/2025/april/the-lego-group-opens-new-state-of-the-art-factory-in-Vietnam)。
- Dyson：[新加坡工厂官方介绍](https://careers.dyson.com/en-gb/where-we-are/asia-pacific/singapore/)。

测试证明了这组素材的可用性；极端竖图、重要主体紧贴边缘、无法精简的超长名称仍需单独处理，不承诺自动适配。

## 标题字重修正

可变标题统一为中文IBM Plex Sans SC Medium 500 / 英文Chakra Petch SemiBold 600，包括默认华秋样例。真实字体文件随包附带，导出检查记录字重。字重改变后重新检查实际宽度。
