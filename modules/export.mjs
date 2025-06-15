// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// export.mjs

let mods = null;
let exportData = {};
let etaData = {};
let changesData = [];
let changesHistory = null;
let lastTimeBuffer = null;

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

/**
 * Get the proxy-settings reference object.
 * @returns {Object} The settings reference object.
 */
function Stg() {
	return mods.getSettings()?.SettingsReference;
}

/**
 * Get the boolean value for a settings reference.
 * @param {*} reference - The settings reference to check.
 * @returns {boolean} True if the reference is allowed, false otherwise.
 */
function isCfg(reference) {
	return mods.getSettings()?.isCfg(reference);
}

/**
 * Get the last export data as a JSON object, either from cache or from local storage.
 * @returns {Object} The export data as a JSON object.
 */
export function getExportJSON() {
	if (exportData == null) {
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] Export cache requested!")
		}
		exportData = mods.getLocalStorage().getLastExportFromStorage();
	}
	return exportData;
}

/**
 * Get the export data as a JSON string, either compressed or pretty-printed depending on settings.
 * @returns {string} The export data as a JSON string.
 */
export function getExportString() {
	return isCfg(Stg().EXPORT_COMPRESS) ? 
	JSON.stringify(getExportJSON()) : 
	JSON.stringify(getExportJSON(), null, 2);
}

/**
 * Get the last generated changes (diff) array.
 * @returns {Array} The changes data array.
 */
export function getChangesData() {
	return changesData;
}

/**
 * Get the saved changes history as a Map.
 * @returns {Map} The changes history.
 */
export function getChangesHistory() {
	if (changesHistory == null) {
		const stored = mods.getLocalStorage().getChangesFromStorage();
		changesHistory = stored instanceof Map ? stored : new Map();
	}
	return changesHistory;
}

/**
 * Add a new entry to the changes history, clean up if needed, and save to storage.
 * @param {Array} data - The changes data to add to the history.
 */
export function submitChangesHistory(data) {
	const date = new Date();
	const key = mods.getUtils().parseTimestamp(date);
	
	const items = getChangesHistory();
	items.set(key, data);
	
	cleanChangesHistory();
	if (getMaxHistorySetting() > 0) {
		mods.getLocalStorage().saveChangesToStorage(items);
	}
}

/**
 * Get the maximum number of entries to keep in the changes history.
 * @returns {number} The maximum number of history entries.
 */
export function getMaxHistorySetting() {
	try {
		let val = mods.getSettings().getCfg(Stg().MAX_CHANGES_HISTORY);
		val = parseInt(val, 10);
		if (isNaN(val)) val = 10; // fallback
		return val;
	} catch (e) {
		console.error(e);
	}
	return 0;
}

/**
 * Clean the changes history to not exceed the configured maximum.
 */
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

/**
 * Utility to collect data if the config allows, otherwise returns a fallback message.
 * @param {*} cfgRef - The config reference to check.
 * @param {Function} collectorFn - The collector function to call if allowed.
 * @param {string} fallbackMsg - The message to return if not allowed.
 * @returns {*} The collected data or an info object.
 */
export function collector(cfgRef, collectorFn, fallbackMsg) {
	return isCfg(cfgRef) ? collectorFn() : { info: fallbackMsg };
}

/**
 * Collects all character data, calls all collectors, handles saving and diff generation.
 * @param {Function} onCombat - Callback for combat events.
 * @param {Function} onNonCombat - Callback for non-combat events.
 * @param {Function} onActiveSkill - Callback for active skill events.
 * @param {Function} onSkllsUpdate - Callback for updating active skills.
 * @param {boolean} extractEta - Force a custom processing
 * @param {Number} timeBuffer - Force a custom buffer time
 * @param {Function} onMeta - Callback to enrich export metadata.
 * @returns {Object} The generated export data.
 */
export function processCollectData(onCombat, onNonCombat, onActiveSkill, onSkllsUpdate, extractEta=false, timeBuffer=250, onMeta) {
	const newData = {};

	const _mc = mods.getCollector();
	const _sr = Stg();
	const date = new Date();
	const diffExecution = lastTimeBuffer ? (date.getTime() - lastTimeBuffer.getTime()) : 0;

	if (lastTimeBuffer == null  
		|| (lastTimeBuffer.getTime() + timeBuffer) < date.getTime()
		|| timeBuffer == 0) {
		lastTimeBuffer = date;
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] ETA - Update trace: ", date);
		}
	} else if (extractEta) {
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] ETA - collect skipped: ", etaData);
		}
		/* RETURN LAST SNAPSHOT (BUFFER) */
		return etaData;
	} else {
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] ETA - Running collect to refresh data.");
		}
	}

	newData.basics = _mc.collectBasics();

	const startExecutionTime = new Date().getTime();
	newData.currentActivity = _mc.collectCurrentActivity(onCombat, onNonCombat, onActiveSkill, onSkllsUpdate);
	const endExecutionTime = new Date().getTime();

	if (!extractEta) {
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
	}

	/* Meta */
	const executionTime = endExecutionTime - startExecutionTime;
	newData.meta = {
		exportTimestamp: mods.getUtils().parseTimestamp(date),
		processTime: executionTime,
		lastProcessTime: diffExecution,
		processBuffer: timeBuffer,
		isFullExport: !extractEta,
		gameVersion: _game().lastLoadedGameVersion,
		modVersion: mods.getModVersion()
	};
    if (typeof onMeta === "function") onMeta(newData.meta);

	// Custom result for extract ETA
	if (extractEta) {
		etaData = newData;
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] exportData for quick ETA: ", newData);
		}
		return etaData;
	}

	if (isCfg(Stg().SAVE_TO_STORAGE)) {
		const copy = JSON.parse(JSON.stringify(newData));
		
		// Generate Diff
		if (isCfg(Stg().GENERATE_DIFF)) {
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
	etaData = newData;
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] exportData updated: ", exportData);
	}
	return exportData;
}

/**
 * Reset all export data and changes history.
 */
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

/**
 * Reset only the changes history.
 */
export function resetChangesHistory() {
	changesData = [];
	changesHistory = null;
	mods.getLocalStorage().saveChangesToStorage(null);
}