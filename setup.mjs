// setup.mjs


// --- Displayed Data ---
  // TODO : Display item charges
  // TODO : Display active potions
  // DONE : Display current spell
  // DONE : Display mastery levels
  // DONE : Display astrology bonus modifiers
  // DONE : Display active agility obstacle course
  // DONE : Display global Township data
  // DONE : Display unlocked pets
  // DONE : Display purchased shop upgrades
  // DONE : Display Auto Eat HP limit
  // DONE : Display Auto Looting status
  // DONE : Display unlocked ancient relics
  // DONE : Display unlocked Cartography POIs
  // DONE : Display Casual & Melvor tasks
  // DONE : Display active prayers
  // DONE : Display planted crops (Farming)
  // DONE : Display current monster kill count
  // DONE : Display general game stats

// --- UI / Quality of Life ---
  // DONE : Added export view modal
  // DONE : Auto-copy export to clipboard
  // DONE : Configurable settings (auto-select / auto-copy)

// === Fixes ===
  // FIX  : Export button & auto-copy fix
  // FIX  : FarmingPlot display issue fix

// === Plan to 1.0.0 ===
  // REFACTOR : Renamed openExportUI callback to onExportOpen
  // REFACTOR : Stage 1 – Unified data collection (processCollectData)
  // REFACTOR : Stage 2 – Structured stats display (displayStats)
  // REFACTOR : Stage 3 – Naming normalization & typo cleanup
  // REFACTOR : Stage 4 – Structured JSON export
  // REFACTOR : Stage 5 – Custom export JSON support
  // REFACTOR : Stage 6 – Export compression (e.g., UTF16)
  // REFACTOR : Stage 7 – Settings cleanup and consolidation
  // REFACTOR : Stage 8 - API function

// === Plan to 2.0.0 ===
  // TODO : Link to GPT
  // TODO : Data history save in characterStorage
  // TODO : ETA impl.


// --- Configuration ---
const MOD_VERSION = "1.2.7";
let displayStatsModule = null;
let debugMode = false;

const settingsReference = {
  section: "Interface",
  modEnabled: "mod-enabled",
  autoSelect: "auto-select",
  autoCopy: "auto-copy",
  exportCompress: "export-compress",
  exportBank: "export-bank",
  exportFarming: "export-farming",
  exportStats: "export-stats",
  exportCarto: "export-carto",
  exportMastery: "export-mastery"
};

let settingsSection = null;
function createSettings(settings) {
  settingsSection = settings.section(settingsReference.section);
  settingsSection.add({ type: "switch", name: settingsReference.modEnabled, label: "Enable Mod", hint: "Toggle the Character Data Exporter on or off", default: true });
  settingsSection.add({ type: "switch", name: settingsReference.autoSelect, label: "Auto-Select Export", hint: "Automatically select all text when opening the export window", default: true });
  settingsSection.add({ type: "switch", name: settingsReference.autoCopy, label: "Auto-Copy Export", hint: "Automatically copy export to clipboard when opened", default: false });
  settingsSection.add({ type: "switch", name: settingsReference.exportCompress, label: "Compress Export Output", hint: "Export JSON in a compressed single-line format", default: true });
  settingsSection.add({ type: "switch", name: settingsReference.exportBank, label: "Include Bank Data", hint: "Include inventory and bank items in export", default: true });
  settingsSection.add({ type: "switch", name: settingsReference.exportFarming, label: "Include Farming Data", hint: "Include current farming plots in export", default: true });
  settingsSection.add({ type: "switch", name: settingsReference.exportStats, label: "Include Game Stats", hint: "Include general statistics from all skills and actions", default: true });
  settingsSection.add({ type: "switch", name: settingsReference.exportCarto, label: "Include Cartography Data", hint: "Include discovered POIs and map progress in export", default: true });
  settingsSection.add({ type: "switch", name: settingsReference.exportMastery, label: "Include Mastery Data", hint: "Include mastery levels and XP for each skill action", default: true });
}

