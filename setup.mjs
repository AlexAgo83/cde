// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// setup.mjs

// === Plan to 1.4.X ===
// Stage 0 - Renamed openExportUI callback to onExportOpen
// Stage 1 – Unified data collection (processCollectData)
// Stage 2 – Structured stats display (displayStats)
// Stage 3 – Naming normalization & typo cleanup
// Stage 4 – Structured JSON export
// Stage 5 – Custom export JSON support
// Stage 6 – Export compression (e.g., UTF16)
// Stage 7 – Settings cleanup and consolidation
// Stage 8 - API function

// === Plan to 1.5.X ===
// Stage 9 - Settings V2
// Stage 10 - Sharing Export Tools (File, Hashebin, Clipboard)

// === Plan to 1.6.X ===
// Stage 11 - View Logs
// Stage 12 - Export download button in modal footer

// === Plan to 1.7.X ===
// Stage 13 - Storage format detection
// Stage 14 - Smart diff on arrays using ID/localID/name as key
// Stage 15 - "View Diff" button to show changelog with color formatting
// Stage 16 - Timelapse history

// === Plan to 1.8.X === 
// Stage 17 - Better data storage management & remove online ress (offline mode)
// Stage 18 - Fully fonctionnal changelog viewer & export viewer
// Stage 19 - Fix Active Potion collector and polish viewer
// Stage 20 - Refactoring views

// === Plan to 1.9.X ===
// Stage 21 - ETA - Combat duration & KpH
// Stage 22 - ETA - Recipe duration & PpH
// Stage 23 - Display ETA Panel

// === Plan to 2.X.X ===


// --- Configuration ---
const MOD_VERSION = "v1.9.89";

// --- Module Imports ---
let mModules = null;

/* @ts-ignore Handle DEVMODE */
function _game()  {  return game;  }
/* @ts-ignore Handle DEVMODE */
function _ui() { return ui; }
/* @ts-ignore Handle DEVMODE */
function _Swal() { return Swal; }

/**
 * Get the proxy-settings reference object.
 * @returns {Object} The settings reference object.
 */
function Stg() {
	if (!mModules) {
        console.warn("[CDE] Module manager not loaded yet");
        return false;
    }
	return mModules.getSettings()?.SettingsReference;
}
/**
 * Get the proxy-boolean value for a settings reference.
 * @returns {boolean} True if the reference is allowed, false otherwise.
 */
function isCfg(reference) {
	if (!mModules) {
        console.warn("[CDE] Module manager not loaded yet", reference);
        return false;
    }
	return mModules.getSettings()?.isCfg(reference);
}

/**
 * Process and collect data for export.
 * This function is called to collect data when the game starts or when the export UI is opened.
 * It uses the `mModules.getExport().processCollectData` method to handle the data collection.
 * The `onCombat`, `onNonCombat`, `onActiveSkill`, and `onSkillsUpdate` callbacks are used to process respective events.
 * 
 * @returns {*} The collected export data.
 */
export const doCollectData = (extractEta=false, timeBuffer=50) => {
	const value = mModules.getExport().processCollectData(
		onCombat, 
		onNonCombat, 
		onActiveSkill,
		onSkillsUpdate,
		extractEta,
		timeBuffer,
		(meta) => {
			meta.modVersion = MOD_VERSION
		}
	);
	if (mModules.getSettings().isDebug()) {
		console.log("[CDE] Requested: processCollectData", value);
	}
	return value;
}

/**
 * ETA - Callback for combat event.
 * This function processes combat entries, updating the current monster data with kill count,
 * time difference, and calculating Kills per Hour (KpH).
 * It also sets the start kill count and start time for the current monster.
 * If the current monster data matches the entry, it updates the statistics accordingly.
 * @param {object} activity 
 * @param {object} entry 
 * @param {Date} [syncDate=new Date()] - The timestamp for the event.
 */
