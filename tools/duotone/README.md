# mushenzhen Photo Studio

[打开线上工具](https://mushenzhen.xyz/tools/duotone/)

浏览器内完成照片双色素描、品牌符号叠加与 PNG 导出。用户上传的照片不发送到服务器。

## 开发

需要 Node.js 20+、Python 3，无须安装前端依赖。

```sh
cd tools/duotone
npm test
npm run dev
```

访问 http://localhost:8741 。`dist/` 是可直接运行的源码，不是另一个项目的编译输出；直接编辑这里的 HTML、CSS、原生 ES Modules。

## 功能

- 主视觉、机器人周、生物科技周、人工智能周四组主题配色与 SVG 元素联动。
- 交换暗部/亮部颜色仍属于原主题；手动改色保留当前符号组。
- 双色素描与基础双色、曝光/对比度/白平衡、颜色平衡、素描浓度和纹理。
- 符号大小、网格、覆盖率、不透明度与单个符号开关；按画面细节与明暗分布，无局部色块底板。
- 原图/效果比较、5%–200% 预览缩放、适应画面、高清校对。
- 自由画幅、裁切位置、参数 JSON 保存/恢复及 PNG 导出。

## 文件

- `dist/app.mjs`：交互、文件读取、Canvas 合成与导出。
- `dist/engine.mjs`：纯图像算法、参数验证与裁切。
- `dist/worker.mjs`：Web Worker 计算。
- `dist/assets/`：16 个主题 SVG 单元和三个示例照片。
- `tests/`：图像算法与参数回归测试。
- `scripts/package.py`：打包 Cloudflare 静态部署文件。
- [部署](docs/DEPLOYMENT.md) · [云端交接](docs/HANDOFF.md)

SVG 来源为本仓库 `assets/elements/` 四组正式素材。三张示例照片是项目现有演示素材，不自动适用视觉元素的商用授权。工具源码已公开，尚未指定软件开源许可证；不擅自套用 MIT/CC0。品牌素材使用规则见仓库根目录 USAGE.md。
