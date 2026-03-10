import test from "node:test";
import assert from "node:assert/strict";

import {
  init,
  getCurrentMonsterData,
  setCurrentMonsterData,
  getCurrentActivityData,
  setCurrentActivityData,
  getCurrentNotification,
  setCurrentNotification,
  getPlayerPendingNotification,
  setPendingNotification,
} from "../modules/cloudStorage.mjs";

function createStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
    clear() {
      values.clear();
    },
    values,
  };
}

function createModules() {
  return {
    getSettings() {
      return {
        isDebug() {
          return false;
        },
      };
    },
    getUtils() {
      return {
        logger() {},
        sanitizeCharacterName(value) {
          return value;
        },
      };
    },
    getMelvorRuntime() {
      return {
        getGame() {
          return { characterName: "Hero" };
        },
      };
    },
    getSettingsDomain() {
      return {
        serializeSettingValue(value) {
          return value;
        },
        deserializeSettingValue(value) {
          return value;
        },
      };
    },
  };
}

test("cloud storage rejects invalid persisted monster activity and notification records", () => {
  const characterStorage = createStorage();
  const accountStorage = createStorage();
  init(createModules(), characterStorage, accountStorage);

  assert.equal(setCurrentMonsterData({ invalid: true }), null);
  assert.equal(setCurrentActivityData(["bad"]), null);
  assert.equal(setCurrentNotification({ bad: true }), null);
  assert.equal(setPendingNotification({ Hero: { bad: true } }), null);

  assert.equal(getCurrentMonsterData(), null);
  assert.equal(getCurrentActivityData(), null);
  assert.equal(getCurrentNotification(), null);
  assert.deepEqual(getPlayerPendingNotification(), {});
});

test("cloud storage preserves valid contract-backed records", () => {
  const characterStorage = createStorage();
  const accountStorage = createStorage();
  init(createModules(), characterStorage, accountStorage);

  const monster = {
    id: "Monster_A",
    killCount: 10,
    startKillcount: 2,
    diffKillcount: 8,
    startTime: Date.now(),
    updateTime: Date.now(),
    startDmgDealt: 100,
    startDmgTaken: 25,
  };
  const activity = {
    Fishing: { startTime: Date.now(), startXp: 100 },
  };
  const notification = {
    playerName: "Hero",
    actionName: "Fishing",
    media: "icon.png",
    requestAt: 1000,
    timeInMs: 5000,
  };

  assert.deepEqual(setCurrentMonsterData(monster), monster);
  assert.deepEqual(setCurrentActivityData(activity), activity);
  assert.deepEqual(setCurrentNotification(notification), notification);
  assert.deepEqual(setPendingNotification({ Hero: notification }), { Hero: notification });

  assert.deepEqual(getCurrentMonsterData(), monster);
  assert.deepEqual(getCurrentActivityData(), activity);
  assert.deepEqual(getCurrentNotification(), notification);
  assert.deepEqual(getPlayerPendingNotification(), notification);
});