function onCombat(activity, entry, syncDate=new Date()) {
	const currentMonsterData = mModules.getCloudStorage().getCurrentMonsterData();
	const now = syncDate;

	if (isCfg(Stg().ETA_COMBAT) && entry.monster) {
		if (currentMonsterData 
			&& typeof currentMonsterData === 'object' 
			&& currentMonsterData.id === entry.monster.id
			&& currentMonsterData.startKillcount
			&& currentMonsterData.startTime
		) {
			/* Matching current monster */
			entry.monster.startKillcount = currentMonsterData.startKillcount;
			entry.monster.diffKillcount = entry.monster.killCount - entry.monster.startKillcount;

			entry.monster.startTime = new Date(currentMonsterData.startTime);
			entry.monster.diffTime = now.getTime() - entry.monster.startTime.getTime();

			entry.monster.diffTimeStr = mModules.getUtils().formatDuration(entry.monster.diffTime);
			if (entry.monster.diffTime > 0) {
				entry.monster.kph = Math.round(
					(entry.monster.diffKillcount / (entry.monster.diffTime / 3600000)) || 0
				);
			} else {
				entry.monster.kph = "NaN";
			}
			if (mModules.getSettings().isDebug()) {
				console.log("[CDE] Matching current monster data", entry.monster);
			}
		} else {
			if (currentMonsterData 
				&& typeof currentMonsterData === 'object'
				&& mModules.getSettings().isDebug()) {
				console.log("[CDE] Entry change detected", currentMonsterData);
			}
			
			/* New current monster */
			entry.monster.id = entry.monster.id;
			entry.monster.diffKillcount = 0;
			entry.monster.diffTime = 0;
			entry.monster.diffTimeStr = "NaN";
			entry.monster.kph = 0;
			entry.monster.startKillcount = entry.monster.killCount;
			entry.monster.startTime = now;
			if (mModules.getSettings().isDebug()) {
				console.log("[CDE] Start activity trace", entry.monster);
			}
		}

		/* Update the current monster data */
		mModules.getCloudStorage().setCurrentMonsterData(entry.monster);
	}
}

/**
 * ETA - Callback for non-combat event.
 * This function clears the current monster data when a non-combat event occurs,
 * effectively resetting the activity trace for the current monster.
 * @param {object} activity 
 * @param {object} entry 
 * @param {Date} syncDate
 */
function onNonCombat(activity, entry, syncDate=new Date()) {
	/* Reset current monster data memory */
	if (mModules.getCloudStorage().getCurrentMonsterData()) {
		mModules.getCloudStorage().removeCurrentMonsterData();
		if (mModules.getSettings().isDebug()) {
			console.log("[CDE] Clear activity trace", entry.monster);
		}
	}
}

/**
 * ETA - Callback for active skill event.
 * Tracks skill progression, calculates XP left to next level, and estimates XP per hour (XPh).
 * Handles skill data resets on level up and manages skill session timing.
 * @param {string} skillId - The skill identifier.
 * @param {object} data - The skill data object.
 * @param {Date} [syncDate=new Date()] - The timestamp for the event.
 */