function isSettingsAllowed(reference) {
  return settingsSection && reference ? settingsSection.get(reference) : false;
}

const NameSpaces = ["melvorD", "melvorF", "melvorTotH", "melvorAoD", "melvorItA"];

// --- Export Logic ---

let exportData = {};
function getExportJSON() {
  return exportData;
}
function getExportString() {
  return isSettingsAllowed(settingsReference.exportCompress) ? 
    JSON.stringify(getExportJSON()) : 
    JSON.stringify(getExportJSON(), null, 2);
}

function processCollectData() {
  const newData = {};
  newData.basics = collectBasics();
  newData.stats = isSettingsAllowed(settingsReference.exportStats) ? collectGameStats() : { info: "Stats unavailable" };
  newData.shop = collectShopData();
  newData.currentActivity = collectCurrentActivity();
  newData.equipment = collectEquipments();
  newData.equipmentSets = collectEquipmentSets();
  newData.bank = isSettingsAllowed(settingsReference.exportBank) ? collectBankData() : { info: "Bank unavailable" } ;
  newData.skills = collectSkills();
  newData.mastery = isSettingsAllowed(settingsReference.exportMastery) ? collectMastery() : { info: "Mastery unavailable" };
  newData.astrology = collectAstrology();
  newData.agility = collectAgility();
  newData.dungeons = collectDungeons();
  newData.strongholds = collectStrongholds();
  newData.completion = collectCompletion();
  newData.township = collectTownship();
  newData.pets = collectPets();
  newData.ancientRelics = collectAncientRelics();
  newData.cartography = isSettingsAllowed(settingsReference.exportCarto) ? collectCartography() : { info: "Cartography unavailable" };
  newData.farming = isSettingsAllowed(settingsReference.exportFarming) ? collectFarming() : { info: "Farming unavailable" };
  newData.meta = {
    exportTimestamp: new Date().toISOString(),
    version: game.lastLoadedGameVersion,
    modVersion: MOD_VERSION
  };
  return exportData = newData;
}

// --- Collectors ---

function collectBasics() {
  const player = game.combat.player;
  const stats = game.stats;
  const now = new Date();
  const creation = new Date(stats.General.stats.get(3));
  const daysPlayed = Math.floor((now - creation) / (1000 * 60 * 60 * 24));
  return {
    general: {
      currentTime: now.toLocaleString(),
      daysPlayed,
      creationDate: creation.toLocaleString(),
      character: game.characterName,
      gameMode: game.currentGamemode.localID,
      version: game.lastLoadedGameVersion
    },
    currency: {
      gp: game.currencies.getObject('melvorD', 'GP').amount,
      slayerCoins: game.currencies.getObject('melvorD', 'SlayerCoins').amount,
      prayerPoints: player.prayerPoints
    },
    configuration: {
      lootStacking: player.modifiers.allowLootContainerStacking,
      merchantsPermit: game.merchantsPermitRead,
      autoSlayer: player.modifiers.autoSlayerUnlocked,
      autoSwapFood: player.modifiers.autoSwapFoodUnlocked,
      autoBurying: player.modifiers.autoBurying,
      autoEatLimit: game.modifiers.autoEatHPLimit,
      autoLooting: game.modifiers.autoLooting
    },
    modifiers: {
      thievingStealth: game.modifiers.thievingStealth
    }
  };
}

function collectSkills() {
  const result = {};
  game.skills.forEach((skill) => {
    result[skill.id] = {
      name: skill.name,
      level: skill.level,
      xp: skill.xp
    };
  });
  return result;
}

