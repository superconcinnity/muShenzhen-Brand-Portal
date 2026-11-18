# 明日出厂 / INSIDE THE FACTORY 模板

让同事的 Agent 下载本目录，替换工厂照片、工厂中文标题和英文标题，选择棕色或蓝色，通过配置文件出图。

[Agent 规则](AGENTS.md) · [完整版式规则](RULES.md) · [自然语言指令](PROMPTS.md) · [三轮测试结论](TESTING.md) · [素材说明](ASSETS.md)

![棕色示例](examples/brown-preview.png)

## 第一次运行

```sh
git clone https://github.com/superconcinnity/muShenzhen-Brand-Portal.git
cd muShenzhen-Brand-Portal/templates/tomorrow-factory
npm ci
npm run setup
npm run render
npm run render:blue
```

需要 Node.js 20.9+、npm。首次安装依赖和 Chromium 需要联网；可用 `CHROME_PATH` 指定本机 Chrome 可执行文件。Linux 缺系统库时按 Playwright 的报错补装。

如果Chromium下载较慢或失败，而电脑已安装Chrome，可使用备用方式。例如macOS终端：

```sh
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run render
```

这会直接使用已安装的Chrome，无需先完成`npm run setup`。路径必须指向可执行文件；Windows、Linux请填写对应实际路径。

默认棕色输出在 `output/content/`，蓝色在 `output/blue/`。两份默认配置显式使用 `original`，用于复现原照片取景；工厂标题统一使用确认的Medium / SemiBold字重。

## 同事制作新海报

1. 将清晰原图放入 `assets/`。优先选主体在中部、四周有余量的横图，避免用旧海报截图。超宽航拍、近景人物和竖图都要额外检查裁切。
2. 复制 `content-template.json` 为独立配置，如 `my-factory.json`。该文件预设 `window`，适合新照片；换成自己的图片路径和中英文名称。
3. 初次用 `position: "centre"` 导出，看图后决定是否改变裁切重心。
4. 如果标题超宽，保存完整名称与来源，精简展示短标题，保持字号和单行。
5. 打开高清 PNG 和预览，检查主体、色块、标题及配色，再交付。

```json
{
  "theme": "brown",
  "image": {
    "src": "assets/my-factory.jpg",
    "framing": "window",
    "position": "centre"
  },
  "titleZh": "工厂中文名称",
  "titleEn": "FACTORY NAME",
  "metadata": {
    "fullTitleZh": "完整中文名称",
    "fullTitleEn": "完整英文名称",
    "sourceUrl": "名称或照片来源"
  }
}
```

```sh
node render.cjs my-factory.json exports/my-factory
```

图片路径相对此模板目录，命令中的配置与输出路径相对当前终端目录。有空格的命令参数需加引号，如`node render.cjs "my factory.json" "exports/factory A"`。`metadata`必须是对象；仅作随配置保存的来源记录，不会印到海报上，自有素材可写自己的来源说明。顶层和image中的拼写错误或未知字段会报错。

## 图片怎么调整

| 配置 | 使用时机 |
| --- | --- |
| `framing: "window"` | 新照片优先使用；按画布内可见照片区域 2192 × 1760 取景 |
| `framing: "original"` | 复现原设计的照片放大与裁切效果 |
| `position: "centre"` | 主体位于中部，先看这一版 |
| `left` / `right` | 有左右裁切余量时，保留相应一侧 |
| `top` / `bottom` | 有上下裁切余量时，保留相应一侧 |
| `attention` / `entropy` | 让图像算法建议裁切；必须看图，不代表识别到建筑或人物 |

未填写 `framing` 时默认 `window`。两种模式都保留原稿的像素遮罩。`position` 只在裁切轴上生效，源图与目标比例相同时不会产生平移；想解决过度放大，应先检查 `framing`。

`cover` 会裁掉超出目标比例的部分，不保证整张原图可见。两侧人物、门头、建筑主楼被切掉时，先调整取景，再换更有余量的原图。不要拉伸照片或在色块上覆盖照片。新照片建议尽量达到 2192 × 1760 的有效分辨率；低于目标尺寸也可输出，但脚本会记录放大提示，高清 PNG 的清晰度仍需看图确认。

## 标题与配色

- 替换下方“华秋电子-江门制造工厂 / HUAQIU ELECTRONICS”；“明日出厂 / INSIDE THE FACTORY”属于固定系列标识。
- 所有可变标题（含默认样例）统一使用 IBM Plex Sans SC Medium（500，中文）/ Chakra Petch SemiBold（600，英文），200px、单行、左对齐。使用对应真实字体文件，不用浏览器合成加粗。
- 按实际字形宽度检查，不按统一字数判断。超宽时可省略重复的集团、制造、有限公司等信息，但保留准确的品牌及必要地点；不要制造简称。
- 配色仅选 `brown`（#795E4B / #DFFF2F）或 `blue`（#5456BE / #ACC0BF），不混搭。

## 输出与交付

| 文件 | 用途 |
| --- | --- |
| `poster.png` | 2632 × 3509 高清成品 |
| `preview.png` | 快速查看整体构图 |
| `poster.svg` / `poster.html` | 嵌入照片与字体的源文件 / 浏览器预览 |
| `content.json` | 本次使用的配置，包括完整名称记录 |
| `validation.json` | 标题实际外框、字体、图片尺寸、取景方式与清晰度提示 |
| `render-status.json` | 本次运行的时间及 running / passed / failed 状态 |

只有命令成功且 `render-status.json` 为本次的 `passed`，才交付该目录成品。同一目录重跑失败时可能仍有旧 PNG，不得把旧图当作新结果；优先为每张海报使用独立输出目录。

PNG 是发布成品；SVG 的替换标题为文本，固定标识仍为路径，不同软件对嵌入字体的支持可能不同，以 PNG 预览为准。

完整的固定元素、照片适配顺序与验收要求见 [RULES.md](RULES.md)。署名及使用条件见仓库 [USAGE.md](../../USAGE.md)。网上测试照片没有打包进仓库。
