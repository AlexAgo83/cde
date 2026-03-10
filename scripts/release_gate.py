#!/usr/bin/env python3

from __future__ import annotations

import json
import re
import sys
import zipfile
from pathlib import Path


ALLOWED_ARCHIVE_ROOTS = ("assets/", "libs/", "modules/", "views/", "pages/")
ALLOWED_ARCHIVE_FILES = {"manifest.json", "setup.mjs", "modules.mjs"}
VERSION_PATTERN = re.compile(r'const MOD_VERSION = "v([0-9]+\.[0-9]+\.[0-9]+)"')


def parse_version(setup_path: Path) -> str:
    content = setup_path.read_text(encoding="utf-8")
    match = VERSION_PATTERN.search(content)
    if not match:
        raise ValueError(f"Could not extract MOD_VERSION from {setup_path}")
    return match.group(1)


def build_archive_name(version: str) -> str:
    return f"cde-{version.replace('.', '_')}.zip"


def load_manifest_entries(root: Path) -> set[str]:
    manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
    entries = {"manifest.json", manifest["setup"], manifest["icon"]}
    for key in ("module", "load", "resources"):
        entries.update(manifest.get(key, []))
    return entries


def is_allowed_archive_entry(path: str) -> bool:
    if path.endswith("/"):
        return True
    if path in ALLOWED_ARCHIVE_FILES:
        return True
    return any(path.startswith(prefix) for prefix in ALLOWED_ARCHIVE_ROOTS)


def validate_release_archive(root: Path) -> list[str]:
    version = parse_version(root / "setup.mjs")
    archive_path = root / build_archive_name(version)
    if not archive_path.is_file():
        return [f"Archive not found: {archive_path.name}"]

    required_entries = load_manifest_entries(root)
    errors: list[str] = []

    with zipfile.ZipFile(archive_path, "r") as archive:
        names = {name.rstrip("/") for name in archive.namelist() if not name.endswith("/")}

    missing_entries = sorted(path for path in required_entries if path not in names)
    if missing_entries:
        errors.append(
            "Archive is missing manifest-referenced entries: "
            + ", ".join(missing_entries)
        )

    disallowed_entries = sorted(
        path for path in names if path and not is_allowed_archive_entry(path)
    )
    if disallowed_entries:
        errors.append(
            "Archive contains non-runtime entries: "
            + ", ".join(disallowed_entries[:10])
            + ("..." if len(disallowed_entries) > 10 else "")
        )

    return errors


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    errors = validate_release_archive(root)

    if errors:
        print("Release gate: FAILED")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Release gate: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
