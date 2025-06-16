// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// cloudStorage.mjs

const CS_SETTINGS = "cde_settings";
const CS_CURRENT_MONSTER_DATA = "cde_current_monster_data_X1";
const CS_CURRENT_ACTIVITY_DATA = "cde_current_activity_data_X1";
const CS_CURRENT_ETA_POSITION = "cde_current_eta_position";
const CS_CURRENT_ETA_SIZE = "cde_current_eta_size";
const CS_CURRENT_NOTIFICATION = "cde_current_notification";
const AS_PENDING_NOTIFICATION = "cde_pending_notification";

let mods = null;
let cloudStorage = null;
let sharedStorage = null;

/**
 * Initialize the cloud storage module.
 * @param {Object} modules - The modules object containing dependencies.
 * @param {Object} characterStorage - The character storage object for cloud operations.
 */
export function init(modules, characterStorage, accountStorage) {
    mods = modules;
	cloudStorage = characterStorage;
	sharedStorage = accountStorage;
}

// --- MOCK ---
function _game() {
	// @ts-ignore
	return game;
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
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] currentMonsterData changed:"+monsterData);
	}
	cloudStorage?.setItem(CS_CURRENT_MONSTER_DATA, JSON.stringify(monsterData));
}

/**
 * Removes the current monster data from cloud storage.
 */
export function removeCurrentMonsterData() {
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] currentMonsterData removed");
	}
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
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] currentActivityData changed:"+activityData);
	}
	cloudStorage?.setItem(CS_CURRENT_ACTIVITY_DATA, JSON.stringify(activityData));
}

/**
 * Removes the current activity data from cloud storage.
 */
export function removeCurrentActivityData() {
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] currentActivityData removed");
	}
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

/**
 * Stores the current ETA position in cloud storage.
 * @param {string} position - The position to be set (e.g., "left", "center", "right").
 */
export function setCurrentETAPostion(position) {
	cloudStorage?.setItem(CS_CURRENT_ETA_POSITION, position);
}
/**
 * Retrieves the current ETA position from cloud storage.
 * @returns {string|null} The position as a string (e.g., "left", "center", "right"), or null if not found.
 */
export function getCurrentETAPostion() {
	return cloudStorage?.getItem(CS_CURRENT_ETA_POSITION);
}


/**
 * Stores the current ETA size for the given cursor in cloud storage.
 * @param {string} cursor - The cursor to be set (e.g., "left", "center", "right").
 * @param {string} size - The size to be set.
 */
export function setCurrentETASize(cursor, size="large") {
	cloudStorage?.setItem(CS_CURRENT_ETA_SIZE+"-"+cursor, size);
}
/**
 * Retrieves the current ETA size for the specified cursor from cloud storage.
 * @param {string} cursor - The cursor whose ETA size is to be retrieved (e.g., "left", "center", "right").
 * @returns {string|null} The size associated with the given cursor as a string, or null if not found.
 */
export function getCurrentETASize(cursor) {
	return cloudStorage?.getItem(CS_CURRENT_ETA_SIZE+"-"+cursor) ?? "large";
}


/**
 * Stores the given notification data in cloud storage.
 * @param {*} notificationData - The notification data to store.
 */
export function setCurrentNotification(notificationData) {
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] currentNotification changed:" + notificationData);
	}
	cloudStorage?.setItem(CS_CURRENT_NOTIFICATION, notificationData);
}

/**
 * Retrieves the current notification data from cloud storage.
 * @returns {Object|null} The current notification data object, or null if not found or invalid.
 */
export function getCurrentNotification() {
	try {
		const raw = cloudStorage?.getItem(CS_CURRENT_NOTIFICATION);
		return typeof raw === "string" ? JSON.parse(raw) : raw;
	} catch (e) {
		console.warn("[CDE] Invalid notification data in characterStorage");
		return null;
	}
}


/**
 * Retrieves the pending notification data from account storage.
 * @returns {Object|null} The pending notification data object, or null if not found or invalid.
 */
export function getPendingNotification() {
	try {
		const raw = sharedStorage?.getItem(AS_PENDING_NOTIFICATION);
		return typeof raw === "string" ? JSON.parse(raw) : raw;
	} catch (e) {
		console.warn("[CDE] Invalid pending notification data in accountStorage");
		return null;
	}
}

/**
 * Stores the given pending notification data in account storage.
 * @param {*} pendingNotification - The pending notification data to store.
 */
export function setPendingNotification(pendingNotification)  {
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] Pending notification changed:"+pendingNotification);
	}
	sharedStorage?.setItem(AS_PENDING_NOTIFICATION, JSON.stringify(pendingNotification));
}