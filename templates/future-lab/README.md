# 未来实验 / FUTURE LAB 模板

下载后让 Agent 用独立配置替换照片和文案，生成参考版式的项目海报。固定系列名称、品牌装饰和底部网址色带，忽略参考图照片右上角的项目 Logo。

[Agent 规则](AGENTS.md) · [版式规则](RULES.md) · [指令示例](PROMPTS.md) · [素材说明](ASSETS.md)

![默认预览](examples/default-preview.png)

## 下载与运行

```sh
git clone https://github.com/superconcinnity/muShenzhen-Brand-Portal.git
cd muShenzhen-Brand-Portal/templates/future-lab
npm ci
npm run setup
npm run render
```

需要 Node.js 20.9+、npm。首次下载依赖及 Chromium 需要联网。如果浏览器下载较慢，可直接指定本机 Chrome，例如 macOS：

```sh
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run render
```

默认输出在 `output/content/`。画布1080 × 1440，PNG默认以2倍尺寸2160 × 2880导出。

## 替换内容

复制 `content-template.json` 为新配置，把原图放在 `assets/`，再填写：

| 字段 | 内容 |
| --- | --- |
| image.src | 相对此模板目录的图片路径 |
| image.position | center、top、bottom、left、right；默认center |
| experiment.zh / en | 右上方的中英文实验名称 |
| description.zh / en | 照片上方的中英文一句话介绍 |
| project.en / zh | 照片下方白色项目标题，英文在上、中文在下 |
| credit.handle | 下方蓝色项目账号或署名，是否含@由配置决定 |
| credit.tags | 1–5项短标签数组，自动用“ · ”连接 |
| metadata | 来源或备注对象，不显示在海报上，可省略 |

```sh
node render.cjs my-project.json exports/my-project
```

图片路径相对此模板目录，配置和输出路径相对当前终端目录；含空格的命令参数需加引号。独立导出不覆盖默认配置。

所有文案保持固定字号与单行。超宽、碰到装饰或字段拼写错误会报错；先提炼关键内容，再重新导出。不能靠缩字或强制换行掩盖溢出。

照片等比cover填满图片区，上方保留清晰主体，下方逐渐融入深色背景。要检查人物头部、手部或产品有没有被裁切；位置不合适时调整position或更换余量更足的原图。导出像素数不等于原图清晰度。

## 交付文件

- `poster.png`：高清成品；`preview.png`：快速预览。
- `grid-proof.png` / `grid-preview.png`：带辅助网格的检查图。
- `poster.html`：嵌入照片、字体和脚本的独立预览，可复制到其他目录打开。
- `content.json`：本次配置；`validation.json`：字体、文字范围、装饰碰撞及图片提示。
- `render-status.json`：本次运行时间及状态。只有命令成功、状态为passed时才交付，失败时不可使用目录内的旧PNG。

默认渲染还会更新模板根目录的 `data.js`；之后打开 `index.html` 可查看本地预览和辅助网格。改JSON后需重新渲染，直接刷新HTML不会重新读取配置。

HTML/CSS/JSON是可编辑源，本模板输出PNG和HTML，不提供完整可编辑SVG海报。默认示例照片由用户参考图经AI清理叠字和Logo得到，用于展示版式；正式制作优先提供独立原始照片。图片处理不用于新增或更改项目事实。

品牌素材及字体使用条件见[ASSETS.md](ASSETS.md)和仓库[USAGE.md](../../USAGE.md)。随作品说明注明“视觉素材来源：mushenzhen”。
