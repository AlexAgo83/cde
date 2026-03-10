import test from "node:test";
import assert from "node:assert/strict";

import {
  init,
  load,
  getAssetUrl,
  getAssetHtml,
  changeAsset,
  _png_visible_id,
} from "../modules/assetManager.mjs";

function createFixture() {
  const calls = [];
  init({
    settings: {
      isDebug() {
        return false;
      },
    },
  });

  return {
    calls,
    ctx: {
      getResourceUrl(id) {
        calls.push(["getResourceUrl", id]);
        return `resource:${id}`;
      },
    },
  };
}

test("asset manager registers runtime resource urls", () => {
  const fixture = createFixture();
  load(fixture.ctx);

  assert.equal(getAssetUrl(_png_visible_id), `resource:${_png_visible_id}`);
  assert.ok(fixture.calls.length > 0);
});

test("asset manager falls back to Melvor icon when an id is unknown", () => {
  createFixture();
  const html = getAssetHtml("missing.png", ["tiny"]);

  assert.match(html, /logo_no_text\.png/);
  assert.match(html, /tiny/);
});

test("asset manager generates img html and replaces matching DOM content", () => {
  const fixture = createFixture();
  load(fixture.ctx);

  const target = { innerHTML: "" };
  const parent = {
    querySelector(selector) {
      assert.equal(selector, "#asset-slot");
      return target;
    },
  };

  changeAsset(parent, "#asset-slot", _png_visible_id);

  assert.match(target.innerHTML, /resource:assets\/cde-visible\.png/);
  assert.match(target.innerHTML, /cde-asset/);
});
