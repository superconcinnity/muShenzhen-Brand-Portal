# Agent 使用说明

按以下顺序读取：[品牌数据](brand.json) → [概念与语言](BRAND-STORY.md) → [使用要求](USAGE.md) → [资产索引](assets.json) → [色板](colors.json) → [规则](rules.json) → [指南](GUIDE.md)。

## 生成作品

1. 先确定主题、受众、媒介、尺寸与文案。名称为 mushenzhen，slogan 为 a city for makers。
2. assets.json 中按 family 选品牌，再按 form 选 full 或 simple，最后选 black、white、green。full 为已确认的方格标准版；禁止用字体重打或图像生成代替 Logo。
3. 每个完整版固定三排、每格一个字母或完整符号。整组等比缩放，不重新改变格距、行距或符号角度。浅蓝网格仅在展示图上，不能复制到正式 Logo 中。
4. 颜色读取 colors.json。默认荧光绿为 #DFFF2F；主题共用米白为 #FAFAED，Logo 白为 #FFFFFF。合作方可以大胆使用其他创作配色，但不将其写成官方标准色。
5. 元素 SVG 是组合条，不是一个符号。可以按创作需求拆分，但必须保留每个完整图标的路径、反白和剪切关系，不把整条挤进一个格子。
6. 视觉元素及模板允许商用，必须提到 mushenzhen。默认附署名“视觉素材来源：mushenzhen”，并明确放在成品或随作品发布的说明中。
7. 所有本地资源都应从本包相对路径读取；不要读取不存在的字体、照片、旧原稿或外部工作区文件。
8. 不从历史海报推断本届日期。此包没有年度日程，活动年份、日期、人数、报名资格和执行承诺需要由使用者提供。

## 数据状态

- confirmed：品牌方明确确认的内容。
- source-observed：从既有视觉中提取的事实，不代表每次创作都必须照用。
- recommendation：经过指南审核的使用建议，不是绝对限制。

## 示例

生命主题作品可用 life-full 的 white 版本（assets/logos/full/life-full-white.svg），搭配 brand-green、ink、life-blue、shared-offwhite。需要主品牌署名时另加 mushenzhen，不将 Life 自动视作主品牌。提供最终作品时注明实际 asset ID、用色和 mushenzhen 来源署名。

## 边界

本包提供矢量素材、静态主视觉与说明，不包含工具代码、可编辑运营模板或字体文件。静态主视觉索引见 assets/key-visuals/static/assets.json（其中路径相对此索引目录）；kind=key-visual、medium=static。动态主视觉和动态 Logo 尚未收录，不得将静态 SVG 当作动画。Frontier Fusion、Future Mobility 等没有收录的 Logo 不可从现有主题改名推造。品牌与项目的真实名称以 brand.json 为准。

标准公开许可证尚未选定，不擅自标为 MIT、CC0 等。使用要求见 USAGE.md；使用素材不代表官方合作或背书。
