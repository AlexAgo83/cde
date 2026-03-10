import json
import tempfile
import unittest
import zipfile
from pathlib import Path

from scripts.release_gate import build_archive_name, validate_release_archive


class ReleaseGateTests(unittest.TestCase):
    def create_root(self):
        tmp_dir = tempfile.TemporaryDirectory()
        root = Path(tmp_dir.name)
        manifest = {
            "namespace": "cde",
            "icon": "assets/icon.png",
            "setup": "setup.mjs",
            "module": ["modules/sample.mjs"],
            "load": ["assets/templates.html"],
            "resources": ["assets/icon.png"],
        }

        (root / "assets").mkdir(parents=True)
        (root / "modules").mkdir(parents=True)
        (root / "setup.mjs").write_text('const MOD_VERSION = "v3.0.4"\n', encoding="utf-8")
        (root / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
        (root / "assets" / "icon.png").write_text("icon", encoding="utf-8")
        (root / "assets" / "templates.html").write_text("<div></div>", encoding="utf-8")
        (root / "modules" / "sample.mjs").write_text("// sample\n", encoding="utf-8")

        return tmp_dir, root

    def write_archive(self, root: Path, entries: dict[str, str]):
        archive_path = root / build_archive_name("3.0.4")
        with zipfile.ZipFile(archive_path, "w") as archive:
            for name, content in entries.items():
                archive.writestr(name, content)

    def test_valid_archive_passes(self):
        tmp_dir, root = self.create_root()
        self.addCleanup(tmp_dir.cleanup)

        self.write_archive(
            root,
            {
                "manifest.json": "{}",
                "setup.mjs": 'const MOD_VERSION = "v3.0.4"\n',
                "assets/icon.png": "icon",
                "assets/templates.html": "<div></div>",
                "modules/sample.mjs": "// sample\n",
            },
        )

        self.assertEqual(validate_release_archive(root), [])

    def test_missing_manifest_entry_is_reported(self):
        tmp_dir, root = self.create_root()
        self.addCleanup(tmp_dir.cleanup)

        self.write_archive(
            root,
            {
                "manifest.json": "{}",
                "setup.mjs": 'const MOD_VERSION = "v3.0.4"\n',
                "assets/icon.png": "icon",
            },
        )

        errors = validate_release_archive(root)

        self.assertEqual(len(errors), 1)
        self.assertIn("modules/sample.mjs", errors[0])
        self.assertIn("assets/templates.html", errors[0])

    def test_non_runtime_archive_entry_is_reported(self):
        tmp_dir, root = self.create_root()
        self.addCleanup(tmp_dir.cleanup)

        self.write_archive(
            root,
            {
                "manifest.json": "{}",
                "setup.mjs": 'const MOD_VERSION = "v3.0.4"\n',
                "assets/icon.png": "icon",
                "assets/templates.html": "<div></div>",
                "modules/sample.mjs": "// sample\n",
                "tests/test_setup.mjs": "// should not ship\n",
            },
        )

        errors = validate_release_archive(root)

        self.assertEqual(len(errors), 1)
        self.assertIn("tests/test_setup.mjs", errors[0])


if __name__ == "__main__":
    unittest.main()
