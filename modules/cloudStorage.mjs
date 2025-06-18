// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// cloudStorage.mjs

const CS_SETTINGS = "cde-settings";

const CS_CURRENT_MONSTER_DATA = "cde_current_monster_data_X1";
const CS_CURRENT_ACTIVITY_DATA = "cde_current_activity_data_X1";

const CS_CURRENT_ETA_POSITION = "cde_current_eta_position";
const CS_CURRENT_ETA_SIZE = "cde_current_eta_size";
const CS_ETA_VISIBILITY = "cde_visibility";

const CS_CURRENT_NOTIFICATION = "cde_current_notif";
const AS_PENDING_NOTIFICATION = "cde_pending_notif";

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

/**
 * Logs a debug message if the 'isDebug' setting is enabled.
 *
 * The message is prefixed with "[CDE/" + label + "] [Step: " + step + "] (" + from + "->" + to + ")".
 * If arguments are provided, ", args:" is appended to the prefix and the arguments are logged
 * after the prefix.
 *
 * @param {string} label - The label for the debug message.
 * @param {string} step - The step for the debug message.
 * @param {string} from - The starting position of the logged block.
 * @param {string} to - The ending position of the logged block.
 * @param {...*} args - The arguments to log.
 */
export function logger(label, step, from, to, ...args) {
	mods.getUtils().logger(label, step, "cloudStorage", from, to, ...args);
}

/**
 * Logs a debug message if the 'isDebug' setting is enabled with a prefix of "[Notif]".
 * The message is prefixed with "[Notif] [Step: " + step + "] (" + from + "->" + to + ")".
 * If arguments are provided, ", args:" is appended to the prefix and the arguments are logged
 * after the prefix.
 * @param {string} step - The step for the debug message.
 * @param {string} from - The starting position of the logged block.
 * @param {string} to - The ending position of the logged block.
 * @param {...*} args - The arguments to log.
 */
export function loggerNotif(step, from, to, ...args) {
	logger("Notif", step, from, to, ...args);
}

// --- MOCK ---
function _game() {
	// @ts-ignore
	return game;
}
/**
 * Retrieves the name of the current character from the game.
 * @returns {string} The character's name.
 */
function getCharName() {
    return mods.getUtils().sanitizeCharacterName(_game().characterName);
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
 * Saves the given ETA visibility setting to cloud storage.
 * @param {boolean} visibility - The boolean value for the ETA visibility setting.
 * @returns {boolean} The updated ETA visibility setting.
 */
export function setEtaVisibility(visibility=true) {
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] eta visibility changed:" + visibility);
	}
	cloudStorage?.setItem(CS_ETA_VISIBILITY, visibility);
	return visibility;
}

/**
 * Retrieves the ETA visibility setting from cloud storage.
 * If the setting is not found, it will be set to true.
 * @returns {boolean} The boolean value for the ETA visibility setting.
 */
export function isEtaVisible() {
	let raw = true;
	try {
		const savedRaw = cloudStorage?.getItem(CS_ETA_VISIBILITY);
		if (typeof savedRaw !== "boolean") {
			raw = true;
			setEtaVisibility(true);
		} else raw = savedRaw;
	} catch (e) {
		console.warn("[CDE] Invalid eta visibility data in characterStorage");
	}
	return raw;
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
	const key = CS_SETTINGS + "-" + reference.key;
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
	const key = CS_SETTINGS + "-" + reference.key;
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
function getPendingNotification() {
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

/**
 * Updates the pending notification data for the current character using the given function.
 * @param {function({}):{}} [updatePendingNotification] - The function to update the pending notification data.
 */
export function updatePendingNotificationForCurrentCharacter(updatePendingNotification = (valueToEdit) => valueToEdit) {
	const charName = getCharName();
	let pendingNotifications = getPendingNotification() ?? {};
	if (!pendingNotifications[charName]) pendingNotifications[charName] = {};
	pendingNotifications[charName] = updatePendingNotification(pendingNotifications[charName]) ?? {};
	setPendingNotification(pendingNotifications);
	loggerNotif("Save new Notif", "updatePendingNotificationForCurrentCharacter", "setPendingNotification", pendingNotifications);
}

/**
 * Retrieves the pending notification data for the current character from account storage.
 * @returns {Object|null} The pending notification data object for the current character, or null if not found or invalid.
 */
export function getPlayerPendingNotification() {
	const charName = getCharName();
	const pendingNotifications = getPendingNotification() ?? {};
	return pendingNotifications[charName] ?? {};
}

/**
 * Removes the pending notification data for the current character from account storage.
 * If the character has no pending notifications, no action is taken.
 */
export function removePlayerPendingNotification() {
	const charName = getCharName();
	let pendingNotifications = getPendingNotification() ?? {};
	if (pendingNotifications?.hasOwnProperty(charName)) {
		delete pendingNotifications[charName];
		setPendingNotification(pendingNotifications);
	}
}

/**
 * Retrieves all pending notifications for characters other than the current one.
 * It removes the current character's notifications from the list before returning.
 * @returns {Object} An object containing pending notifications for other characters.
 */
export function getOtherPlayerPendingNotifications() {
	const charName = getCharName();
	let pendingNotifications = getPendingNotification() ?? {};
	if (pendingNotifications?.hasOwnProperty(charName)) delete pendingNotifications[charName];
	return pendingNotifications;
}

/**
 * Removes the pending notification data for a specified character from account storage.
 * If the specified character has no pending notifications, no action is taken.
 * @param {string} playerName - The name of the character for which to remove notifications.
 */
export function removeOtherPlayerPendingNotification(playerName) {
	if (playerName === null || playerName === getCharName()) return;
	let pendingNotifications = getPendingNotification() ?? {};
	if (pendingNotifications?.hasOwnProperty(playerName)) {
		delete pendingNotifications[playerName];
		setPendingNotification(pendingNotifications);
	}
}


/**
 * Returns the cloudStorage object.
 * @returns {Object} The cloudStorage object.
 */
export function debugCloudStorage() {
	return cloudStorage;
}

/**
 * Returns the sharedStorage object.
 * @returns {Object} The sharedStorage object.
 */
export function debugSharedStorage() {
	return sharedStorage;
}