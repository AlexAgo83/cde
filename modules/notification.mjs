// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// notification.mjs

let mods = null;
// const URL_ARCHAEOLOGY_MAP = "https://cdn2-main.melvor.net/assets/media/skills/archaeology/map_colour.png";

/**
 * Initialize notification module.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(modules) {
  mods = modules;
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

// Demander la permission d'afficher une notification
// Notification.requestPermission().then(permission => {
//   if (permission === "granted") {
//       console.log("[CDE] permission granted");
//     setTimeout(() => {
//         console.log("[CDE] test notif");
//       new Notification("Hey ! Il est temps de faire quelque chose !");
//     }, 10000); // 10 secondes
//   } else {
//       console.log("[CDE] permission not granted");
//   }
// });