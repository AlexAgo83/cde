// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// cloudStorage.mjs

const CS_SETTINGS = "cs_settings_";
const CS_CURRENT_MONSTER_DATA = "cs_current_monster_data";
const CS_CURRENT_SKILL_DATA = "cs_current_skill_data";

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

export function getCurrentMonsterData() {
	try {
		const raw = cloudStorage?.getItem(CS_CURRENT_MONSTER_DATA);
		// return typeof raw === "string" ? JSON.parse(raw) : raw;
	} catch (e) {
		console.warn("[CDE] Invalid monster data in characterStorage");
		return null;
	}
}
export function setCurrentMonsterData(monsterData)  {
	cloudStorage?.setItem(CS_CURRENT_MONSTER_DATA, JSON.stringify(monsterData));
}
export function removeCurrentMonsterData() {
	cloudStorage?.removeItem(CS_CURRENT_MONSTER_DATA);
}

export function getCurrentSkillData() {
	try {
		const raw = cloudStorage?.getItem(CS_CURRENT_SKILL_DATA);
		// return typeof raw === "string" ? JSON.parse(raw) : raw;
	} catch (e) {
		console.warn("[CDE] Invalid skill data in characterStorage");
		return null;
	}
}
export function setCurrentSkillData(skillData)  {
	cloudStorage?.setItem(CS_CURRENT_SKILL_DATA, JSON.stringify(skillData));
}
export function removeCurrentSkillData() {
	cloudStorage?.removeItem(CS_CURRENT_SKILL_DATA);
}

export function clearStorage() {
	cloudStorage.clear()
	if (mods.getSettings().isDebug()) {
		console.log("[CDE] cloudStorage cleared!")
	}
}


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