import test from "node:test";
import assert from "node:assert/strict";

import { init, collectBasics, collectCurrentActivity } from "../modules/collector.mjs";

test("collectBasics falls back safely when combat and modifiers are not ready yet", () => {
  init({
    getMelvorRuntime() {
      return {
        getGame() {
          return {
            characterName: "Hero",
            currentGamemode: { localID: "Standard" },
            lastLoadedGameVersion: "1.0.0",
            stats: {
              General: {
                stats: new Map([[3, "2026-03-05T10:00:00.000Z"]]),
              },
            },
            currencies: {
              getObject(_namespace, key) {
                return { amount: key === "GP" ? 100 : 50 };
              },
            },
          };
        },
      };
    },
    getCollectorDomain() {
      return {
        buildBasicsSnapshot(value) {
          return value;
        },
      };
    },
    getUtils() {
      return {
        dateToLocalString(value) {
          return value.toISOString();
        },
      };
    },
  });

  const basics = collectBasics();

  assert.equal(basics.characterName, "Hero");
  assert.equal(basics.prayerPoints, 0);
  assert.equal(basics.configuration.autoLooting, false);
  assert.equal(basics.modifiers.thievingStealth, 0);
});

test("collectCurrentActivity falls back safely when combat is not ready yet", () => {
  init({
    getMelvorRuntime() {
      return {
        getGame() {
          return {
            stats: undefined,
          };
        },
        getGlobal() {
          return undefined;
        },
      };
    },
    getCollectorDomain() {
      return {};
    },
    getUtils() {
      return {
        getActiveActions() {
          return {
            registeredObjects: [
              {
                isActive: true,
                localID: "Combat",
                selectedArea: { localID: "Area", name: "Area" },
                selectedMonster: { localID: "Monster", name: "Monster", media: "monster.png" },
              },
            ],
          };
        },
        getActiveSkills() {
          return [];
        },
        getRecipeForAction() {
          return null;
        },
        getRecipeCursorForAction() {
          return null;
        },
        isMultiRecipe() {
          return false;
        },
        isParallelRecipe() {
          return false;
        },
        getDungeonCount() {
          return 0;
        },
      };
    },
    getSettings() {
      return {
        isDebug() {
          return false;
        },
      };
    },
  });

  const activity = collectCurrentActivity(() => {}, () => {}, () => {}, () => {});

  assert.equal(activity.Combat.attackType, undefined);
  assert.equal(activity.Combat.monster.killCount, 0);
});
