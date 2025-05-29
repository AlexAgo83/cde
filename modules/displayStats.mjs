// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// displayStats.mjs

let mods = null;

/**
 * Initialize the display stats module.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(modules) {
  mods = modules;
}

/**
 * Get the settings reference object.
 * @returns {Object} The settings reference object.
 */
function Stg() {
	return mods.getSettings()?.SettingsReference;
}

export const StatTypes = [
  // @ts-ignore
  GeneralStats, // @ts-ignore
  ShopStats, // @ts-ignore
  CombatStats, // @ts-ignore
  PrayerStats, // @ts-ignore
  SlayerStats, // @ts-ignore 
  WoodcuttingStats, // @ts-ignore
  FishingStats, // @ts-ignore
  FiremakingStats, // @ts-ignore
  CookingsStats, // @ts-ignore
  MiningStats, // @ts-ignore
  SmithingStats, // @ts-ignore
  ThievingStats, // @ts-ignore
  FarmingStats, // @ts-ignore
  FletchingStats, // @ts-ignore
  CraftingStats, // @ts-ignore
  RunecraftingStats, // @ts-ignore
  HerbloreStats, // @ts-ignore
  AgilityStats, // @ts-ignore
  SummoningStats, // @ts-ignore
  AstrologyStats, // @ts-ignore
  AltMagicStats, // @ts-ignore
  TownshipStats 
];

export const StatLabelMap = {
  General: {
    3: "AccountCreationDate",
    1: "TotalItemsSold",
    4: "SignetRingHalvesMissed"
  },
  Shop: {
    5: "ItemsSpent",
    0: "PurchasesMade",
    1: "ItemsPurchased",
    6: "ItemsSold"
  },
  Combat: {
    7: "DamageDealt",
    8: "DamageTaken",
    1: "GoldEarned",
    2: "TimeInCombat",
    0: "MonstersKilled",
    3: "MonstersKilledMagic",
    4: "MonstersKilledRanged",
    5: "MonstersKilledMelee",
    6: "TimeActive",
    10: "BossKills",
    12: "TotalHits"
  },
  Prayer: {
    0: "BonesBuried",
    1: "PrayerXP",
    2: "PrayersCast",
    3: "TotalPrayerTime"
  },
  Slayer: {
    1: "SlayerTasksCompleted"
  },
  Woodcutting: {
    2: "XP",
    0: "LogsCut",
    1: "TimeSpent",
    3: "BirdNestsFound"
  },
  Fishing: {
    0: "FishCaught",
    4: "JunkCaught",
    3: "XP",
    1: "FishCooked",
    2: "TimeSpent"
  },
  Firemaking: {
    0: "LogsBurned",
    4: "BonfiresMade",
    2: "XP",
    8: "CoalBurned",
    5: "SpecialLogsBurned",
    3: "TimeSpent",
    6: "PerfectBonfires"
  },
  Cooking: {
    6: "FoodsCooked",
    3: "TimeSpent",
    0: "MealsBurned",
    2: "XP",
    1: "FoodsBurned",
    4: "MealsCooked",
    5: "MasteryTokensEarned",
    7: "MasteryXpGained"
  },
  Mining: {
    3: "OresMined",
    0: "GemsFound",
    2: "XP",
    4: "SpecialRocksMined",
    6: "TimeSpent",
    1: "RocksMined",
    5: "EssenceMined"
  },
  Smithing: {
    5: "ItemsSmelted",
    8: "BarTypesSmelted",
    0: "ItemsCrafted",
    2: "XP",
    3: "TimeSpent",
    7: "SpecialItemsCrafted",
    1: "BarsUsed",
    6: "PerfectItemsCrafted",
    4: "MasteryXpGained"
  },
  Thieving: {
    0: "TimesThieving",
    1: "GoldEarned",
    2: "XP",
    3: "StealthLost",
    4: "GPFromItems",
    6: "DamageTaken",
    7: "NinjaUnlocks",
    8: "ItemsStolen",
    9: "UniqueItemsStolen"
  },
  Farming: {
    0: "TimesHarvested",
    1: "CompostUsed",
    2: "DeadCrops",
    3: "XP",
    4: "SeedsPlanted",
    5: "MasteryTokens",
    6: "GrowthCycles",
    7: "PotionUsed",
    8: "ItemsHarvested",
    9: "AutoHarvestCount",
    10: "AutoReplantCount",
    11: "FarmingYield"
  },
  Fletching: {
    0: "ItemsFletched",
    1: "GPFromFletching",
    2: "XP",
    3: "BowsCreated",
    4: "CrossbowsCreated",
    5: "BoltsCreated"
  },
  Crafting: {
    0: "ItemsCrafted",
    1: "GPFromCrafting",
    2: "XP",
    3: "JewelryCrafted",
    4: "UrnsCrafted"
  },
  Runecrafting: {
    0: "RunesCrafted",
    1: "GPFromRunes",
    2: "XP",
    3: "StaffsCrafted",
    4: "AltRunesCrafted"
  },
  Herblore: {
    0: "PotionsCrafted",
    1: "XP",
    2: "GPFromPotions",
    3: "HerbsUsed",
    4: "PotionsUsed",
    5: "AltIngredientsUsed",
    6: "PerfectPotionsCrafted"
  },
  Agility: {
    0: "ObstaclesBuilt",
    1: "AgilityItemsCrafted",
    3: "GPSpent"
  },
  Summoning: {
    0: "FamiliarsSummoned",
    1: "XP",
    2: "AltItemsUsed",
    3: "ScrollsUsed",
    4: "FamiliarsUsed",
    9: "AltSummonMaterials"
  },
  Astrology: {
    0: "StarsStudied",
    5: "XP",
    6: "UniqueBonusRerolls",
    7: "StandardBonusRerolls"
  },
  Magic: {
    0: "SpellsCast",
    1: "XP",
    2: "RunesUsed",
    3: "RunesCrafted",
    4: "AltMagicUsed",
    6: "DamageDealt",
    7: "RunesPreserved"
  },
  Township: {
    0: "CitizensBorn",
    1: "CitizensDied",
    2: "GoldEarned",
    3: "ResourcesHarvested",
    4: "TotalTicksElapsed"
  }
};

