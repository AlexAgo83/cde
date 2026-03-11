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
// Stage 29 - Shared Notification
// Stage 30 - Summoning ETA Improvement
// Stage 31 - Agility ETA Improvement

// === Plan to 2.2.X
// Stage 32 - Cartography ETA Improvement
// Stage 32 - Cartography Paper Please!

// TODO : Collect Summoning XP during Combat, use it as active Skill
// TODO : Improve controls (No delay)

// --- Configuration ---
const MOD_VERSION = "v3.0.15";

function logLifecycle(step, phase, details) {
	if (details === undefined) {
		console.info(`[CDE] setup:${step}:${phase}`);
		return;
	}
	console.info(`[CDE] setup:${step}:${phase}`, details);
}

function logLifecycleError(step, error) {
	console.error(`[CDE] setup:${step}:error`, error);
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
 * @param {Object} context.accountStorage - The account storage object.
 * @param {function(Object): Promise<void>} context.onModsLoaded - Called when all mods are loaded, receives the context.
 * @param {function(Object): Promise<void>} context.onCharacterSelectionLoaded - Called when the character selection is loaded, receives the context.
 * @param {function(Object): Promise<void>} context.onCharacterLoaded - Called when the character is loaded, receives the context.
 * @param {function(Object): Promise<void>} context.onInterfaceReady - Called when the interface is ready, receives the context.
 */
export function setup({settings, api, characterStorage, accountStorage, onModsLoaded, onCharacterSelectionLoaded, onCharacterLoaded, onInterfaceReady}) {
	let composition = null;

	async function getComposition(ctx) {
		if (composition) {
			logLifecycle("getComposition", "reuse");
			return composition;
		}
		logLifecycle("getComposition", "load-root", { modVersion: MOD_VERSION });
		const compositionRoot = await ctx.loadModule("modules/compositionRoot.mjs");
		composition = compositionRoot.createSetupComposition({
			settings,
			characterStorage,
			accountStorage,
			modVersion: MOD_VERSION
		});
		logLifecycle("getComposition", "ready");
		return composition;
	}

	// Setup OnModsLoaded
	onModsLoaded(async (ctx) => {
		logLifecycle("onModsLoaded", "start", { modVersion: MOD_VERSION });
		try {
			const loadedComposition = await getComposition(ctx);
			await loadedComposition.loadModules(ctx);
			console.info("[CDE] Modules loaded !");
			logLifecycle("onModsLoaded", "done");
		} catch (error) {
			logLifecycleError("onModsLoaded", error);
			throw error;
		}
	});

	onCharacterSelectionLoaded(async (ctx) => {
		// ...
	});

	// Setup OnCharacterLoaded
	onCharacterLoaded(async (ctx) => {
		logLifecycle("onCharacterLoaded", "start");
		try {
			await (await getComposition(ctx)).loadCharacterData();
			console.info("[CDE] Data loaded !");
			logLifecycle("onCharacterLoaded", "done");
		} catch (error) {
			logLifecycleError("onCharacterLoaded", error);
			throw error;
		}
	});

	// Setup OnInterfaceReady
	onInterfaceReady(async (ctx) => {
		logLifecycle("onInterfaceReady", "start");
		try {
			await (await getComposition(ctx)).prepareInterface(ctx);
			console.log("[CDE] Interface ready !");
			logLifecycle("onInterfaceReady", "done");
		} catch (error) {
			logLifecycleError("onInterfaceReady", error);
			throw error;
		}
	});
	
	// Setup API
	api({
		generate: () => composition?.createApi().generate(),
		getModules: () => composition?.createApi().getModules(),
		getViews: () => composition?.createApi().getViews(),
		setDebug: (toggle) => composition?.createApi().setDebug(toggle),
		getVersion: () => MOD_VERSION,
		debugNotif_readStorage: () => composition?.createApi().debugNotif_readStorage(),
		debugNotif_readETA: () => composition?.createApi().debugNotif_readETA(),
		debugNotif_injectData: () => composition?.createApi().debugNotif_injectData(),
	});
}
