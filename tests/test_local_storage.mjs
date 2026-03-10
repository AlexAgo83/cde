import test from "node:test";
import assert from "node:assert/strict";

import {
  init,
  getLastExportFromStorage,
  saveExportToStorage,
  getChangesFromStorage,
  saveChangesToStorage,
  clearStorage,
  isLZStringReady,
} from "../modules/localStorage.mjs";

function createFixture({ withLZString = true, debug = false } = {}) {
  const storage = new Map();
  const calls = [];

  const deps = {
    lzString: withLZString
      ? {
          compressToUTF16(value) {
            calls.push(["compress", value]);
            return `lz:${value}`;
          },
          decompressFromUTF16(value) {
            calls.push(["decompress", value]);
            return value.startsWith("lz:") ? value.slice(3) : null;
          },
        }
      : null,
    melvorRuntime: {
      getGame() {
        return { characterName: "Sir Test" };
      },
    },
    settings: {
      isDebug() {
        return debug;
      },
    },
    browserRuntime: {
      readStorage(key) {
        calls.push(["read", key]);
        return storage.get(key) ?? null;
      },
      writeStorage(key, value) {
        calls.push(["write", key, value]);
        storage.set(key, value);
      },
      removeStorage(key) {
        calls.push(["remove", key]);
        storage.delete(key);
      },
    },
    utils: {
      sanitizeCharacterName(value) {
        return value.toLowerCase().replace(/\s+/g, "_");
      },
    },
  };

  return { calls, storage, deps };
}

test("local storage compresses export snapshots and reads them back per character", () => {
  const fixture = createFixture();
  init(fixture.deps);

  saveExportToStorage({ ok: true });

  assert.equal(isLZStringReady(), true);
  assert.equal(
    fixture.storage.get("cde_last_export_sir_test"),
    'lz:{"ok":true}',
  );
  assert.deepEqual(getLastExportFromStorage(), { ok: true });
  assert.deepEqual(fixture.calls, [
    ["compress", '{"ok":true}'],
    ["write", "cde_last_export_sir_test", 'lz:{"ok":true}'],
    ["read", "cde_last_export_sir_test"],
    ["decompress", 'lz:{"ok":true}'],
  ]);
});

test("local storage stores and restores changelog history maps", () => {
  const fixture = createFixture();
  init(fixture.deps);

  saveChangesToStorage(new Map([["2026_03_10", ["line1", "line2"]]]));

  const history = getChangesFromStorage();
  assert.ok(history instanceof Map);
  assert.deepEqual(Array.from(history.entries()), [["2026_03_10", ["line1", "line2"]]]);
});

test("local storage falls back to raw JSON when compression is unavailable", () => {
  const fixture = createFixture({ withLZString: false });
  init(fixture.deps);

  saveExportToStorage({ raw: true });

  assert.equal(isLZStringReady(), false);
  assert.equal(fixture.storage.get("cde_last_export_sir_test"), '{"raw":true}');
  assert.deepEqual(getLastExportFromStorage(), { raw: true });
});

test("local storage returns null on invalid persisted payload and clears both keys", () => {
  const fixture = createFixture();
  init(fixture.deps);

  fixture.storage.set("cde_last_export_sir_test", "not-json");
  fixture.storage.set("cde_last_changes_sir_test", 'lz:[["2026_03_10",["x"]]]');

  assert.equal(getLastExportFromStorage(), null);
  clearStorage();
  assert.equal(fixture.storage.has("cde_last_export_sir_test"), false);
  assert.equal(fixture.storage.has("cde_last_changes_sir_test"), false);
});
