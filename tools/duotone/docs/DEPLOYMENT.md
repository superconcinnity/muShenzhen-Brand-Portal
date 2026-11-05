# Cloudflare 发布

Worker：`mushenzhen-duotone`。线上路径：https://mushenzhen.xyz/tools/duotone/
当前已上线版本：`29055f02`（2026-11-05，主题明暗反转修复）。

```sh
cd tools/duotone
npm test
npm run build
```

生成 `build/mushenzhen-duotone-cloudflare.zip`。通过 Cloudflare Dashboard → 已有 mushenzhen-duotone → New deployment 上传此 ZIP。其内部结构必须为 `tools/duotone/index.html` 等文件及根目录 `_redirects`：

```
/tools/duotone /tools/duotone/ 301
```

已有路由（保持不变）：
- `mushenzhen.xyz/tools/duotone`
- `mushenzhen.xyz/tools/duotone/*`

不要修改 mushenzhen-landing、其他 Worker、根域 DNS 或添加覆盖全站的路由。发布后验证网址跳转、主题元素、PNG 导出与首页可访问。

GitHub push 不会自动更新线上。本仓库没有 Cloudflare 密钥；云端开发能修改/测试/提交代码，发布需可用的 Cloudflare 授权。不要把本机登录、Cookie、Token 写入文件或聊天。
