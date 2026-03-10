import test from "node:test";
import assert from "node:assert/strict";

import {
  createCollectorExportPlan,
  createCollectorActivityCallbacks,
  collectCollectorDescriptors,
} from "../modules/collectorAdapter.mjs";

function createSettingsReference() {
  return {
    EXPORT_GAMESTATS: "EXPORT_GAMESTATS",
    EXPORT_SHOP: "EXPORT_SHOP",
    EXPORT_EQUIPMENT: "EXPORT_EQUIPMENT",
    EXPORT_EQUIPMENT_SETS: "EXPORT_EQUIPMENT_SETS",
    EXPORT_BANK: "EXPORT_BANK",
    EXPORT_SKILLS: "EXPORT_SKILLS",
    EXPORT_MASTERY: "EXPORT_MASTERY",
    EXPORT_ASTROLOGY: "EXPORT_ASTROLOGY",
    EXPORT_COMPLETION: "EXPORT_COMPLETION",
    EXPORT_TOWNSHIP: "EXPORT_TOWNSHIP",
    EXPORT_PETS: "EXPORT_PETS",
    EXPORT_CARTOGRAPHY: "EXPORT_CARTOGRAPHY",
    EXPORT_FARMING: "EXPORT_FARMING",
  };
}

test("createCollectorExportPlan exposes stable collector boundaries", () => {
  const plan = createCollectorExportPlan(createSettingsReference());

  assert.deepEqual(
    plan.always.map((entry) => entry.key),
    ["basics", "currentActivity"]
  );
  assert.deepEqual(
    plan.full.map((entry) => entry.key),
    ["agility", "activePotions", "dungeons", "strongholds", "ancientRelics"]
  );
  assert.deepEqual(
    plan.optional.map((entry) => entry.key),
    [
      "stats",
      "shop",
      "equipment",
      "equipmentSets",
      "bank",
      "skills",
      "mastery",
      "astrology",
      "completion",
      "township",
      "pets",
      "cartography",
      "farming",
    ]
  );
  assert.equal(plan.optional[0].configRef, "EXPORT_GAMESTATS");
  assert.equal(plan.optional[0].fallback, "Stats data unavailable");
});

test("createCollectorActivityCallbacks preserves ETA callback names", () => {
  const callbacks = createCollectorActivityCallbacks({
    onCombat: "combat",
    onNonCombat: "nonCombat",
    onActiveSkill: "activeSkill",
    onSkillsUpdate: "skillsUpdate",
  });

  assert.deepEqual(callbacks, {
    onCombat: "combat",
    onNonCombat: "nonCombat",
    onActiveSkill: "activeSkill",
    onSkillsUpdate: "skillsUpdate",
  });
});

test("collectCollectorDescriptors invokes collector methods and passes activity callbacks in order", () => {
  const calls = [];
  const collector = {
    collectBasics() {
      calls.push(["collectBasics"]);
      return { character: "Hero" };
    },
    collectCurrentActivity(...args) {
      calls.push(["collectCurrentActivity", ...args]);
      return { skill: "Fishing" };
    },
  };

  const result = collectCollectorDescriptors(
    collector,
    createCollectorExportPlan(createSettingsReference()).always,
    {
      callbacks: {
        onCombat: "combat",
        onNonCombat: "nonCombat",
        onActiveSkill: "activeSkill",
        onSkillsUpdate: "skillsUpdate",
      },
    }
  );

  assert.deepEqual(result, {
    basics: { character: "Hero" },
    currentActivity: { skill: "Fishing" },
  });
  assert.deepEqual(calls, [
    ["collectBasics"],
    ["collectCurrentActivity", "combat", "nonCombat", "activeSkill", "skillsUpdate"],
  ]);
});

test("collectCollectorDescriptors returns legacy info fallback for disabled optional sections", () => {
  const collector = {
    collectGameStats() {
      throw new Error("disabled section should not be collected");
    },
    collectSkills() {
      return { melvorD: { level: 99 } };
    },
  };

  const plan = createCollectorExportPlan(createSettingsReference());
  const result = collectCollectorDescriptors(collector, [
    plan.optional[0],
    plan.optional[5],
  ], {
    isEnabled(reference) {
      return reference === "EXPORT_SKILLS";
    },
  });

  assert.deepEqual(result, {
    stats: { info: "Stats data unavailable" },
    skills: { melvorD: { level: 99 } },
  });
});
