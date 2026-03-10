import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBasicsSnapshot,
  buildSkillsSnapshot,
  buildMasterySnapshot,
  buildAgilitySnapshot,
  buildActivePotionsSnapshot,
} from "../modules/collectorDomain.mjs";

test("buildBasicsSnapshot formats general currency and configuration sections", () => {
  const now = new Date("2026-03-10T10:00:00.000Z");
  const result = buildBasicsSnapshot({
    now,
    rawCreation: "2026-03-05T10:00:00.000Z",
    characterName: "Hero",
    gameModeId: "Standard",
    gameVersion: "1.0.0",
    gp: 123,
    slayerCoins: 45,
    prayerPoints: 67,
    configuration: {
      lootStacking: true,
      merchantsPermit: false,
      autoSlayer: true,
      autoSwapFood: false,
      autoBurying: true,
      autoEatLimit: 80,
      autoLooting: true,
    },
    modifiers: {
      thievingStealth: 12,
    },
    formatDate(value) {
      return value.toISOString();
    },
  });

  assert.deepEqual(result, {
    general: {
      currentTime: "2026-03-10T10:00:00.000Z",
      daysPlayed: 5,
      creationDate: "2026-03-05T10:00:00.000Z",
      character: "Hero",
      gameMode: "Standard",
      version: "1.0.0",
    },
    currency: {
      gp: 123,
      slayerCoins: 45,
      prayerPoints: 67,
    },
    configuration: {
      lootStacking: true,
      merchantsPermit: false,
      autoSlayer: true,
      autoSwapFood: false,
      autoBurying: true,
      autoEatLimit: 80,
      autoLooting: true,
    },
    modifiers: {
      thievingStealth: 12,
    },
  });
});

test("buildSkillsSnapshot maps skill runtime objects to export payload", () => {
  const result = buildSkillsSnapshot([
    { id: "skillA", name: "Fishing", level: 99, xp: 13034431 },
    { id: "skillB", name: "Mining", level: 42, xp: 123456 },
  ]);

  assert.deepEqual(result, {
    skillA: { name: "Fishing", level: 99, xp: 13034431 },
    skillB: { name: "Mining", level: 42, xp: 123456 },
  });
});

test("buildMasterySnapshot keeps only skills with mastery entries", () => {
  const result = buildMasterySnapshot([
    {
      localID: "Cooking",
      actionMastery: new Map([
        [{ localID: "Shrimp" }, { level: 12, xp: 345 }],
        [{ localID: "Lobster" }, { level: 55, xp: 6789 }],
      ]),
    },
    {
      localID: "Agility",
      actionMastery: new Map(),
    },
  ]);

  assert.deepEqual(result, {
    Cooking: {
      Shrimp: { id: "Shrimp", level: 12, xp: 345 },
      Lobster: { id: "Lobster", level: 55, xp: 6789 },
    },
  });
});

test("buildAgilitySnapshot maps courses by realm and obstacle id", () => {
  const courses = new Map([
    [
      { localID: "melvorD:RealmA" },
      {
        builtObstacles: [
          { localID: "obs1", name: "Rope" },
          { localID: "obs2", name: "Gap" },
        ],
      },
    ],
  ]);

  const result = buildAgilitySnapshot(courses);

  assert.deepEqual(result, {
    "melvorD:RealmA": {
      realmId: "melvorD:RealmA",
      obstacles: {
        obs1: { position: 0, id: "obs1", name: "Rope" },
        obs2: { position: 1, id: "obs2", name: "Gap" },
      },
    },
  });
});

test("buildActivePotionsSnapshot maps active potions by activity id", () => {
  const activePotions = new Map([
    [
      { localID: "Fishing" },
      {
        item: { localID: "Potion_A" },
        charges: 12,
      },
    ],
  ]);

  const result = buildActivePotionsSnapshot(activePotions);

  assert.deepEqual(result, {
    Fishing: {
      activity: "Fishing",
      potion: "Potion_A",
      charges: 12,
    },
  });
});
