// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// cloudStorage.mjs

const CS_CURRENT_MONSTER_DATA = "cs_current_monster_data";

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
	return cloudStorage?.getItem(CS_CURRENT_MONSTER_DATA);
}
export function setCurrentMonsterData(monsterData)  {
	cloudStorage?.setItem(CS_CURRENT_MONSTER_DATA, monsterData);
}
export function removeCurrentMonsterData() {
	cloudStorage?.removeItem(CS_CURRENT_MONSTER_DATA);
}