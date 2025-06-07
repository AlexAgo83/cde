// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// utils.mjs

export const NameSpaces = ["melvorD", "melvorF", "melvorTotH", "melvorAoD", "melvorItA"];
export const HASTE_ENDPOINT = "https://haste.zneix.eu";

let mods = null;

/* @ts-ignore Handle DEVMODE */
function _exp()  {  return exp;  }

/**
 * Initialize utils module.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(modules) {
  mods = modules;
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
 * Formats a duration in milliseconds into a human-readable string (e.g., "1h 2min 3s").
 * @param {number} ms - The duration in milliseconds.
 * @returns {string} The formatted duration string.
 */
export function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}min`);

  // If less thant a day
  if (hours === 0 && days === 0 && (seconds > 0 || parts.length === 0)) parts.push(`${seconds}s`);

  return parts.join(' ');
}

/**
 * Returns the percentage difference between two numeric values, formatted as a string.
 * @param {number} oldVal - The original value.
 * @param {number} newVal - The new value.
 * @returns {string} The formatted percent difference (e.g., " (+12.34%)"), or an empty string if not applicable.
 */
export function getPercentDiff(oldVal, newVal) {
	if (typeof oldVal === "number" && typeof newVal === "number" && oldVal !== 0) {
		const pct = ((newVal - oldVal) / Math.abs(oldVal)) * 100;
		if (Math.abs(pct) <= 1000) {
			const sign = pct > 0 ? "+" : "";
			return ` (${sign}${pct.toFixed(2)}%)`;
		}
	}
	return "";
}

/**
 * Escapes HTML special characters in a string to prevent XSS or HTML injection.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
export function escapeHtml(str) {
	return str.replace(/[&<>"']/g, m => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	}[m]));
}

/**
 * Checks if a value is a plain object (not an array and not null).
 * @param {*} value - The value to check.
 * @returns {boolean} True if the value is a plain object, false otherwise.
 */
export function isObject(value) {
	return value && typeof value === "object" && !Array.isArray(value);
}

/**
 * Injects the CDE icon CSS into the document head for light and dark mode.
 * @param {*} ctx - The context object providing getResourceUrl.
 */
export function createIconCSS(ctx) {
	document.head.insertAdjacentHTML("beforeend", `<style>:root {--icon-light: url("${ctx.getResourceUrl("assets/cde-icon-light.png")}");}.darkMode {--icon-dark: url("${ctx.getResourceUrl("assets/cde-icon-dark.png")}");}</style>`);
}

/**
 * Recursively computes the differences between two objects or arrays, returning a list of change descriptions.
 * @param {*} prev - The previous object or array.
 * @param {*} curr - The current object or array.
 * @param {string} [path=""] - The property path (used internally for recursion).
 * @returns {string[]} An array of human-readable change descriptions.
 */
export function deepDiff(prev, curr, path = "") {
	const changes = [];
	
	// Arrays: diff
	if (Array.isArray(prev) && Array.isArray(curr)) {
		changes.push(...diffArraysSmart(prev, curr, path));
		return changes;
	}
	
	// Objects
	if (isObject(prev) && isObject(curr)) {
		for (const key in prev) {
			if (!(key in curr)) {
				changes.push(`❌ RMV ${path + key}`);
			}
		}
		for (const key in curr) {
			const fullPath = path + key;
			if (!(key in prev)) {
				changes.push(`➕ ADD ${fullPath} = ${JSON.stringify(curr[key])}`);
			} else {
				const val1 = prev[key];
				const val2 = curr[key];
				if (isObject(val1) && isObject(val2) || Array.isArray(val1) && Array.isArray(val2)) {
					changes.push(...deepDiff(val1, val2, fullPath + "."));
				} 
				else if (val1 !== val2) {
					changes.push(`🔁 UPD ${fullPath} = ${JSON.stringify(val1)} → ${JSON.stringify(val2)}${getPercentDiff(val1, val2)}`);
				}
				
			}
		}
		return changes;
	}
	else if (prev !== curr) {
		changes.push(`🔁 UPD ${path} = ${JSON.stringify(prev)} → ${JSON.stringify(curr)}${getPercentDiff(prev, curr)}`);
	}

	return changes;
}

/**
 * Compares two arrays and returns a list of human-readable descriptions of additions, removals, and updates.
 * Uses 'id', 'localID', or 'name' as a key if available, otherwise uses the index.
 * @param {Array} prevArr - The previous array.
 * @param {Array} currArr - The current array.
 * @param {string} [path=""] - The property path (used internally for recursion).
 * @returns {string[]} An array of change descriptions.
 */
export function diffArraysSmart(prevArr, currArr, path = "") {
	const changes = [];
	if (!Array.isArray(prevArr) || !Array.isArray(currArr)) {
		changes.push(`❓ Not arrays at ${path}`);
		return changes;
	}
	
	// Try 'id' OR 'localID' OR 'name' as Key, else index
	function getKey(obj) {
		return obj?.id ?? obj?.localID ?? obj?.name ?? null;
	}
	
	// Smart Diff
	const prevMap = Object.create(null);
	prevArr.forEach((obj, i) => {
		const key = getKey(obj) ?? `idx_${i}`;
		prevMap[key] = obj;
	});
	const currMap = Object.create(null);
	currArr.forEach((obj, i) => {
		const key = getKey(obj) ?? `idx_${i}`;
		currMap[key] = obj;
	});
	
	// Record add & update
	for (const key in currMap) {
		if (!(key in prevMap)) {
			changes.push(`➕ ADD [${path}${key}]: ${JSON.stringify(currMap[key])}`);
		} else {
			
			const subChanges = deepDiff(prevMap[key], currMap[key], path + key + ".");
			if (subChanges.length > 0) {
				changes.push(...subChanges);
			}
		}
	}
	
	// Record Sup
	for (const key in prevMap) {
		if (!(key in currMap)) {
			changes.push(`❌ RMV [${path}${key}]: ${JSON.stringify(prevMap[key])}`);
		}
	}
	return changes;
}

/**
 * Sanitizes a character name for use as a storage key or identifier.
 * Removes diacritics, replaces spaces with underscores, removes non-alphanumeric characters,
 * and limits the result to 32 characters.
 * @param {string} name - The character name to sanitize.
 * @returns {string} The sanitized character name.
 */
export function sanitizeCharacterName(name) {
	if (!name) return "unknown";
	return name
	.normalize("NFD")
	.replace(/[\u0300-\u036f]/g, "")
	.replace(/\s+/g, "_")
	.replace(/[^a-zA-Z0-9_\-]/g, "")
	.substring(0, 32);
}

/**
 * Uploads text to Hastebin and returns the link.
 * @param {string} text - The text to upload.
 * @returns {Promise<string>} - The Hastebin link.
 */
export async function uploadToHastebin(text) {
	const res = await fetch(`${HASTE_ENDPOINT}/documents`, {
		method: "POST",
		body: text,
		headers: { "Content-Type": "text/plain" }
	});
	if (!res.ok) throw new Error("Upload failed with status " + res.status);
	const data = await res.json();
	return `${HASTE_ENDPOINT}/${data.key}`;
}

/**
 * Calculates the mastery progress percentage towards the next level.
 * @param {number} currentLevel - The current mastery level.
 * @param {number} currentXp - The current mastery XP.
 * @returns {{ nextLevel?: number, level?: number, percent: number }} An object with the next level and percent progress, or level 99 if maxed.
 */
export function getMasteryProgressPercent(currentLevel, currentXp) {
	if (currentXp >= 200000) return { level: 99, percent: 100 };

	const nextLevel = currentLevel + 1;
	const currentLevelXp = getXpForLevel(currentLevel);
	const nextLevelXp = getXpForLevel(nextLevel);

	if (currentXp < nextLevelXp) {
		const percent = ((currentLevelXp - currentXp) / (nextLevelXp - currentLevelXp)) * 100;
		return { nextLevel, percent: +percent.toFixed(2) };
	}

	return { level: 99, percent: 100 };
}

/**
 * Formats a Date object as a compact timestamp string (YYYYMMDDHHmmss).
 * @param {Date} date - The date to format.
 * @returns {string} The formatted timestamp.
 */
export function parseTimestamp(date) {
	const localStamp = 
		date.getFullYear().toString() +
		String(date.getMonth() + 1).padStart(2, "0") +
		String(date.getDate()).padStart(2, "0") +
		String(date.getHours()).padStart(2, "0") +
		String(date.getMinutes()).padStart(2, "0") +
		String(date.getSeconds()).padStart(2, "0");
	return localStamp;
}

/**
 * Returns the XP required to reach a given level.
 * @param {number} level - The level to get XP for.
 * @returns {number} The XP required for the level.
 */
export function getXpForLevel(level) {
	return _exp().levelToXP(level);
}

/**
 * Shows or hides a container element based on the value, and updates its display.
 * @param {HTMLElement} container - The container element to show or hide.
 * @param {string} identity - An identifier for debug logging.
 * @param {*} value - The value to display; if falsy, the container is hidden.
 */
export function showContainer(container, identity, value) {
	if (value == null) {
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] Refresh UI Skipped:"+identity);
		}
		return;
	}
	if (container && container.style) {
		if (value) container.style.display = "";
		else container.style.display = "none";
		if (mods.getSettings().isDebug()) {
			console.log("[CDE] Refresh UI updated:"+value);
		}
	} else if (mods.getSettings().isDebug()) {
		console.log("[CDE] Refresh UI aborted:", container);
	}
}

/**
 * Returns a list of upcoming milestone levels based on the current level.
 *
 * This function helps determine which significant level breakpoints
 * (like 10, 20, 30...99, 110, 120) are still ahead of the current level.
 * It distinguishes between standard progression (max level 99) and DLC progression (max level 120).
 *
 * @param {number} currLevel - The current level of the skill or character.
 * @param {number} [levelCap=120] - The maximum level achievable (default is 120).
 * @returns {number[]} An array of milestone levels greater than the current level,
 *                     ordered from highest to lowest priority.
 *
 * @example
 * parseNextLevels(85); // Returns [99, 90]
 *
 * @example
 * parseNextLevels(105); // Returns [120, 110]
 *
 * @example
 * parseNextLevels(9); // Returns [99, 10]
 */
export function parseNextLevels(currLevel, levelCap=120) {
	const levels = [];
	const nextLevel = currLevel + 1;
	const standardProgression = nextLevel < 99;
	const dlcProgression = nextLevel < 120 && !standardProgression;

	if (dlcProgression) {
		if (nextLevel < 120) levels.push(120);
		if (nextLevel < 110) levels.push(110);
	} else if (standardProgression) {
		if (nextLevel < 99) levels.push(99);

		if (nextLevel < 90 && nextLevel >= 80) levels.push(90);
		if (nextLevel < 80 && nextLevel >= 70) levels.push(80);
		if (nextLevel < 70 && nextLevel >= 60) levels.push(70);
		if (nextLevel < 60 && nextLevel >= 50) levels.push(60);
		if (nextLevel < 50 && nextLevel >= 40) levels.push(50);
		if (nextLevel < 40 && nextLevel >= 30) levels.push(40);
		if (nextLevel < 30 && nextLevel >= 20) levels.push(30);
		if (nextLevel < 20 && nextLevel >= 10) levels.push(20);
		if (nextLevel < 10 && nextLevel >= 1) levels.push(10);
	}
	
	return levels;
}