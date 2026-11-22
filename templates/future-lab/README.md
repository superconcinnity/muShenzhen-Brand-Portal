# 未来实验 / FUTURE LAB 活动海报

把下面七项资料和原图交给同事的Agent，即可按固定版式出图。活动名在右上绿色区，组织机构名在照片白字区（英文在上、中文在下）。

## 给使用者：提供七项内容

复制下面这段，填好后连同图片一起发给Agent：

```text
请下载以下仓库，使用 templates/future-lab 模板制作海报。
https://github.com/superconcinnity/muShenzhen-Brand-Portal
活动名称中文：
活动名称英文：
一句话介绍中文：
一句话介绍英文：
视觉图：见附件原图
活动组织机构名称中文：
活动组织机构名称英文：

活动名和介绍的英文如留空，请根据中文译写；机构名称缺少确认版本时请指出。
请检查裁切、文字长度和机构名称，交付高清PNG和预览。
```

活动名和介绍的英文可请Agent根据中文译写；机构名称请提供确认过的正式名称或简称。无需另交Logo、账号、标签，也无需自己编辑JSON。

[可复制的完整指令](PROMPTS.md) · [Agent规则](AGENTS.md) · [版式规则](RULES.md) · [素材说明](ASSETS.md)

![版式示例，机构中文名为占位文字](examples/default-preview.png)

上图仅作版式示例：机构中文为占位文字，照片经过AI清理。正式活动应使用真实资料和独立原图。网页预览用于看图和切换辅助网格；新资料交给Agent处理。

## 给Agent：安装与导出

```sh
git clone https://github.com/superconcinnity/muShenzhen-Brand-Portal.git
cd muShenzhen-Brand-Portal/templates/future-lab
npm ci
npm run setup
npm run render
```

需要Node.js 20.9+、npm。首次安装需要联网。若Chromium下载不顺利，可使用本机Chrome，例如macOS：

```sh
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run render
```

### 填写独立配置

复制`content-template.json`为`my-event.json`，将原图放进`assets/`，填写七项内容：

| 字段 | 对应内容 |
| --- | --- |
| event.zh | 活动名称中文 |
| event.en | 活动名称英文 |
| description.zh | 一句话介绍中文 |
| description.en | 一句话介绍英文 |
| image.src | 视觉图路径 |
| organizer.zh | 活动组织机构名称中文 |
| organizer.en | 活动组织机构名称英文 |

```sh
node render.cjs my-event.json exports/my-event
```

图片路径相对此模板目录；命令中的配置和输出路径相对当前终端目录。含空格的参数需加引号。默认示例在`output/content/`，独立活动放在各自输出目录。

image.position是可选裁切设置：center（默认）、top、bottom、left、right。metadata可选，用于记录来源，不显示在画面上。启动配置只包含七项业务内容。

### 遇到问题时

- 缺资料：按报错补齐对应中文或英文字段，不编造机构译名。
- 文字太长：活动名和介绍可提炼重点；机构名需采用确认过的简称。保持字号与单行。
- 图片裁切不合适：根据原图调整image.position，或选择余量更足的照片。
- 有“待确认”提示：查看是否仍有占位文字、演示照片或清晰度问题。排版通过不等于资料已齐备。
- 导出失败：本次没有新成品，不交付目录内上次的旧图。

### 检查与交付

画布1080 × 1440，默认导出2160 × 2880 PNG。先确认命令成功、本次`render-status.json`为passed，再看`validation.json`和实际图片。

交给使用者：`poster.png`（高清成品）和`preview.png`（预览）。`poster.html`可独立打开，配置及源文件按需附上。网格检查图和validation.json用于制作过程。

默认渲染会更新data.js，之后可打开index.html预览。修改JSON后需重新渲染。本模板提供HTML/CSS/JSON编辑源，不输出完整可编辑SVG海报。

品牌使用要求见仓库[USAGE.md](../../USAGE.md)。随发布说明注明“视觉素材来源：mushenzhen”。