function onActiveSkill(skillId, data, syncDate=new Date()) {
	const now = syncDate;

	const nextLevel = data.skillLevel+1;

	const currentXp = data.skillXp;
	const nextLevelXp = mModules.getUtils().getXpForLevel(nextLevel);
	
	data.xpLeft = nextLevelXp > currentXp ? nextLevelXp - currentXp : 0;
	data.nextLevelXp = nextLevelXp > currentXp ? nextLevelXp : 0;

	// Request first record for skill data
	let currentSkillData = mModules.getCloudStorage().getCurrentSkillData();
	if (mModules.getSettings().isDebug()) {
		console.log("[CDE] onActiveSkill:Read (instance/new) skill data", data);
		console.log("[CDE] onActiveSkill:Read (saved/old) skill data", currentSkillData);
	}
	let skill = {};

	if (currentSkillData) {
		if (currentSkillData[skillId]) {
			// Matching skill data entry
			const current = currentSkillData[skillId];

			const isSameLevel = current.startLevel === data.skillLevel;
			const isSameRecipe = (typeof current.startRecipe !== "undefined" && typeof data.recipe !== "undefined")
				? current.startRecipe === data.recipe
				: true;
			if (isSameLevel && isSameRecipe) {
				if (mModules.getSettings().isDebug())
					console.log("[CDE] onActiveSkill:matching skill", current);
		 	} else {
				// Reset if level or recipe change
				if (mModules.getSettings().isDebug()) {
					console.log("[CDE] onActiveSkill:reset on lvl or recipe change", current, data);
				}
				delete currentSkillData[skillId];
			}
			
			let startDate = current.startTime;
			if (!(startDate instanceof Date)) {
				startDate = new Date(startDate);
			}
		}
	} else {
		// New data entry
		currentSkillData = {};
		if (mModules.getSettings().isDebug()) {
			console.log("[CDE] onActiveSkill:new entry");
		}
	}

	if (currentSkillData[skillId] == null) {
		// New skill data records
		skill.startXp = data.skillXp;
		skill.startLevel = data.skillLevel;
		skill.startTime = now;
		skill.startRecipe = data.recipe;
		
		currentSkillData[skillId] = skill;
		if (mModules.getSettings().isDebug()) {
			console.log("[CDE] onActiveSkill:new current skill", skill);
		}
		// Print record for new skill data
		mModules.getCloudStorage().setCurrentSkillData(currentSkillData)
	}

	// ETA Check Skill Progression
	if (isCfg(Stg().ETA_SKILLS) 
		&& data.xpLeft > 0
		&& currentSkillData
		&& currentSkillData[skillId]) {

		// UPDATING ETA ...
		const current = currentSkillData[skillId];
		let startDate = current.startTime;
		if (!(startDate instanceof Date)) {
			startDate = new Date(startDate);
		}
		data.diffTime = now.getTime() - startDate.getTime();
		data.diffTimeStr = mModules.getUtils().formatDuration(data.diffTime);
		data.diffXp = data.skillXp - current.startXp;
		
		// XP per Hour
		if (data.diffTime > 0) {
			data.xph = Math.round(
				(data.diffXp / (data.diffTime / 3600000)) || 0
			);
		} else {
			data.xph = "NaN";
		}

		// Time before next level
		if (data.xph > 0 && data.xpLeft > 0) {
			const secondsToNextLevel = data.xpLeft / (data.xph / 3600);
			data.secondsToNextLevel = +secondsToNextLevel.toFixed(0);
			data.timeToNextLevelStr = mModules.getUtils().formatDuration(data.secondsToNextLevel * 1000);
		}
	}
}

/**
 * ETA - Registered active skill identifiers.
 * Cleans up skill tracking data for skills that are no longer active.
 * @param {Set<string>} identifiers - The set of currently active skill identifiers.
 */
function onSkillsUpdate(identifiers) {
	if (identifiers && identifiers.size > 0) {
		let currentSkillData = mModules.getCloudStorage().getCurrentSkillData();
		if (currentSkillData) {
			const properties = Object.keys(currentSkillData);
			if (mModules.getSettings().isDebug) {
				console.log("[CDE] onSkillsUpdate:", identifiers, properties);
			}
			properties?.forEach(p => {
				if (!identifiers.has(p)) {
					delete currentSkillData[p];
					console.log("[CDE] remove unused skillData.", p);
				}
			});
		}
	}
}

/**
 * Main - Handle settings changes. (Override default action)
 * Handles changes to mod settings, such as toggling debug mode, showing/hiding the export button,
 * cleaning changes history, or clearing storage.
 * @param {*} reference - The settings reference object containing the key and value.
 * @returns {Function|undefined} Optionally returns a function for value propagation.
 */
