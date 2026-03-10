#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

python3 <<'PY'
import json
from pathlib import Path
import sys

root = Path(".")
manifest_path = root / "manifest.json"

with manifest_path.open("r", encoding="utf-8") as fh:
    manifest = json.load(fh)

missing_paths = []

for key in ("setup", "icon"):
    path = manifest.get(key)
    if path and not (root / path).is_file():
        missing_paths.append(path)

for key in ("module", "load", "resources"):
    for path in manifest.get(key, []):
        if not (root / path).is_file():
            missing_paths.append(path)

required_runtime_modules = {
    "libs/lz-string.js",
    "modules/settings.mjs",
    "modules/utils.mjs",
    "modules/assetManager.mjs",
    "modules/localStorage.mjs",
    "modules/cloudStorage.mjs",
    "modules/displayStats.mjs",
    "modules/notification.mjs",
    "modules/collector.mjs",
    "modules/export.mjs",
    "modules/eta.mjs",
    "modules/viewer.mjs",
    "modules/pages.mjs",
    "views/exportView.mjs",
    "views/changelogView.mjs",
    "pages/panel/chartPanel.mjs",
    "pages/combatPanel.mjs",
    "pages/nonCombatPanel.mjs",
    "modules.mjs",
}

manifest_modules = set(manifest.get("module", []))
missing_runtime_modules = sorted(required_runtime_modules - manifest_modules)

if missing_paths or missing_runtime_modules:
    if missing_paths:
        print("Missing manifest file references:")
        for path in sorted(set(missing_paths)):
            print(f"- {path}")
    if missing_runtime_modules:
        print("Runtime-loaded modules missing from manifest:")
        for path in missing_runtime_modules:
            print(f"- {path}")
    sys.exit(1)

print("Manifest validation: OK")
PY

bash build.sh
