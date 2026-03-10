import test from "node:test";
import assert from "node:assert/strict";

import {
  isSettingsReferenceContract,
  isPersistedSettingEntryContract,
  isExportMetaContract,
  isChangesHistoryContract,
} from "../modules/contracts.mjs";

test("settings and persisted-setting contracts accept valid shapes", () => {
  const reference = { section: "General", key: "autoExport", toggle: true };
  const entry = { reference, value: false };

  assert.equal(isSettingsReferenceContract(reference), true);
  assert.equal(isPersistedSettingEntryContract(entry), true);
});

test("settings and persisted-setting contracts reject invalid shapes", () => {
  assert.equal(isSettingsReferenceContract({ section: "General" }), false);
  assert.equal(
    isPersistedSettingEntryContract({ reference: { section: "General", key: 1 }, value: true }),
    false
  );
});

test("export meta contract validates stable export meta payload shape", () => {
  assert.equal(
    isExportMetaContract({
      exportTimestamp: "2026_03_10_10_00_00",
      processTime: 12,
      lastProcessTime: 25,
      processBuffer: 250,
      isFullExport: true,
      gameVersion: "1.3.0",
      modVersion: "v3.0.1",
    }),
    true
  );

  assert.equal(
    isExportMetaContract({
      exportTimestamp: "2026_03_10_10_00_00",
      processTime: "12",
      lastProcessTime: 25,
      processBuffer: 250,
      isFullExport: true,
      gameVersion: "1.3.0",
      modVersion: "v3.0.1",
    }),
    false
  );
});

test("changes history contract validates string keyed changelog maps", () => {
  assert.equal(
    isChangesHistoryContract(
      new Map([
        ["2026_03_10", ["line1", "line2"]],
      ])
    ),
    true
  );

  assert.equal(
    isChangesHistoryContract(
      new Map([
        [42, ["line1"]],
      ])
    ),
    false
  );
});