function onSettingsChange(reference) {
	if (mModules.getSettings().isDebug()) {
		console.log("[CDE] settings - reference triggered:", reference);
	}
	
	let key = reference?.ref;
	let value = reference?.value;

	if (key == Stg().ETA_DISPLAY) {
		mModules.getPages().triggerObservers(value);
		if (mModules.getSettings().isDebug()) {
			console.log("[CDE] Observers triggered (settings) :", value);
		}
		return () => { return value};
	}

	// MODE DEBUG
	if (key == Stg().MOD_DEBUG) {
		mModules.getSettings().setDebug(value);
		if (mModules.getSettings().isDebug()) {
			console.log("[CDE] settings - Debugmode :", value);
		}
		return () => { return value};
	}

	// SHOW BUTTON
	if (key == Stg().SHOW_BUTTON) {
		mModules.getViewer().visibilityExportButton(value);
		if (mModules.getSettings().isDebug()) {
			console.log("[CDE] settings - showButton :", value);
		}
		return () => { return value};
	}

	// MAX CHANGES HISTORY
	if (key == Stg().MAX_CHANGES_HISTORY) {
		mModules.getExport().cleanChangesHistory();
		if (mModules.getSettings().isDebug()) {
			console.log("[CDE] settings - maxChangesHistory :", value);
		}
		return () => { return value};
	}

	// CLEAR STORAGE
	if (key == Stg().CLEAR_STORAGE) {
		mModules.getLocalStorage().clearStorage();
		mModules.getCloudStorage().clearStorage();
		console.log("[CDE] Storage cleared!");
	}

	return () => { return value };
}

/**
 * Main setup entry point for the mod.
 * Registers lifecycle hooks for mod loading, character loading, and interface readiness.
 * Also exposes an API for external use.
 * 
 * @param {Object} context - The setup context object.
 * @param {Object} context.settings - The settings object for the mod.
 * @param {Object} context.api - The API registration function.
 * @param {Object} context.characterStorage - The character storage object.
 * @param {function(Object): Promise<void>} context.onModsLoaded - Called when all mods are loaded, receives the context.
 * @param {function(Object): Promise<void>} context.onCharacterLoaded - Called when the character is loaded, receives the context.
 * @param {function(Object): Promise<void>} context.onInterfaceReady - Called when the interface is ready, receives the context.
 */
export function setup({settings, api, characterStorage, onModsLoaded, onCharacterLoaded, onInterfaceReady}) {
	// Setup OnModsLoaded
	onModsLoaded(async (ctx) => {
		mModules = await ctx.loadModule("modules.mjs");
		mModules.onModuleLoad(ctx);
		console.info("[CDE] Modules loaded !");
	});

	// Setup OnCharacterLoaded
	onCharacterLoaded(async (ctx) => {
		mModules.onDataLoad(settings, characterStorage, onSettingsChange);
		if (isCfg(Stg().AUTO_EXPORT_ONLOAD)) {
			doCollectData();
		}
		console.info("[CDE] Data loaded !");
	});

	// Setup OnInterfaceReady
	onInterfaceReady(async (ctx) => {
		mModules.onViewLoad(ctx);
		
		// Override processCollectData callback (Viewer / Panel)
		mModules.getViewer().getExportView().setCollectCb(doCollectData);
		mModules.getPages().setCollectCb(doCollectData);

		mModules.getPages().triggerObservers(isCfg(Stg().ETA_DISPLAY));
		mModules.getPages().worker(ctx);

		console.log("[CDE] Interface ready !");
	});
	
	// Setup API
	api({
		generate: () => {
			return doCollectData();
		},
		getModules: () => {
			return mModules;
		},
		getViews: () => {
			return mModules.getViewer().getViews();
		},
		setDebug: (toggle) => {
			mModules.getSettings().setDebug(toggle);
		},
		getVersion: () => {
			return MOD_VERSION;
		}
	});
}