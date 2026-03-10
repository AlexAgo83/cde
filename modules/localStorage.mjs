// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// localStorage.mjs

const CS_LAST_EXPORT = "cde_last_export";
const CS_LAST_CHANGES = "cde_last_changes";

let deps = null;
let isLoaded = false;

export function createLocalStorageDependencies(moduleManager) {
    return {
        lzString: moduleManager.getLZString(),
        melvorRuntime: moduleManager.getMelvorRuntime(),
        settings: moduleManager.getSettings(),
        browserRuntime: moduleManager.getBrowserRuntime(),
        utils: moduleManager.getUtils()
    };
}

/**
 * Initialize the local storage module.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(moduleManagerOrDependencies) {
    if (typeof moduleManagerOrDependencies?.getLZString === "function") {
        deps = createLocalStorageDependencies(moduleManagerOrDependencies);
    } else {
        deps = moduleManagerOrDependencies;
    }

    isLoaded = !!deps.lzString && typeof deps.lzString.compressToUTF16 === "function";
    if (!isLoaded) {
        console.warn("[CDE] LZString is not loaded or does not have the expected methods.");
    }
}

function _game() { // @ts-ignore
	return deps.melvorRuntime.getGame();
}

function browser() {
    return deps.browserRuntime;
}

/**
 * Checks if LZString compression is available and ready.
 * @returns {boolean} True if LZString is loaded and ready, false otherwise.
 */
export function isLZStringReady() {
	return isLoaded && !!deps.lzString;
}

/**
 * Reads and parses JSON data from localStorage for the given key.
 * If LZString is available, decompresses the data first.
 * @param {string} key - The localStorage key to read from.
 * @returns {*} The parsed JSON object, or null if not found or invalid.
 */
function readFromStorage(key) {
	try {
		const raw = browser().readStorage(key);
		if (!raw) return null;
		
		let json = raw;
		if (isLZStringReady()) {
			const decompressed = deps.lzString.decompressFromUTF16(raw);
			if (decompressed) json = decompressed;
		} else {
            console.log("[CDE] LZString not ready, using raw data from storage.");
        }
		
		json = JSON.parse(json);
		if (deps.settings.isDebug()) {
			console.log("[CDE] Object read:", json);
		}
		return json;
	} catch (err) {
		console.warn("[CDE] Could not parse last export:", err);
		return null;
	}
}
/**
 * Saves JSON data to localStorage for the given key.
 * If LZString is available, compresses the data first.
 * @param {string} key - The localStorage key to write to.
 * @param {*} jsonData - The data to save (will be stringified).
 */
function saveToStorage(key, jsonData) {
	try {
		let raw = JSON.stringify(jsonData);
		if (isLZStringReady()) {
			raw = deps.lzString.compressToUTF16(raw);
		} else {
            console.log("[CDE] LZString not ready, saving raw data to storage.");
        }
		browser().writeStorage(key, raw);
		// if (mods.getSettings().isDebug()) {
		// 	console.log("[CDE] Object saved:", raw);
		// }
	} catch (err) {
		console.warn("[CDE] Failed to save export to storage:", err);
	}
}
/**
 * Returns the localStorage key for the last export for the current character.
 * @returns {string} The export key.
 */
function getStorage_ExportKey() {
	return CS_LAST_EXPORT+"_"+(deps.utils.sanitizeCharacterName(_game().characterName));
}
/**
 * Loads the last export data for the current character from localStorage.
 * @returns {*} The parsed export data, or null if not found.
 */
export function getLastExportFromStorage() {
	return readFromStorage(getStorage_ExportKey());
}
/**
 * Saves export data for the current character to localStorage.
 * @param {*} jsonData - The export data to save.
 */
export function saveExportToStorage(jsonData) {
	saveToStorage(getStorage_ExportKey(), jsonData);
}
/**
 * Removes the last export data for the current character from localStorage.
 */
export function removeExportFromStorage() {
    browser().removeStorage(getStorage_ExportKey());
}
/**
 * Returns the localStorage key for the last changes for the current character.
 * @returns {string} The changes key.
 */
function getStorage_ChangesKey() {
	return CS_LAST_CHANGES+"_"+(deps.utils.sanitizeCharacterName(_game().characterName));
}
/**
 * Loads the last changes data for the current character from localStorage.
 * @returns {Map|*} The changes as a Map if possible, or the raw data.
 */
export function getChangesFromStorage() {
	const raw = readFromStorage(getStorage_ChangesKey());
	return Array.isArray(raw) ? new Map(raw) : raw;
}
/**
 * Saves changes data for the current character to localStorage.
 * @param {*} jsonData - The changes data to save (Map or serializable object).
 */
export function saveChangesToStorage(jsonData) {
	let toStore = jsonData;
	if (toStore instanceof Map) {
		toStore = Array.from(toStore.entries());
	}
	saveToStorage(getStorage_ChangesKey(), toStore);
}
/**
 * Clears all export and changes data for the current character from localStorage.
 */
export function clearStorage() {
	browser().removeStorage(getStorage_ExportKey());
	browser().removeStorage(getStorage_ChangesKey());
	if (deps.settings.isDebug()) {
		console.log("[CDE] localStorage cleared!")
	}
}
