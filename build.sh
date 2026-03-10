#!/bin/bash

SETUP_FILE="setup.mjs"

if [[ ! -f "$SETUP_FILE" ]]; then
  echo "❌ File '$SETUP_FILE' not found."
  exit 1
fi

VERSION=$(grep 'const MOD_VERSION' "$SETUP_FILE" | sed -E 's/.*"v([0-9]+\.[0-9]+\.[0-9]+)".*/\1/')

if [[ -z "$VERSION" ]]; then
  echo "❌ Can't extract version value from '$SETUP_FILE'."
  exit 1
fi

VERSION_UNDERSCORE=${VERSION//./_}
ZIP_NAME="cde-${VERSION_UNDERSCORE}.zip"

if [[ -f "$ZIP_NAME" ]]; then
  echo "🗑️ Removing existing archive: $ZIP_NAME"
  rm "$ZIP_NAME"
fi

echo "📦 Creating archive: $ZIP_NAME ..."
zip -r "$ZIP_NAME" \
  manifest.json \
  setup.mjs \
  modules.mjs \
  assets \
  libs \
  modules \
  views \
  pages \
  -x "*.zip" \
  -x ".DS_Store"

echo "✅ Archive created: $ZIP_NAME"
