import test from "node:test";
import assert from "node:assert/strict";

import * as combatPanel from "../pages/combatPanel.mjs";
import { createInstance as createNonCombatPanel } from "../pages/nonCombatPanel.mjs";

function createModulesFixture({
  settingsFlags = {},
  game = { skills: { registeredObjects: [] } },
  activePotions = null,
} = {}) {
  const settingsReference = {
    ETA_DISPLAY: "ETA_DISPLAY",
    ETA_LIVE_DPS: "ETA_LIVE_DPS",
    ETA_NOTIFICATION: "ETA_NOTIFICATION",
    ETA_AUTO_NOTIFY: "ETA_AUTO_NOTIFY",
  };
  const flags = {
    ETA_DISPLAY: true,
    ETA_LIVE_DPS: false,
    ETA_NOTIFICATION: false,
    ETA_AUTO_NOTIFY: false,
    ...settingsFlags,
  };

  return {
    getSettings() {
      return {
        SettingsReference: settingsReference,
        isCfg(reference) {
          return Boolean(flags[reference]);
        },
        isDebug() {
          return false;
        },
      };
    },
    getCloudStorage() {
      return {
        getCurrentETASize() {
          return "large";
        },
        isEtaVisible() {
          return true;
        },
      };
    },
    getUtils() {
      return {
        logger() {},
        getIfExist(value, key) {
          return value?.[key];
        },
        formatDuration(value) {
          return `fmt:${value}`;
        },
        dateToLocalString(value) {
          return value instanceof Date ? value.toISOString() : String(value);
        },
        sanitizeLocalID(value) {
          return String(value).toLowerCase();
        },
        showContainer() {},
      };
    },
    getNotification() {
      return {
        displayNotification() {
          return [];
        },
        createButton(id) {
          return `<button id="${id}"></button>`;
        },
        createClickAction(id, data) {
          return { id, data };
        },
        newDataObject(label, media, timeInMs, autoNotify) {
          return { label, media, timeInMs, autoNotify };
        },
        registerButton(id, clickAction) {
          return { event: clickAction, data: clickAction.data };
        },
        onSubmit_fromAutoNotify() {},
      };
    },
    getCollector() {
      return {
        collectActivePotionsForDisplay() {
          return activePotions;
        },
      };
    },
    getMelvorRuntime() {
      return {
        getGame() {
          return game;
        },
      };
    },
  };
}

test("combat panel refreshes once and then throttles repeated calls", () => {
  const parent = { innerHTML: "" };
  combatPanel.init(createModulesFixture());
  combatPanel.setControlsPanelCb(() => "<controls />");
  combatPanel.setCollectCb(() => ({
    currentActivity: {
      Combat: {
        monster: {
          kph: 42,
          diffTime: 1000,
        },
      },
    },
  }));

  combatPanel.container(parent, "summary-combat", "combat");
  assert.equal(combatPanel.onRefresh("large"), true);
  assert.match(parent.innerHTML, /cde-combat-panel/);
  assert.equal(combatPanel.onRefresh("large"), null);
});

test("non-combat panel refreshes visible content and throttles repeated calls", () => {
  const parent = { innerHTML: "" };
  const panel = createNonCombatPanel("fishing");
  panel.init(createModulesFixture({
    game: {
      skills: {
        registeredObjects: [
          { localID: "Fishing", name: "Fishing", media: "fish.png" },
        ],
      },
    },
  }));
  panel.setControlsPanelCb(() => "<controls />");
  panel.setCollectCb(() => ({
    currentActivity: {
      Fishing: {
        skills: {
          Fishing: {
            diffTime: 1000,
            secondsToNextLevel: 5,
            skillLevel: 1,
            skillMaxLevel: 99,
            skillNextLevelProgress: 12.34,
            predictLevels: {
              10: { secondsToCap: 20 },
            },
          },
        },
      },
    },
  }));

  panel.container(parent, "summary-fishing", "fishing");
  assert.equal(panel.onRefresh("large"), true);
  assert.match(parent.innerHTML, /cde-fishing-panel/);
  assert.equal(panel.onRefresh("large"), null);
});
