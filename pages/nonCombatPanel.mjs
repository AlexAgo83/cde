// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// nonCombatPanel.mjs

let mods = null;
let parent = null;
let summaryId = null;
let identity = null;
let etaData = null;
let lastCallTime = null;

/**
 * Extracts ETA (Estimated Time of Arrival) data for non-combat activities.
 * @param {boolean} etaExtract - Whether to perform ETA extraction.
 * @param {number} timeBuffer - Optional buffer time in ms for extraction.
 * @returns {{ currentActivity: any }} An object containing the current activity data.
 */
let extractETA = (etaExtract=true, timeBuffer=100) => {return {currentActivity: null}};

/**
 * Initialize the nonCombat panel.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(modules) {
  mods = modules;
}

/* @ts-ignore Handle DEVMODE */
function _game()  {  return game;  }

/**
 * Get the settings reference object.
 * @returns {Object} The settings reference object.
 */
function Stg() {
    if (!mods) {
        console.warn("[CDE] combatPanel: mods not initialized");
        return {};
    }
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
 * Placeholder for load function.
 * @param {*} ctx - Context parameter (currently unused).
 */
export function load(ctx) {
    if (isCfg(Stg().ETA_DISPLAY)) {
        // ...
    }
}

/**
 * Sets the callback function used to collect ETA data for this panel.
 * @param {*} cb 
 */
export function setCollectCb(cb) {
    if (mods.getSettings().isDebug()) {
        console.log("[CDE] Non-Combat panel callback:", cb);
    }
    extractETA = cb;
}

/**
 * Returns the default HTML for an ETA panel.
 * @param {*} summaryIdentifier - The summary element ID to use in the panel.
 * @returns {string} The default panel HTML.
 */
export const container = (parentPanel, summaryIdentifier, identifier) => {
    parent = parentPanel;
    summaryId = summaryIdentifier;
    identity = identifier;
    const etaStr = etaData ? etaData : "n/a";
    return `<div class="cde-${identity}-panel cde-eta-generic"><span id="${summaryIdentifier}">${etaStr}</span></div>`;
}

/**
 * Displays the given value in the panel container.
 * @param {*} value - The HTML content or data to display in the panel.
 */
export function show(value) {
   mods.getUtils().showContainer(parent, identity, value);
}

/**
 * Refreshes the Non-Combat panel by updating the displayed ETA data.
 * @returns {boolean|null} True if the panel was updated, null if skipped due to refresh throttling.
 */
export const onRefresh = () => {
    let updated = false;
    const currTime = new Date();
    if (lastCallTime == null || (lastCallTime.getTime() + 25) < currTime.getTime()) {
        lastCallTime = currTime;
    } else {
        if (mods.getSettings().isDebug()) console.log("[CDE] onRefresh skipped for: " + identity);
        return null;
    }
    
    if (parent && typeof extractETA === "function" && isCfg(Stg().ETA_DISPLAY)) {
        
        const scan = extractETA(true, 100);
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] Process quick scan:", scan);
        }
        
        if (
            scan && typeof scan === "object" && scan !== null &&
            Object.prototype.hasOwnProperty.call(scan, "currentActivity")
        ) {
            /** @type {{ currentActivity: any }} */
            const scanWithActivity = scan;
            const activities = scanWithActivity.currentActivity;

            /* ETA - Non-Combat */
            const result = [];

            _game().skills?.registeredObjects.forEach((skill) => {
                /* Focus on Activities (only): Non-Combat */
                if (!skill.isCombat && Object.prototype.hasOwnProperty.call(activities, skill.localID)) {
                    const activity = activities[skill.localID];
                    if (Object.prototype.hasOwnProperty.call(activity, "skills")) {
                        // Parse Skills
                        const skills = activity.skills;
                        _game().skills?.registeredObjects.forEach((activeSkill) => {
                            if (Object.prototype.hasOwnProperty.call(skills, activeSkill.localID)) {
                                const currentSkill = skills[activeSkill.localID];
                                const diffTimeStr = currentSkill.diffTimeStr;
                                const time = currentSkill.timeToNextLevelStr;
                                result.push(
                                    `<div class="cde-generic-panel">
                                        <span class="skill-label">Time to Next Level (${activeSkill.localID}):</span>
                                        <span class="skill-value vph">${time ?? "N/A"}</span>
                                    </div>
                                    <div class="cde-generic-panel">
                                        <span class="skill-label">Craft Duration:</span>
                                        <span class="skill-value duration">${diffTimeStr ?? "N/A"}</span>
                                    </div>`
                                );
                                updated = true;
                            }
                        });
                    }
                    if (Object.prototype.hasOwnProperty.call(activity, "recipeQueue")) {
                        // Parse Mastery
                        // const recipeQueue = activity.recipeQueue;
                    }
                }
            });
            etaData = `<div class="cde-generic-list">${result.join("")}</div>`;
        }
        parent.innerHTML = container(parent, summaryId, identity);
    }
    return updated;
}