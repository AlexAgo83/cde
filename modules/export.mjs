// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// export.mjs

let mods = null;
let exportData = null;
let etaData = null;
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

/**
 * Get the last export data as a JSON object, either from cache or from local storage.
 * @returns {Object} The export data as a JSON object.
 */
export function getExportJSON() {
	const resolvedExport = mods.getExportDomain().resolveExportCache(
		exportData,
		() => mods.getLocalStorage().getLastExportFromStorage()
	);
	if (exportData == null) {
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] Export cache requested!")
		}
		exportData = resolvedExport;
	}
	return exportData;
}

/**
 * Get the export data as a JSON string, either compressed or pretty-printed depending on settings.
 * @returns {string} The export data as a JSON string.
 */
export function getExportString() {
	const settings = mods.getSettings();
	return mods.getExportDomain().stringifyExport(
		getExportJSON(),
		settings.isCfg(settings.SettingsReference.EXPORT_COMPRESS)
	);
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
		changesHistory = mods.getExportDomain().normalizeChangesHistory(stored);
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
	
	const result = mods.getExportDomain().appendChangesHistory(
		getChangesHistory(),
		key,
		data,
		getMaxHistorySetting()
	);
	changesHistory = result.history;

	for (const removedKey of result.removedKeys) {
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] Remove old history entry:", removedKey);
		}
	}

	if (getMaxHistorySetting() > 0) {
		mods.getLocalStorage().saveChangesToStorage(changesHistory);
	}
}

/**
 * Get the maximum number of entries to keep in the changes history.
 * @returns {number} The maximum number of history entries.
 */
export function getMaxHistorySetting() {
	try {
		const settings = mods.getSettings();
		return mods.getExportDomain().parseMaxHistory(
			settings.getCfg(settings.SettingsReference.MAX_CHANGES_HISTORY),
			10
		);
	} catch (e) {
		console.error(e);
	}
	return 0;
}

/**
 * Clean the changes history to not exceed the configured maximum.
 */
export function cleanChangesHistory() {
	const result = mods.getExportDomain().trimChangesHistory(getChangesHistory(), getMaxHistorySetting());
	changesHistory = result.history;

	for (const removedKey of result.removedKeys) {
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] Remove old history entry:", removedKey);
		}
	}
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
	const settings = mods.getSettings();
	const _mc = mods.getCollector();
	const settingsRefs = settings.SettingsReference;
	const collectorPlan = mods.getCollectorAdapter().createCollectorExportPlan(settingsRefs);
	const activityCallbacks = mods.getCollectorAdapter().createCollectorActivityCallbacks({
		onCombat,
		onNonCombat,
		onActiveSkill,
		onSkillsUpdate: onSkllsUpdate
	});
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

	Object.assign(newData, mods.getCollectorAdapter().collectCollectorDescriptors(_mc, [
		collectorPlan.always[0]
	]));

	const startExecutionTime = new Date().getTime();
	Object.assign(newData, mods.getCollectorAdapter().collectCollectorDescriptors(
		_mc,
		[collectorPlan.always[1]],
		{ callbacks: activityCallbacks }
	));
	const endExecutionTime = new Date().getTime();

	if (!extractEta) {
		Object.assign(newData, mods.getCollectorAdapter().collectCollectorDescriptors(_mc, collectorPlan.full));
		Object.assign(
			newData,
			mods.getCollectorAdapter().collectCollectorDescriptors(_mc, collectorPlan.optional, {
				isEnabled: (reference) => settings.isCfg(reference)
			})
		);
	}

	/* Meta */
	const executionTime = endExecutionTime - startExecutionTime;
	newData.meta = {
		exportTimestamp: mods.getUtils().parseTimestamp(date),
		processTime: executionTime,
		lastProcessTime: diffExecution,
		processBuffer: timeBuffer,
		isFullExport: !extractEta,
		gameVersion: mods.getMelvorRuntime().getGame().lastLoadedGameVersion,
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

	if (settings.isCfg(settingsRefs.SAVE_TO_STORAGE)) {
		const copy = mods.getExportDomain().cloneExportSnapshot(newData);
		
		// Generate Diff
		if (settings.isCfg(settingsRefs.GENERATE_DIFF)) {
			const lastExport = mods.getLocalStorage().getLastExportFromStorage();	
			const charName = mods.getMelvorRuntime().getGame().characterName || "Unknown";
			const exportTime = mods.getUtils().dateToLocalString(new Date());
			const header = mods.getExportDomain().buildChangesHeader(charName, exportTime);
			changesData = mods.getExportDomain().buildChangesDiff({
				previousExport: lastExport,
				nextExport: copy,
				header,
				diff: mods.getUtils().deepDiff
			});
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
	exportData = null;
	etaData = null;
	changesData = [];
	changesHistory = null;
	mods.getCollector().clearMutable();
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
