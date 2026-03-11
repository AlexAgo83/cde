import test from "node:test";
import assert from "node:assert/strict";

import {
  isSettingsReferenceContract,
  isPersistedSettingEntryContract,
  isExportMetaContract,
  isChangesHistoryContract,
  isEtaPredictionMapContract,
  isCollectorActivePotionSnapshotContract,
  isCurrentMonsterStorageContract,
  isCurrentActivityStorageContract,
  isNotificationBuilderContract,
  isPendingNotificationStoreContract,
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
      modVersion: "v3.0.9",
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
      modVersion: "v3.0.9",
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

test("eta and collector contracts validate shared prediction and potion snapshot shapes", () => {
  assert.equal(
    isEtaPredictionMapContract({
      1200: { xpCap: 1200, xpDiff: 200, secondsToCap: 7200, timeToCapStr: "7200000ms" },
    }),
    true
  );
  assert.equal(
    isCollectorActivePotionSnapshotContract({
      Fishing: { activity: "Fishing", potion: "Potion_A", charges: 12 },
    }),
    true
  );
});

test("storage contracts validate monster activity and notification payloads", () => {
  assert.equal(
    isCurrentMonsterStorageContract({
      id: "Monster_A",
      killCount: 10,
      startKillcount: 2,
      diffKillcount: 8,
      startTime: new Date(),
      updateTime: Date.now(),
      startDmgDealt: 100,
      startDmgTaken: 25,
    }),
    true
  );
  assert.equal(
    isCurrentActivityStorageContract({
      Woodcutting: { startTime: Date.now(), startXp: 100 },
      Fishing: { currentSkillXp: 2500, lastChange: Date.now() },
    }),
    true
  );
  assert.equal(
    isNotificationBuilderContract({
      playerName: "Hero",
      actionName: "Fishing",
      media: "icon.png",
      requestAt: Date.now(),
      timeInMs: 5000,
    }),
    true
  );
  assert.equal(
    isPendingNotificationStoreContract({
      Hero: {
        playerName: "Hero",
        actionName: "Fishing",
        media: "icon.png",
        requestAt: 1000,
        timeInMs: 5000,
      },
    }),
    true
  );
});
