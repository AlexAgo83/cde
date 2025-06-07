// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// cloudStorage.mjs

const CS_SETTINGS = "cs_settings_";
const CS_CURRENT_MONSTER_DATA = "cs_current_monster_data";
const CS_CURRENT_ACTIVITY_DATA = "cs_current_activity_data";

let mods = null;
let cloudStorage = null;

/**
 * Initialize the cloud storage module.
 * @param {Object} modules - The modules object containing dependencies.
 * @param {Object} characterStorage - The character storage object for cloud operations.
 */
export function init(modules, characterStorage) {
    mods = modules;
	cloudStorage = characterStorage;
}

/**
 * Get the settings reference object.
 * @returns {Object} The settings reference object.
 */
function Stg() {
	return mods.getSettings()?.SettingsReference;
}

/**
 * Get the boolean value for a settings reference.
 * @returns {boolean} True if the reference is allowed, false otherwise.
 */
function isCfg(reference) {
	return mods.getSettings()?.isCfg(reference);
}

/**
 * Retrieves the current monster data from cloud storage.
 * @returns {Object|null} The current monster data object, or null if not found or invalid.
 */
export function getCurrentMonsterData() {
	try {
		const raw = cloudStorage?.getItem(CS_CURRENT_MONSTER_DATA);
		return typeof raw === "string" ? JSON.parse(raw) : raw;
	} catch (e) {
		console.warn("[CDE] Invalid monster data in characterStorage");
		return null;
	}
}

/**
 * Saves the given monster data to cloud storage.
 * @param {*} monsterData - The monster data object to store.
 */
export function setCurrentMonsterData(monsterData)  {
	cloudStorage?.setItem(CS_CURRENT_MONSTER_DATA, JSON.stringify(monsterData));
}

/**
 * Removes the current monster data from cloud storage.
 */
export function removeCurrentMonsterData() {
	cloudStorage?.removeItem(CS_CURRENT_MONSTER_DATA);
}

/**
 * Retrieves the current activity data from cloud storage.
 * @returns {Object|null} The current activity data object, or null if not found or invalid.
 */
export function getCurrentActivityData() {
	try {
		const raw = cloudStorage?.getItem(CS_CURRENT_ACTIVITY_DATA);
		return typeof raw === "string" ? JSON.parse(raw) : raw;
	} catch (e) {
		console.warn("[CDE] Invalid activity data in characterStorage");
		return null;
	}
}

/**
 * Saves the given activity data to cloud storage.
 * @param {*} activityData - The activity data object to store.
 */
export function setCurrentActivityData(activityData)  {
	cloudStorage?.setItem(CS_CURRENT_ACTIVITY_DATA, JSON.stringify(activityData));
}

/**
 * Removes the current activity data from cloud storage.
 */
export function removeCurrentActivityData() {
	cloudStorage?.removeItem(CS_CURRENT_ACTIVITY_DATA);
}

/**
 * Clears all data from cloud storage.
 */
export function clearStorage() {
	cloudStorage.clear()
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] cloudStorage cleared!")
	}
}

/**
 * Saves a setting value to cloud storage.
 * @param {*} reference - The settings reference object (must have section and key).
 * @param {*} value - The value to store.
 * @returns {string|null} The stored value as a string, or null if invalid reference.
 */
export function saveSetting(reference, value) {
	if (!reference || !reference.section || !reference.key) {
		console.error("[CDE] Invalid settings reference:", reference);
		return null;
	}
	const key = CS_SETTINGS + reference.key;
    const toStore = typeof value === "string" ? value : JSON.stringify(value);
    cloudStorage?.setItem(key, toStore);
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] saveSetting:"+key, toStore);
	}
	return toStore;
}

/**
 * Loads a setting value from cloud storage.
 * @param {*} reference - The settings reference object (must have section and key).
 * @returns {*} The loaded value, parsed as JSON/boolean/number if possible, or as a string.
 */
export function loadSetting(reference) {
	if (!reference || !reference.section || !reference.key) {
		console.error("[CDE] Invalid settings reference:", reference);
		return null;
	}
	const key = CS_SETTINGS + reference.key;
    const raw = cloudStorage?.getItem(key);
    try {
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] loadSetting:"+key, raw);
		}
        if (typeof raw !== "string") return raw;
        if (raw === "true") return true;
        if (raw === "false") return false;
		if (!isNaN(Number(raw)) && raw.trim() !== "") return Number(raw);
        if (raw.startsWith("{") || raw.startsWith("[")) return JSON.parse(raw);
        return raw;
    } catch {
		console.error("[CDE] Can't parse settings", key, raw);
        return raw;
    }
}