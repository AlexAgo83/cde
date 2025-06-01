// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// nonCombatPanel.mjs

let mods = null;
let parent = null;
let summaryId = null;
let identity = null;
let etaData = null;
let lastTickTime = null;

/**
 * 
 * @param {*} etaExtract 
 * @returns {{ currentActivity: any }}
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
 * 
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
    return `<div class="cde-eta-generic cde-${identity}-panel"><span id="${summaryIdentifier}">${etaStr}</span></div>`;
}

/**
 * 
 */
export const onRefresh = () => {
    const currTime = new Date();
    if (lastTickTime == null || lastTickTime.getTime() + 1000 < currTime.getTime()) {
        lastTickTime = currTime;
    } else {
        return;
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
                            }
                        });
                    }
                    if (Object.prototype.hasOwnProperty.call(activity, "recipeQueue")) {
                        // Parse Mastery
                        // const recipeQueue = activity.recipeQueue;
                    }
                }
            });
            etaData = result.join("<br>");
        }
        parent.innerHTML = container(parent, summaryId, identity);
    }
}