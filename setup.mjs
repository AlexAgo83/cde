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

// === Plan to 2.0.X ===
// Stage 23 - ETA - Mastery
// Stage 24 - ETA - Next Skill & Mastery Levels

// === Plan to 2.1.X ===
// Stage 25 - ETA - Recipe Queue & bank
// Stage 26 - Live DPS
// Stage 27 - ETA Display Mode
// Stage 28 - Notification

// === Plan to 2.2.X ===
// Stage 29 - Agility ETA
// Stage 30 - Improve Summoning ETA
// Stage 31 - Cartography Paper Please!

// --- Configuration ---
const MOD_VERSION = "v2.1.63";

// --- Module Imports ---
let mModules = null;

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
		mModules.getETA().onCombat, 
		mModules.getETA().onNonCombat, 
		mModules.getETA().onActiveSkill,
		mModules.getETA().onSkillsUpdate,
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
		mModules.onModuleLoad(ctx, MOD_VERSION);
		console.info("[CDE] Modules loaded !");
	});

	// Setup OnCharacterLoaded
	onCharacterLoaded(async (ctx) => {
		mModules.onDataLoad(settings, characterStorage);
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