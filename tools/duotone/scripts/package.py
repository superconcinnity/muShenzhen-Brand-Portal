from pathlib import Path
import shutil
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parents[1]
build = root / "build"
if build.exists(): shutil.rmtree(build)
assets = build / "assets"
shutil.copytree(root / "dist", assets / "tools" / "duotone")
(assets / "_redirects").write_text("/tools/duotone /tools/duotone/ 301\n")
with ZipFile(build / "mushenzhen-duotone-cloudflare.zip", "w", ZIP_DEFLATED) as archive:
    for path in sorted(assets.rglob("*")):
        if path.is_file(): archive.write(path, path.relative_to(assets))
print("Ready:", build / "mushenzhen-duotone-cloudflare.zip")
