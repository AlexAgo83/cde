import json
import tempfile
import unittest
from pathlib import Path

from scripts.validate_manifest import REQUIRED_RUNTIME_MODULES, validate_manifest


class ValidateManifestTests(unittest.TestCase):
    def test_current_repository_manifest_is_valid(self):
        root = Path(__file__).resolve().parent.parent
        missing_paths, missing_runtime_modules = validate_manifest(root)
        self.assertEqual(missing_paths, [])
        self.assertEqual(missing_runtime_modules, [])

    def test_missing_runtime_module_is_reported(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            manifest = {
                "namespace": "cde",
                "icon": "assets/icon.png",
                "setup": "setup.mjs",
                "module": sorted(REQUIRED_RUNTIME_MODULES - {"modules/export.mjs"}),
                "load": [],
                "resources": [],
            }

            (root / "assets").mkdir(parents=True)
            (root / "modules").mkdir(parents=True)
            (root / "views").mkdir(parents=True)
            (root / "pages" / "panel").mkdir(parents=True)
            (root / "pages").mkdir(exist_ok=True)
            (root / "setup.mjs").write_text("// setup", encoding="utf-8")
            (root / "assets" / "icon.png").write_text("icon", encoding="utf-8")

            for rel_path in REQUIRED_RUNTIME_MODULES - {"modules/export.mjs"}:
                path = root / rel_path
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("// module", encoding="utf-8")

            (root / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")

            missing_paths, missing_runtime_modules = validate_manifest(root)

            self.assertEqual(missing_paths, [])
            self.assertEqual(missing_runtime_modules, ["modules/export.mjs"])


if __name__ == "__main__":
    unittest.main()
