# Photo Studio development

Read README.md, docs/HANDOFF.md and docs/DEPLOYMENT.md before changing this tool.
Work in tools/duotone only unless the user requests wider changes. Preserve approved brand SVG paths, clipping and stroke/fill colors. Do not replace icons with fonts or generated approximations.
Run npm test and node --check dist/app.mjs. For UI changes, verify rendering in a browser, theme swapping, preview zoom and export as appropriate. dist/ is the editable source.
Keep image processing client-side. Never commit tokens, local paths, caches or build archives. Do not change other Cloudflare Workers or root-domain routes. Build and deployment are separate; pushing code does not deploy production.
Use codex/ branches for follow-up development and PRs for review. Do not invent a license for this repository or its photos.
