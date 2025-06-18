// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// utils.mjs

export const NameSpaces = ["melvorD", "melvorF", "melvorTotH", "melvorAoD", "melvorItA"];
export const HASTE_ENDPOINT = "https://haste.zneix.eu";

let mods = null;
let _mappedSkills = null;

/* @ts-ignore Handle DEVMODE */
function _exp()  {  return exp;  }

/**
 * Initialize utils module.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(modules) {
  mods = modules;
}

/* MOCK */
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
 * Formats a duration in milliseconds into a human-readable string (e.g., "1h 2min 3s").
 * @param {number} ms - The duration in milliseconds.
 * @returns {string} The formatted duration string.
 */
export function formatDuration(ms, pattern=null) {
	const msRender = ms/1000;
	const totalSeconds = Math.floor(msRender);
	const days = Math.floor(totalSeconds / 86400);
	const hours = Math.floor((totalSeconds % 86400) / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	const bOn = pattern ? `<span class="skill-value ${pattern} nomargin">` : "";
	const bOff = pattern ? `</span>` : "";

	const parts = [];
	if (days > 0) parts.push(`${days}${bOn}day${days > 1 ? 's' : ''}${bOff}`);
	if (days < 10 && hours > 0) parts.push(`${hours}${bOn}h${bOff}`);
	if (days < 10 && minutes > 0) parts.push(`${minutes}${bOn}m${bOff}`);

	// If less thant a day
	if (hours === 0 && days === 0 && (seconds > 0 || parts.length === 0)) {
		// if (seconds < 10) {
		// 	parts.push(`${msRender}${bOn}s${bOff}`);
		// } else {
			parts.push(`${seconds}${bOn}s${bOff}`);
		// }
	}
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
 * Sanitizes a localID for use as a storage key or identifier.
 * Removes diacritics, replaces spaces with underscores, removes non-alphanumeric characters,
 * and limits the result to 32 characters.
 * @param {string} localID - The localID to sanitize.
 * @returns {string} The sanitized localID.
 */
export function sanitizeLocalID(localID) {
	if (!localID) return "unknown";
	return localID
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
		// if (mods.getSettings().isDebug()) console.log("[CDE] Refresh UI updated:"+value);
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
export function parseNextLevels(currLevel, levelCap = 120) {
	const levels = [];
	const nextLevel = currLevel + 1;
	const standardProgression = nextLevel < 99;
	const dlcProgression = nextLevel < 120 && !standardProgression;

	if (dlcProgression) {
		if (nextLevel < 120 && 120 <= levelCap) levels.push(120);
		if (nextLevel < 110 && 110 <= levelCap) levels.push(110);
	} else if (standardProgression) {
		if (nextLevel < 99 && 99 <= levelCap) levels.push(99);

		if (nextLevel < 90 && nextLevel >= 80 && 90 <= levelCap) levels.push(90);
		if (nextLevel < 80 && nextLevel >= 70 && 80 <= levelCap) levels.push(80);
		if (nextLevel < 70 && nextLevel >= 60 && 70 <= levelCap) levels.push(70);
		if (nextLevel < 60 && nextLevel >= 50 && 60 <= levelCap) levels.push(60);
		if (nextLevel < 50 && nextLevel >= 40 && 50 <= levelCap) levels.push(50);
		if (nextLevel < 40 && nextLevel >= 30 && 40 <= levelCap) levels.push(40);
		if (nextLevel < 30 && nextLevel >= 20 && 30 <= levelCap) levels.push(30);
		if (nextLevel < 20 && nextLevel >= 10 && 20 <= levelCap) levels.push(20);
		if (nextLevel < 10 && nextLevel >= 1 && 10 <= levelCap) levels.push(10);
	}

	return levels;
}

/**
 * Returns an array of upcoming mastery milestones based on the current mastery level,
 * up to the provided mastery cap.
 *
 * This function identifies standard mastery thresholds (e.g., 10, 20, 30, ..., 99)
 * that are relevant to the current progression. It only includes milestones that are:
 * - strictly above the current mastery level
 * - less than or equal to the masteryCap
 *
 * @param {number} currMasteryLvl - The current mastery level (0 to 99).
 * @param {number} [masteryLvlCap=99] - The maximum level to consider for milestones.
 * @returns {number[]} An array of mastery level milestones to target next.
 *
 * @example
 * parseNextMasteries(57) // returns [60, 99]
 * parseNextMasteries(85, 90) // returns [90]
 * parseNextMasteries(95, 95) // returns []
 */
export function parseNextMasteries(currMasteryLvl, masteryLvlCap = 99) {
	const masteries = [];
	const nextLevel = currMasteryLvl + 1;

	if (nextLevel < 99 && 99 <= masteryLvlCap) masteries.push(99);
	if (nextLevel < 90 && nextLevel >= 80 && 90 <= masteryLvlCap) masteries.push(90);
	if (nextLevel < 80 && nextLevel >= 70 && 80 <= masteryLvlCap) masteries.push(80);
	if (nextLevel < 70 && nextLevel >= 60 && 70 <= masteryLvlCap) masteries.push(70);
	if (nextLevel < 60 && nextLevel >= 50 && 60 <= masteryLvlCap) masteries.push(60);
	if (nextLevel < 50 && nextLevel >= 40 && 50 <= masteryLvlCap) masteries.push(50);
	if (nextLevel < 40 && nextLevel >= 30 && 40 <= masteryLvlCap) masteries.push(40);
	if (nextLevel < 30 && nextLevel >= 20 && 30 <= masteryLvlCap) masteries.push(30);
	if (nextLevel < 20 && nextLevel >= 10 && 20 <= masteryLvlCap) masteries.push(20);
	if (nextLevel < 10 && nextLevel >= 1 && 10 <= masteryLvlCap) masteries.push(10);

	return masteries;
}

/**
 * Get the original map of skills
 * @returns {Object} The original map of skills
 */
export function getSkills() {
	return _game().skills;
}

/**
 * Get the remapped map of skills
 * @returns {Map} The remapped map of skills
 */
export function getSkillsRemapped() {
	if (_mappedSkills === null) {
		_mappedSkills = new Map();
		getSkills().forEach((value) => {
			_mappedSkills.set(value.localID, value);
		});
	}
	return _mappedSkills;
}

/**
 * Get a skill by its localID
 * @param {*} localID 
 * @returns {Object} The skill
 */
export function getSkillByLocalID(localID) {
	return getSkillsRemapped().get(localID);
}
export function getMasteryByLocalID(skillID, masteryID) {
	return getSkillByLocalID(skillID)?.actionMastery?.get(masteryID);
}

/**
 * Get the active action
 * @returns	{Object} The active action
 */
export function getActiveAction() {
	return _game().activeAction;
}
/**
 * Get the active actions
 * @returns {Object} The active actions
 */
export function getActiveActions() {
	return _game().activeActions;
}
/**
 * Get the active skills
 * @returns {Object} The active skills
 */
export function getActiveSkills() {
	return getActiveAction()?.activeSkills;
}

/**
 * Get the selected recipe for an action
 * @param {*} action 
 * @returns {Object} The selected recipe
 */
export function getRecipeForAction(action) {
	if (!action) return null;

	let currAction = action;
	if (currAction.skillID) {
		currAction = getSkillByLocalID(currAction.skillID);
		if (mods.getSettings().isDebug()) {
			console.log("[ETA] getRecipeForAction:currAction: inner mastery detected.", currAction);
		}
	}

	/* Select active action skill as recipe */
	let selectedRecipe = currAction.selectedRecipe;

	/* Thieving */
	if (!selectedRecipe && currAction.currentNPC) {
		selectedRecipe = currAction.currentNPC;
	}

	/* Mining */
	if (!selectedRecipe && currAction.selectedRock) {
		selectedRecipe = currAction.selectedRock;
	}

	/* Fishing */
	if (!selectedRecipe && currAction.activeFish) {
		selectedRecipe = currAction.activeFish;
	}

	/* Alt. Magic */
	if (!selectedRecipe && currAction.selectedSpell) {
		selectedRecipe = currAction.selectedSpell;
	}

	/* Archaeology */
	if (!selectedRecipe && currAction.currentDigSite) {
		selectedRecipe = currAction.currentDigSite;
	}

	/* Cartography */
	if (!selectedRecipe && currAction.currentlySurveyedHex?.pointOfInterest) {
		selectedRecipe = currAction.currentlySurveyedHex.pointOfInterest;
	}

	/* Fallback: Active Recipe */
	if (!selectedRecipe && currAction.activeRecipe) {
		selectedRecipe = currAction.activeRecipe;
	} 

	/* Fallback: Mastery Action */
	if (!selectedRecipe && currAction.masteryAction) {
		selectedRecipe = currAction.masteryAction;
	}

	return selectedRecipe;
}

/**
 * Get the selected recipe cursor for an action
 * @param {*} action 
 * @returns {Object} The selected recipe cursor
 */
export function getRecipeCursorForAction(action) {
	return action?.selectedAltRecipe;
}

/**
 * Get the produces for a recipe
 * @param {*} recipe 
 * @returns {Object} The produces
 */
export function getProducesForRecipe(recipe) {
	if (recipe?.product) return recipe.product;
	if (recipe?.produces) return recipe.produces;
	if (recipe?.potions) return recipe.potions;
	if (recipe?.primaryProducts) return recipe.primaryProducts;
	//if ()
	return null;
}

/**
 * Get the number of times a dungeon has been completed
 * @param {*} dungeon 
 * @returns {number} The number of times the dungeon has been completed
 */
export function getDungeonCount(dungeon) {
	return _game().combat?.getDungeonCompleteCount(dungeon);
}

/**
 * Get the quantity of an item in the bank
 * @param {*} item 
 * @returns {number} The quantity of the item
 */
export function getQteInBank(item) {
	return _game().bank.getQty(item);
}

/**
 * Get the preservation chance for a recipe
 * @param {*} skillObject 
 * @param {*} recipeObject 
 * @returns {number} The preservation chance
 */
export function getPreservationChance(skillObject, recipeObject) {
	return skillObject.getPreservationChance(recipeObject)
}

/**
 * Check if an object has a property
 * @param {Object} objectToTest - The object to test
 * @param {string} keyInStr - The key to test
 * @returns {boolean} true if the object has the property, false otherwise
 */
export function existIn(objectToTest, keyInStr) {
	return objectToTest && keyInStr ? Object.prototype.hasOwnProperty.call(objectToTest, keyInStr) : false;
}

/**
 * Get the value of a property in an object if it exists, otherwise return null
 * @param {Object} objectToTest - The object to test
 * @param {string} keyInStr - The key to test
 * @returns {*} The value of the property if it exists, null otherwise
 */
export function getIfExist(objectToTest, keyInStr) {
	return existIn(objectToTest, keyInStr) ? objectToTest[keyInStr] : null;
}


/**
 * Check if a skill has multiple recipes
 * @param {string} skillId - The skill ID
 * @returns {boolean} true if the skill has multiple recipes, false otherwise
 */
export function isMultiRecipe(skillId) {
	return skillId === "Agility" || isParallelRecipe(skillId);
}

/**
 * Check if a skill is a parallel recipe skill
 * @param {string} skillId - The skill ID
 * @returns {boolean} true if the skill is a parallel recipe skill, false otherwise
 */
export function isParallelRecipe(skillId) {
	return skillId === "Woodcutting";
}

/**
 * Determines if the current device is running iOS.
 *
 * This function checks the platform and user agent to identify whether the
 * device is an iOS device, including iPads, iPhones, and iPods. It also
 * accounts for iPads running iOS 13 and later, which can report a platform
 * of "Mac" with touch capabilities.
 *
 * @returns {boolean} True if the device is an iOS device, false otherwise.
 */
export function iOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

/**
 * Logs a debug message if the 'isDebug' setting is enabled.
 *
 * The message is prefixed with "[CDE/" + label + "] [Step: " + step + "] (" + func + ")".
 * If arguments are provided, ", args:" is appended to the prefix and the arguments are logged
 * after the prefix.
 *
 * @param {string} label - The label for the debug message.
 * @param {string} step - The step for the debug message.
 * @param {string} className - The class name for the debug message.
 * @param {string} action - The action to describe for the debug message.
 * @param {string} func - The function name for the debug message.
 * @param {...*} args - The arguments to log.
 */
export function logger(label, step, className, func, action, ...args) {
    if (mods.getSettings().isDebug()) {
		const raw = `[CDE/${label}] [Step: ${step}] (${className}:${func}):${action}}`;
        console.log(raw, ...args);
    }
}

/**
 * Converts a Date object to a localized string, using the user's locale.
 * Falls back to the browser's default locale if unable to determine the user's locale.
 * @param {Date} date - The date to convert.
 * @returns {string|null} The localized string representation of the date.
 */
export function dateToLocalString(date) {
	if (!date) return null;
	try {
		const options = {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit"
		};
		let userLocale = navigator.language 
			// @ts-ignore
			|| navigator.userLanguage;
		if (!userLocale) {
			const locales = navigator.languages;
			if (locales && locales.length > 0) {
				userLocale = locales[0];
			}
		}
		if (userLocale) 
			// @ts-ignore
			return date.toLocaleString(userLocale, options);
	} catch (error) {
		if (mods.getSettings().isDebug()) console.warn("Can't parse date", error);
	}
	return date.toLocaleString();
}