function collectMastery() {
  const result = {};

  game.skills.registeredObjects.forEach((skill) => {
    const masteryMap = skill.actionMastery;
    if (!masteryMap || masteryMap.size === 0) return;

    const entries = {};
    masteryMap.forEach((progress, entry) => {
      entries[entry.name] = {
        id: entry.localID,
        level: progress.level,
        xp: progress.xp
      };
    });

    if (Object.keys(entries).length > 0) {
      result[skill.name] = entries;
    }
  });

  return result;
}

function collectAgility() {
  const result = [];

  game.agility.courses.forEach((course, realm) => {
    const courseData = {
      realm: realm?.name || realm,
      obstacles: [],
    };

    course.builtObstacles?.forEach((obstacle, position) => {
      courseData.obstacles.push({
        position,
        id: obstacle.localID,
        name: obstacle.name,
      });
    });

    result.push(courseData);
  });

  return result;
}

function collectTownship() {
  const ts = game.township;
  const data = ts.townData;

  return {
    level: ts.level,
    population: data?.population ?? null,
    happiness: data?.happiness ?? null,
    education: data?.education ?? null,
    health: data?.health ?? null,
    storageUsed: data?.buildingStorage ?? null,
    worship: data?.worship?.name || null,
    worshipProgress: data?.worshipPercent ?? null,
    souls: data?.souls ?? null,
    worshipCount: data?.worshipCount ?? null
  };
}

function collectPets() {
  const result = [];

  if (game.petManager?.unlocked instanceof Set) {
    game.petManager.unlocked.forEach((pet) => {
      result.push({
        name: pet.name,
        id: pet.localID,
        unlockCount: pet.unlockCount
      });
    });
  }

  return result;
}

function collectAncientRelics() {
  const result = [];

  game.skills.registeredObjects.forEach((skill) => {
    if (!skill.ancientRelicSets || skill.ancientRelicSets.size === 0) return;

    const relics = [];

    skill.ancientRelicSets.forEach((set) => {
      if (!set.foundRelics || set.foundRelics.size === 0) return;

      set.foundRelics.forEach((_, relic) => {
        relics.push({
          name: relic.name,
          id: relic.localID
        });
      });
    });

    if (relics.length > 0) {
      result.push({
        skill: skill.name,
        skillID: skill.localID,
        relics
      });
    }
  });

  return result;
}


function collectCartography() {
  const maps = game.cartography.worldMaps?.registeredObjects;
  const result = [];

  if (!maps || !(maps instanceof Map)) {
    console.warn("[CDE] Cartography maps not found");
    return { level: game.cartography?.level ?? null, maps: result };
  }

  maps.forEach((mapObj, mapKey) => {
    const pois = [];

    // Certains POIs sont dans discoveredPOIs, d'autres dans .pointsOfInterest.registeredObjects
    if (Array.isArray(mapObj.discoveredPOIs)) {
      mapObj.discoveredPOIs.forEach((poi) => {
        pois.push({
          name: poi.name,
          id: poi.localID,
          type: poi.constructor.name
        });
      });
    }

    result.push({
      name: mapObj.name,
      id: mapObj.localID,
      discoveredPOIs: pois,
      totalPOIs: mapObj.pointsOfInterest?.registeredObjects?.size || 0,
      masteredHexes: mapObj.masteredHexes,
      fullySurveyedHexes: mapObj.fullySurveyedHexes,
      unlockedBonuses: mapObj.unlockedMasteryBonuses
    });
  });

  return {
    level: game.cartography.level,
    maps: result
  };
}


function collectFarming() {
  const result = [];
  game.farming.plots.forEach((plot) => {
    const planted = plot.plantedRecipe;
    if (planted) {
      result.push({ category: plot.category.localID, plotID: plot.localID, crop: planted.name, cropID: planted.localID });
    }
  });
  return { level: game.farming.level, plots: result };
}