export const StatNameMap = new Map([
  // @ts-ignore
  [GeneralStats, "General"], // @ts-ignore
  [ShopStats, "Shop"], // @ts-ignore
  [CombatStats, "Combat"], // @ts-ignore
  [PrayerStats, "Prayer"], // @ts-ignore
  [SlayerStats, "Slayer"], // @ts-ignore
  [WoodcuttingStats, "Woodcutting"], // @ts-ignore
  [FishingStats, "Fishing"], // @ts-ignore
  [FiremakingStats, "Firemaking"], // @ts-ignore
  [CookingsStats, "Cooking"], // @ts-ignore
  [MiningStats, "Mining"], // @ts-ignore
  [SmithingStats, "Smithing"], // @ts-ignore
  [ThievingStats, "Thieving"], // @ts-ignore
  [FarmingStats, "Farming"], // @ts-ignore
  [FletchingStats, "Fletching"], // @ts-ignore
  [CraftingStats, "Crafting"], // @ts-ignore
  [RunecraftingStats, "Runecrafting"], // @ts-ignore
  [HerbloreStats, "Herblore"], // @ts-ignore
  [AgilityStats, "Agility"], // @ts-ignore
  [SummoningStats, "Summoning"], // @ts-ignore
  [AstrologyStats, "Astrology"], // @ts-ignore
  [AltMagicStats, "Magic"], // @ts-ignore
  [TownshipStats, "Township"] // @ts-ignore
]);

export function displayStatsAsObject(allStats, statType) {
  const statName = StatNameMap.get(statType);
  if (typeof statName === "undefined" || !allStats[statName]) return null;
  
  const curStats = allStats[statName]?.stats;

  if (!curStats || curStats.size === 0) return null;

  const result = {};
  curStats.keys().forEach((index) => {
    const label = StatLabelMap[statName]?.[index] ?? `Stat_${index}`;
    result[label] = curStats.get(index);
  });

  return result;
}
