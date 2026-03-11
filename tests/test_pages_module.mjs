import test from "node:test";
import assert from "node:assert/strict";

import { init, worker } from "../modules/pages.mjs";
import * as pagesRuntime from "../modules/pagesRuntime.mjs";

function createModules({
  globals = {},
  game = {},
  etaDisplay = true,
  etaSkills = true,
  etaGlobalEvents = true,
  minTick = 50,
} = {}) {
  const patchCalls = [];

  const modules = {
    getSettings() {
      return {
        SettingsReference: {
          ETA_DISPLAY: "ETA_DISPLAY",
          ETA_SKILLS: "ETA_SKILLS",
          ETA_USE_GLOBAL_EVENTS: "ETA_USE_GLOBAL_EVENTS",
          ETA_GLOBAL_EVENTS_RATE: "ETA_GLOBAL_EVENTS_RATE",
          ETA_COMBAT: "ETA_COMBAT",
        },
        isCfg(reference) {
          if (reference === "ETA_DISPLAY") return etaDisplay;
          if (reference === "ETA_SKILLS") return etaSkills;
          if (reference === "ETA_USE_GLOBAL_EVENTS") return etaGlobalEvents;
          if (reference === "ETA_COMBAT") return true;
          return false;
        },
        getCfg(reference) {
          if (reference === "ETA_GLOBAL_EVENTS_RATE") return minTick;
          return null;
        },
        isDebug() {
          return false;
        },
      };
    },
    getMelvorRuntime() {
      return {
        getGame() {
          return game;
        },
        getGlobal(name) {
          return globals[name];
        },
        patch(_ctx, target, method) {
          patchCalls.push([target?.name ?? "anonymous", method]);
          return {
            after() {
              return null;
            },
          };
        },
      };
    },
    getPagesRuntime() {
      return pagesRuntime;
    },
    getCloudStorage() {
      return {
        getCurrentETASize() {
          return "large";
        },
        getCurrentETAPostion() {
          return "center";
        },
      };
    },
    getPanelRenderer() {
      return {
        displayEtaAt() {},
      };
    },
    getNotification() {
      return {
        handleOnCheck() {},
        checkSharedNotification() {},
        clearNotify() {},
      };
    },
    getCollector() {
      return {
        clearMutable() {},
      };
    },
  };

  return { modules, patchCalls };
}

test("pages worker falls back to runtime instance constructors when globals are unavailable", () => {
  function GameCtor() {}
  GameCtor.prototype.tick = function tick() {};
  function CombatCtor() {}
  CombatCtor.prototype.onEnemyDeath = function onEnemyDeath() {};
  CombatCtor.prototype.stop = function stop() {};
  function PlayerCtor() {}
  PlayerCtor.prototype.damage = function damage() {};
  function EnemyCtor() {}
  EnemyCtor.prototype.damage = function damage() {};
  function ThievingCtor() {}
  ThievingCtor.prototype.action = function action() {};
  ThievingCtor.prototype.stop = function stop() {};
  function AltMagicCtor() {}
  AltMagicCtor.prototype.action = function action() {};
  AltMagicCtor.prototype.stop = function stop() {};
  function ArchaeologyCtor() {}
  ArchaeologyCtor.prototype.action = function action() {};
  ArchaeologyCtor.prototype.stop = function stop() {};
  function CartographyCtor() {}
  CartographyCtor.prototype.action = function action() {};
  CartographyCtor.prototype.stop = function stop() {};

  const game = new GameCtor();
  game.combat = new CombatCtor();
  game.combat.player = new PlayerCtor();
  game.combat.enemy = new EnemyCtor();
  game.thieving = new ThievingCtor();
  game.altMagic = new AltMagicCtor();
  game.archaeology = new ArchaeologyCtor();
  game.cartography = new CartographyCtor();

  const fixture = createModules({ game });
  init(fixture.modules);
  worker({});

  assert.deepEqual(
    fixture.patchCalls.map(([name, method]) => `${name}.${method}`),
    [
      "GameCtor.tick",
      "CombatCtor.onEnemyDeath",
      "CombatCtor.stop",
      "PlayerCtor.damage",
      "EnemyCtor.damage",
      "AltMagicCtor.action",
      "AltMagicCtor.stop",
      "ThievingCtor.action",
      "ThievingCtor.stop",
      "ArchaeologyCtor.action",
      "ArchaeologyCtor.stop",
      "CartographyCtor.action",
      "CartographyCtor.stop",
    ],
  );
});

test("pages worker skips unavailable patch targets without throwing", () => {
  const game = { combat: {} };
  const fixture = createModules({ game, globals: {} });

  init(fixture.modules);
  assert.doesNotThrow(() => worker({}));
  assert.equal(fixture.patchCalls.length, 0);
});