function collectGameStats() {
  const result = {};
  if (!displayStatsModule || !displayStatsModule.StatTypes || typeof displayStatsModule.displayStatsAsObject !== "function") {
    console.warn("[CDE] displayStatsModule not ready");
    return { error: "Stats module unavailable" };
  }
  displayStatsModule.StatTypes.forEach((type) => {
    const section = displayStatsModule.displayStatsAsObject(game.stats, type);
    if (section) {
      const statName = displayStatsModule.StatNameMap.get(type);
      result[statName] = section;
    }
  });
  return result;
}

function collectAstrology() {
  const result = [];

  if (!game?.astrology?.masteryXPConstellations) {
    console.warn("[CDE] astrology.masteryXPConstellations is missing");
    return result;
  }

  game.astrology.masteryXPConstellations.forEach((entry) => {
    result.push({
      name: entry.name,
      standard: entry.standardModifiers.map((mod) => ({
        bought: mod.timesBought,
        max: mod.maxCount
      })),
      unique: entry.uniqueModifiers.map((mod) => ({
        bought: mod.timesBought,
        max: mod.maxCount
      }))
    });
  });
  return result;
}

function collectShopData() {
  const purchases = [];

  const purchased = game.shop.upgradesPurchased;
  if (purchased && purchased.size > 0) {
    purchased.forEach((qty, item) => {
      purchases.push({
        name: item.name,
        id: item.localID,
        quantity: qty
      });
    });
  }

  return { purchases };
}

function collectEquipments() {
  const equipped = {};
  game.combat.player.equipment.equippedArray.forEach((slotItem) => {
    if (slotItem.quantity > 0) {
      equipped[slotItem.slot.localID] = {
        name: slotItem.item.name,
        id: slotItem.item.localID,
        quantity: slotItem.quantity
      };
    }
  });
  return equipped;
}

function collectEquipmentSets() {
  const sets = [];
  game.combat.player.equipmentSets.forEach((set) => {
    const gear = {};
    set.equipment.equippedArray.forEach((item) => {
      if (item.quantity > 0) {
        gear[item.slot.localID] = {
          name: item.item.name,
          id: item.item.localID,
          quantity: item.quantity
        };
      }
    });
    sets.push(gear);
  });
  return sets;
}

function collectBankData() {
  const bank = [];
  game.bank.items.forEach((entry) => {
    bank.push({
      name: entry.item.name,
      id: entry.item.localID,
      quantity: entry.quantity
    });
  });

  return {
    size: game.bank.items.size,
    capacity: game.combat.player.modifiers.bankSpace + game.bank.baseSlots,
    items: bank
  };
}

function collectCurrentActivity() {
  const result = [];
  const player = game.combat.player;
  const stats = game.stats;
  game.activeActions.registeredObjects.forEach((a) => {
    if (a.isActive) {
      const entry = {
        activity: a.localID,
        level: a.level || null,
        recipe: a.selectedRecipe?.product?.name || null
      };
      if (a.localID === "Combat") {
        entry.area = { name: a.selectedArea?.name, id: a.selectedArea?.localID };
        if (a.selectedMonster) {
          entry.monster = {
            name: a.selectedMonster.name,
            id: a.selectedMonster.localID,
            killCount: stats.monsterKillCount(a.selectedMonster)
          };
        }
        entry.attackType = player.attackType;
      }
      result.push(entry);
    }
  });
  return result;
}

function collectDungeons() {
  const result = [];
  game.combat.dungeonCompletion.keys().forEach((d) => {
    const count = game.combat.dungeonCompletion.get(d);
    if (count > 0) {
      result.push({ name: d.name, id: d.localID, completions: count });
    }
  });
  return result;
}

function collectStrongholds() {
  const result = [];
  game.strongholds.namespaceMaps.forEach((e) => {
    e.forEach((s) => {
      if (s.timesCompleted > 0) {
        result.push({ name: s.name, id: s.localID, completions: s.timesCompleted });
      }
    });
  });
  return result;
}

