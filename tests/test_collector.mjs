import test from "node:test";
import assert from "node:assert/strict";

import {
  init,
  collectBasics,
  collectCurrentActivity,
  collectAstrology,
  collectCompletion,
  collectSkills,
  collectMastery,
  collectAgility,
  collectActivePotions,
  collectAncientRelics,
  collectDungeons,
  collectStrongholds,
} from "../modules/collector.mjs";

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

test("collectAstrology returns an empty object when astrology runtime data is not ready", () => {
  init({
    getMelvorRuntime() {
      return {
        getGame() {
          return {};
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
      return {};
    },
    getSettings() {
      return {
        isDebug() {
          return false;
        },
      };
    },
  });

  assert.deepEqual(collectAstrology(), {});
});

test("collectCompletion returns an empty object when completion runtime data is not ready", () => {
  init({
    getMelvorRuntime() {
      return {
        getGame() {
          return {};
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
        NameSpaces: ["melvorD"],
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

  assert.deepEqual(collectCompletion(), {});
});

test("collectors tolerate an unavailable game runtime", () => {
  init({
    getMelvorRuntime() {
      return {
        getGame() {
          return undefined;
        },
        getGlobal() {
          return undefined;
        },
      };
    },
    getCollectorDomain() {
      return {
        buildSkillsSnapshot() {
          return { unexpected: true };
        },
        buildMasterySnapshot() {
          return { unexpected: true };
        },
        buildAgilitySnapshot() {
          return { unexpected: true };
        },
        buildActivePotionsSnapshot() {
          return { unexpected: true };
        },
      };
    },
    getUtils() {
      return {
        isDebug() {
          return false;
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

  assert.deepEqual(collectSkills(), {});
  assert.deepEqual(collectMastery(), {});
  assert.deepEqual(collectAgility(), {});
  assert.deepEqual(collectActivePotions(), {});
  assert.deepEqual(collectAncientRelics(), {});
  assert.deepEqual(collectDungeons(), {});
  assert.deepEqual(collectStrongholds(), {});
});

test("collectCurrentActivity infers active non-combat skill from activeAction fallback", () => {
  const craftingSkill = {
    localID: "Crafting",
    maxLevelCap: 120,
    currentLevelCap: 120,
    xp: 12345,
    nextLevelProgress: 55,
    level: 107,
    currentActionInterval: 2000,
    masteryLevelCap: 99,
  };
  const activeAction = {
    localID: "Crafting",
    selectedRecipe: { localID: "Red_D_hide_Body" },
    currentActionInterval: 2000,
    isActive: true,
  };

  init({
    getMelvorRuntime() {
      return {
        getGame() {
          return {
            activeAction,
            skills: {
              registeredObjects: [craftingSkill],
            },
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
          return { registeredObjects: [activeAction] };
        },
        getActiveSkills() {
          return [craftingSkill];
        },
        getRecipeForAction(action) {
          return action.selectedRecipe;
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
        getPreservationChance() {
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

  assert.equal(activity.Crafting.activity, "Crafting");
  assert.equal(activity.Crafting.skills.Crafting.skillID, "Crafting");
  assert.equal(activity.Crafting.skills.Crafting.recipe, "Red_D_hide_Body");
});
