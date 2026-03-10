// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// setup.mjs

import { createSetupComposition } from "./modules/compositionRoot.mjs";

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
const MOD_VERSION = "v3.0.2";

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
	const composition = createSetupComposition({
		settings,
		characterStorage,
		accountStorage,
		modVersion: MOD_VERSION
	});

	// Setup OnModsLoaded
	onModsLoaded(async (ctx) => {
		await composition.loadModules(ctx);
		console.info("[CDE] Modules loaded !");
	});

	onCharacterSelectionLoaded(async (ctx) => {
		// ...
	});

	// Setup OnCharacterLoaded
	onCharacterLoaded(async (ctx) => {
		await composition.loadCharacterData();
		console.info("[CDE] Data loaded !");
	});

	// Setup OnInterfaceReady
	onInterfaceReady(async (ctx) => {
		await composition.prepareInterface(ctx);
		console.log("[CDE] Interface ready !");
	});
	
	// Setup API
	api(composition.createApi());
}