function collectCompletion() {
  const result = {};
  const itemCur = game.completion.itemProgress.currentCount.data;
  const itemMax = game.completion.itemProgress.maximumCount.data;
  const monCur = game.completion.monsterProgress.currentCount.data;
  const monMax = game.completion.monsterProgress.maximumCount.data;
  NameSpaces.forEach((n) => {
    const itemCount = itemCur.get(n) || 0;
    const itemMaxCount = itemMax.get(n);
    const itemPct = Math.round((itemCount / itemMaxCount) * 100);
    const monsterCount = monCur.get(n) || 0;
    const monsterMax = monMax.get(n);
    const monsterPct = Math.round((monsterCount / monsterMax) * 100);
    result[n] = {
      items: { count: itemCount, max: itemMaxCount, percent: itemPct },
      monsters: { count: monsterCount, max: monsterMax, percent: monsterPct }
    };
  });
  return result;
}

// --- UI Setup ---

function createIconCSS(ctx) {
  document.head.insertAdjacentHTML("beforeend", `
    <style>
      .cde {
        --icon-light: url("${ctx.getResourceUrl("assets/cde-icon-light.png")}");
        --icon-dark: url("${ctx.getResourceUrl("assets/cde-icon-dark.png")}");
      }
    </style>`);
}

function CDEButton(template, cb) {
  return {
    $template: template,
    clickedButton() {
      document.getElementById("cde").blur();
      if (typeof cb === "function") cb();
    }
  };
}

function setupExportButtonUI(cb) {
  ui.create(CDEButton("#cde-button-topbar", cb), document.body);
  const cde = document.getElementById("cde");
  const potions = document.getElementById("page-header-potions-dropdown").parentNode;
  potions.insertAdjacentElement("beforebegin", cde);
}

function writeToClipboard() {
  return new Promise(() => {
    const _asyncCopyFn = async () => {
      try {
        await navigator.clipboard.writeText(getExportString());
        console.log("[CDE] Export successfully copied to clipboard");
      } catch (e) {
        console.error(e);
      }
      window.removeEventListener("focus", _asyncCopyFn);
    };
    window.addEventListener("focus", _asyncCopyFn);
    if (debugMode) console.log("Hit <Tab> to refocus and avoid DOMException");
  });
}

function onExportOpen() {
  if (!isSettingsAllowed(settingsReference.modEnabled)) return;
  
  const cdeTextarea = Swal.getInput();
  if (!cdeTextarea) return;

  cdeTextarea.focus();
  if (isSettingsAllowed(settingsReference.autoSelect)) {
    cdeTextarea.select();
    if (isSettingsAllowed(settingsReference.autoCopy)) writeToClipboard();
  }
}

let exportUI = null;
function openExportUI() {
  processCollectData();
  if (isSettingsAllowed(settingsReference.modEnabled)) {
    if (exportUI) {
      exportUI.inputValue = getExportString();
    } else {
      exportUI = {
        title: "Character Data Exporter",
        input: "textarea",
        inputValue: getExportString(),
        showCloseButton: true,
        showConfirmButton: false,
        allowEnterKey: false,
        inputAttributes: {},
        customClass: { container: "cde-modal" },
        footer: "&nbsp;",
        didOpen: async () => { onExportOpen(); }
      };
    }
    Swal.fire(exportUI);
  }
}

// --- Init ---

export function setup({ onInterfaceReady, settings, api }) {
  console.log("[CDE] Loading ...");
  createSettings(settings);

  onInterfaceReady(async (ctx) => {
    console.log("[CDE] Init Interface");
    displayStatsModule = await ctx.loadModule("displayStats.mjs");
    createIconCSS(ctx);
    setupExportButtonUI(openExportUI);
    console.log("[CDE] loaded !");
  });

  api({
    generateJson: () => {
      return processCollectData();
    },
    exportString: () => {
      processCollectData();
      return getExportString();
    },
    modVersion: () => {
      return MOD_VERSION;
    }
  });
}
