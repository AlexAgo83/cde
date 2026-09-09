#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

python3 scripts/validate_manifest.py
python3 -m unittest discover -s tests -p "test_*.py" -v
node --test tests/test_*.mjs
logics-manager lint
logics-manager audit

bash build.sh
python3 scripts/release_gate.py
