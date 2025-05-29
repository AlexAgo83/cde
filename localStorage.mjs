// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// localStorage.mjs

let contexte = null;
let LZString = null;
let isLoaded = false;

let onLZStringHandler = () => {
    return true;
}
let onDebugHandler = () => {
    return false;
}

const CS_LAST_EXPORT = "cde_last_export";
const CS_LAST_CHANGES = "cde_last_changes";


export function isLZStringReady() {
	return isLoaded && onLZStringHandler();
}

export function sanitizeCharacterName(name) {
	if (!name) return "unknown";
	return name
	.normalize("NFD")
	.replace(/[\u0300-\u036f]/g, "")
	.replace(/\s+/g, "_")
	.replace(/[^a-zA-Z0-9_\-]/g, "")
	.substring(0, 32);
}

function readFromStorage(key) {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return null;
		
		let json = raw;
		if (isLZStringReady()) {
			const decompressed = LZString.decompressFromUTF16(raw);
			if (decompressed) json = decompressed;
		} else {
            console.log("[CDE] LZString not ready, using raw data from storage.");
        }
		
		json = JSON.parse(json);
		if (onDebugHandler()) {
			console.log("[CDE] Object read:", json);
		}
		return json;
	} catch (err) {
		console.warn("[CDE] Could not parse last export:", err);
		return null;
	}
}
function saveToStorage(key, jsonData) {
	try {
		let raw = JSON.stringify(jsonData);
		if (isLZStringReady()) {
			raw = LZString.compressToUTF16(raw);
		} else {
            console.log("[CDE] LZString not ready, saving raw data to storage.");
        }
		localStorage.setItem(key, raw);
		if (onDebugHandler()) {
			console.log("[CDE] Object saved:", raw);
		}
	} catch (err) {
		console.warn("[CDE] Failed to save export to storage:", err);
	}
}

function getStorage_ExportKey() {
	return CS_LAST_EXPORT+"_"+(sanitizeCharacterName(game.characterName));
}
export function getLastExportFromStorage() {
	return readFromStorage(getStorage_ExportKey());
}
export function saveExportToStorage(jsonData) {
	saveToStorage(getStorage_ExportKey(), jsonData);
}
export function removeExportFromStorage() {
    localStorage.removeItem(getStorage_ExportKey());
}

function getStorage_ChangesKey() {
	return CS_LAST_CHANGES+"_"+(sanitizeCharacterName(game.characterName));
}
export function getChangesFromStorage() {
	const raw = readFromStorage(getStorage_ChangesKey());
	return Array.isArray(raw) ? new Map(raw) : raw;
}
export function saveChangesToStorage(jsonData) {
	let toStore = jsonData;
	if (toStore instanceof Map) {
		toStore = Array.from(toStore.entries());
	}
	saveToStorage(getStorage_ChangesKey(), toStore);
}

export function init(
        ctx,
        LZStringInstance) {
    contexte = ctx;
    LZString = LZStringInstance;
    isLoaded = !!LZString && typeof LZString.compressToUTF16 === 'function';
    if (!isLoaded) {
        console.warn("[CDE] LZString is not loaded or does not have the expected methods.");
    }
}

export function setLZStringHandler(onLZStringCb) {
    onLZStringHandler = onLZStringCb;
}
export function setDebugHandler(onDebugCb) {
    onDebugHandler = onDebugCb;
}