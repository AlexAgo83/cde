// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// combatPanel.mjs

let mods = null;
let parent = null;
let summaryId = null;
let identity = null;
let etaData = null;
let lastCraftTime = null;

/**
 * 
 * @param {*} etaExtract 
 * @returns {{ currentActivity: any }}
 */
let extractETA = (etaExtract=true, timeBuffer=100) => {return {currentActivity: null}};

/**
 * Initialize the combat panel.
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
        console.log("[CDE] Combat panel callback:", cb);
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
    return `<div class="cde-${identity}-panel"><span id="${summaryIdentifier}">${etaStr}</span></div>`;
}

/**
 * 
 */
export const onRefresh = () => {
    const currTime = new Date();
    if (lastCraftTime == null || lastCraftTime.getTime() + 1000 < currTime.getTime()) {
        lastCraftTime = currTime;
    } else {
        return;
    }
    if (parent && typeof extractETA === "function" && isCfg(Stg().ETA_DISPLAY)) {
        
        const scan = extractETA(true, 100);
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] Process quick scan:", scan);
        }
        
        if (
            scan 
            && typeof scan === "object" 
            && scan !== null 
            && Object.prototype.hasOwnProperty.call(scan, "currentActivity")
        ) {
            /** @type {{ currentActivity: any }} */
            const scanWithActivity = scan;
            const activities = scanWithActivity.currentActivity;

            /* Activity: Combat */
            if (
                activities 
                && typeof activities === "object" 
                && activities !== null 
                && Object.prototype.hasOwnProperty.call(activities, "Combat")) {
            
                const activity = activities.Combat;
                
                const kph = activity.monster?.kph;
                const time = activity.monster?.diffTimeStr;
                const result = [];
                
                result.push(
                    `<b>Kills per Hour:</b> <span class="vph">${kph ?? "N/A"}</span>`,
                    `<b>Fight Duration:</b> <span class="duration">${time ?? "N/A"}</span>`
                );

                if (activity && Object.prototype.hasOwnProperty.call(activity, "skills")) {
                    const skills = activity.skills;
                    result.push(`<b>Time to Next Level:</b>`);
                    _game().skills?.registeredObjects.forEach((skill) => {
                        if (skill.isCombat && Object.prototype.hasOwnProperty.call(skills, skill.localID)) {
                            const current = skills[skill.localID];
                            result.push(
                                `&nbsp;&nbsp;<span class="skill-label">${skill.name}:</span> <span class="skill-value">${current.timeToNextLevelStr}</span>`
                            );
                        }
                    });
                }
                etaData = result.join("<br>");
            }
        }
        parent.innerHTML = container(parent, summaryId, identity);
    }
}