#!/usr/bin/env python3

from __future__ import annotations

import json
import sys
from pathlib import Path


REQUIRED_RUNTIME_MODULES = {
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


def validate_manifest(root: Path) -> tuple[list[str], list[str]]:
    manifest_path = root / "manifest.json"
    with manifest_path.open("r", encoding="utf-8") as fh:
        manifest = json.load(fh)

    missing_paths: list[str] = []

    for key in ("setup", "icon"):
        path = manifest.get(key)
        if path and not (root / path).is_file():
            missing_paths.append(path)

    for key in ("module", "load", "resources"):
        for path in manifest.get(key, []):
            if not (root / path).is_file():
                missing_paths.append(path)

    manifest_modules = set(manifest.get("module", []))
    missing_runtime_modules = sorted(REQUIRED_RUNTIME_MODULES - manifest_modules)
    return sorted(set(missing_paths)), missing_runtime_modules


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    missing_paths, missing_runtime_modules = validate_manifest(root)

    if missing_paths:
        print("Missing manifest file references:")
        for path in missing_paths:
            print(f"- {path}")

    if missing_runtime_modules:
        print("Runtime-loaded modules missing from manifest:")
        for path in missing_runtime_modules:
            print(f"- {path}")

    if missing_paths or missing_runtime_modules:
        return 1

    print("Manifest validation: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
