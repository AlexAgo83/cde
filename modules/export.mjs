// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// export.mjs

let mods = null;
let exportData = {};
let changesData = [];
let changesHistory = null;

/**
 * Initialize the export module.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(modules) {
	mods = modules;
}
function _game() {
	// @ts-ignore
	return game;
}

// --- Export Logic ---
export function getExportJSON() {
	if (exportData == null) {
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] Export cache requested!")
		}
		exportData = mods.getLocalStorage().getLastExportFromStorage();
	}
	return exportData;
}
export function getExportString() {
	return mods.getSettings().isCfg(mods.getSettings().SettingsReference.EXPORT_COMPRESS) ? 
	JSON.stringify(getExportJSON()) : 
	JSON.stringify(getExportJSON(), null, 2);
}

// --- Changes Logic ---
export function getChangesData() {
	return changesData;
}
export function getChangesHistory() {
	if (changesHistory == null) {
		const stored = mods.getLocalStorage().getChangesFromStorage();
		changesHistory = stored instanceof Map ? stored : new Map();
	}
	return changesHistory;
}
export function submitChangesHistory(data) {
	const date = new Date();
	const key = date.toISOString().split("T")[0] + "_" + date.toTimeString().split(" ")[0].replace(/:/g, "");
	
	const items = getChangesHistory();
	items.set(key, data);
	
	cleanChangesHistory();
	if (getMaxHistorySetting() > 0) {
		mods.getLocalStorage().saveChangesToStorage(items);
	}
}
export function getMaxHistorySetting() {
	try {
		let val = mods.getSettings().getCfg(mods.getSettings().SettingsReference.MAX_CHANGES_HISTORY);
		val = parseInt(val, 10);
		if (isNaN(val)) val = 10; // fallback
		return val;
	} catch (e) {
		console.error(e);
	}
	return 0;
}
export function cleanChangesHistory() {
	const history = getChangesHistory();
	const maxHistory = getMaxHistorySetting();
	
	while (history.size > maxHistory) {
		const oldestKey = history.keys().next().value;
		history.delete(oldestKey);
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] Remove old history entry:", oldestKey);
		}
	}
}

// Collector
export function collector(cfgRef, collectorFn, fallbackMsg) {
	return mods.getSettings().isCfg(cfgRef) ? collectorFn() : { info: fallbackMsg };
}

export function processCollectData(onCombat, onNonCombat, onMeta) {
	const newData = {};

	const _mc = mods.getCollector();
	const _sr = mods.getSettings().SettingsReference;

	newData.basics = _mc.collectBasics();
	newData.currentActivity = _mc.collectCurrentActivity(onCombat, onNonCombat);
	newData.agility = _mc.collectAgility();
	newData.activePotions = _mc.collectActivePotions();
	newData.dungeons = _mc.collectDungeons();
	newData.strongholds = _mc.collectStrongholds();
	newData.ancientRelics = _mc.collectAncientRelics();

	newData.stats = collector(_sr.EXPORT_GAMESTATS, _mc.collectGameStats, "Stats data unavailable");
	newData.shop = collector(_sr.EXPORT_SHOP, _mc.collectShopData, "Shop data unavailable");
	newData.equipment = collector(_sr.EXPORT_EQUIPMENT, _mc.collectEquipments, "Equipment data unavailable");
	newData.equipmentSets = collector(_sr.EXPORT_EQUIPMENT_SETS, _mc.collectEquipmentSets, "Equipment sets data unavailable");
	newData.bank = collector(_sr.EXPORT_BANK, _mc.collectBankData, "Bank data unavailable");
	newData.skills = collector(_sr.EXPORT_SKILLS, _mc.collectSkills, "Skills data unavailable");
	newData.mastery = collector(_sr.EXPORT_MASTERY, _mc.collectMastery, "Mastery data unavailable");
	newData.astrology = collector(_sr.EXPORT_ASTROLOGY, _mc.collectAstrology, "Astrology data unavailable");
	newData.completion = collector(_sr.EXPORT_COMPLETION, _mc.collectCompletion, "Completion data unavailable");
	newData.township = collector(_sr.EXPORT_TOWNSHIP, _mc.collectTownship, "Township data unavailable");
	newData.pets = collector(_sr.EXPORT_PETS, _mc.collectPets, "Pets data unavailable");
	newData.cartography = collector(_sr.EXPORT_CARTOGRAPHY, _mc.collectCartography, "Cartography data unavailable");
	newData.farming = collector(_sr.EXPORT_FARMING, _mc.collectFarming, "Farming data unavailable");

	newData.meta = {
		exportTimestamp: new Date().toISOString(),
		version: _game().lastLoadedGameVersion
	};
    onMeta(newData.meta);
	
	if (mods.getSettings().isCfg(mods.getSettings().SettingsReference.SAVE_TO_STORAGE)) {
		const copy = JSON.parse(JSON.stringify(newData));
		
		// Generate Diff
		if (mods.getSettings().isCfg(mods.getSettings().SettingsReference.GENERATE_DIFF)) {
			const lastExport = mods.getLocalStorage().getLastExportFromStorage();	
			const charName = _game().characterName || "Unknown";
			const exportTime = new Date().toLocaleString();
			const header = `🧾 Changelog for: ${charName} — ${exportTime}`;
			if (lastExport) {
				changesData = [header, ...mods.getUtils().deepDiff(lastExport, copy)];
			} else {
				changesData = [header, "🆕 First export — no previous data to compare."];
			}
			submitChangesHistory(changesData);
		}
		
		// Save to storage
		mods.getLocalStorage().saveExportToStorage(copy);
	}
	
	// Finalize..
	exportData = newData;
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] exportData updated: ", exportData);
	}
	return exportData;
}

export function resetExportData() {
	exportData = {};
	changesData = [];
	changesHistory = null;
	mods.getLocalStorage().saveExportToStorage(null);
	mods.getLocalStorage().saveChangesToStorage(null);
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] Export data and changes history reset.");
	}
}

export function resetChangesHistory() {
	changesData = [];
	changesHistory = null;
	mods.getLocalStorage().saveChangesToStorage(null);
}