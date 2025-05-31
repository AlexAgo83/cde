// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// cloudStorage.mjs

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
		return typeof raw === "string" ? JSON.parse(raw) : raw;
	} catch (e) {
		console.warn("[CDE] Invalid monster data in characterStorage");
		return null;
	}
}
export function setCurrentMonsterData(monsterData)  {
	cloudStorage?.setItem(CS_CURRENT_MONSTER_DATA, monsterData);
}
export function removeCurrentMonsterData() {
	cloudStorage?.removeItem(CS_CURRENT_MONSTER_DATA);
}

export function getCurrentSkillData() {
	try {
		const raw = cloudStorage?.getItem(CS_CURRENT_SKILL_DATA);
		return typeof raw === "string" ? JSON.parse(raw) : raw;
	} catch (e) {
		console.warn("[CDE] Invalid skill data in characterStorage");
		return null;
	}
}
export function setCurrentSkillData(skillData)  {
	cloudStorage?.setItem(CS_CURRENT_SKILL_DATA, skillData);
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