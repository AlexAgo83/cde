// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// combatPanel.mjs

let mods = null;
let parent = null;
let summaryId = null;
let identity = null;
let etaData = null;
let lastCallTime = null;

/**
 * Extracts ETA (Estimated Time of Arrival) data for combat activities.
 * @param {boolean} etaExtract - Whether to perform ETA extraction.
 * @param {number} timeBuffer - Optional buffer time in ms for extraction.
 * @returns {{ currentActivity: any }} An object containing the current activity data.
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
 * Sets the callback function used to collect ETA data for this panel.
 * @param {*} cb - Callback function that extracts ETA data.
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
 * Refreshes the Combat panel by updating the displayed ETA data.
 * @returns {boolean|null} True if the panel was updated, null if skipped due to refresh throttling.
 */
export const onRefresh = () => {
    const currTime = new Date();
    let updated = false;
    if (lastCallTime == null || lastCallTime.getTime() + 25 < currTime.getTime()) {
        lastCallTime = currTime;
    } else {
        return null;
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
            /* Focus on Activity (only): Combat */
            const activities = scan?.currentActivity;
            if (
                activities 
                && typeof activities === "object" 
                && activities !== null 
                && Object.prototype.hasOwnProperty.call(activities, "Combat")) {
            
                const activity = activities.Combat;
                
                const kph = activity.monster?.kph;
                const kCount = activity.monster?.killCount;
                const dpsDealt = activity.monster?.dpsDealt?.toFixed(2);
                const dpsTaken = activity.monster?.dpsTaken?.toFixed(2);
                const seconds = activity.monster?.diffTime;
                const media = activity.monster?.media;
                const time = mods.getUtils().formatDuration(seconds, "vph-combat-fade");
                const result = [];
                
                result.push(
                    `<div class="cde-generic-panel">
                        <span class="skill-label">Kills per Hour ➜ </span>
                        <span class="vph vph-combat">${kph ?? "N/A"}</span><span class="vph vph-combat-fade">k/h</span>
                        <span class="skill-label">(</span>${
                            media ? `<img class="skill-media" src="${media}" />` : '<span class="skill-media"></span>'
                        }<span class="vph vph-combat-fade">x </span><span class="vph vph-combat">${kCount ?? "N/A"}</span>
                        <span class="skill-label">)</span>
                    </div>`
                );
                if (isCfg(Stg().ETA_LIVE_DPS)) {
                    result.push(
                        `<div class="cde-generic-panel">
                            <span class="skill-label">DPS Dealt ➜ </span>
                            <span class="vph vph-combat">${dpsDealt ?? "N/A"}</span><span class="vph vph-combat-fade">dmg/s</span>
                        </div>`
                    );
                    result.push(
                        `<div class="cde-generic-panel">
                            <span class="skill-label">DPS Taken ➜ </span>
                            <span class="vph vph-combat">${dpsTaken ?? "N/A"}</span><span class="vph vph-combat-fade">dmg/s</span>
                        </div>`
                    );
                }
                result.push(
                    `<div class="cde-generic-panel">
                        <span class="skill-label">Fight Duration ➜ </span>
                        <span class="vph vph-combat">${time ?? "N/A"}</span>
                    </div>`
                );

                if (activity && Object.prototype.hasOwnProperty.call(activity, "skills")) {
                    const skills = activity.skills;
                    const labelTime = 
                        `<div class="cde-generic-panel">
                            <span class="skill-label">Time to Next Level:</span>
                        </div>`;
                    
                    const resultSkills = [];
                    _game().skills?.registeredObjects.forEach((skill) => {
                        if (skill.isCombat && Object.prototype.hasOwnProperty.call(skills, skill.localID)) {
                            const current = skills[skill.localID];
                            const progression = typeof current.skillNextLevelProgress === "number"
                                ? Math.round(current.skillNextLevelProgress).toString()
                                : "N/A";
                            const seconds = current.secondsToNextLevel;
                            if (seconds && seconds > 0) {
                                const timeToNextLevelStr = mods.getUtils().formatDuration(seconds * 1000, "vph-skill-fade");
                                const skillMedia = skill.media;
                                resultSkills.push(
                                    `<div class="cde-generic-panel">
                                        <span class="skill-label">&nbsp;&nbsp;[</span>
                                        <span class="skill-value vph-skill">${progression}%</span>
                                        <span class="skill-label">] </span>
                                        ${skillMedia ? `<img class="skill-media" src="${skillMedia}" />` : '<span class="skill-media"></span>'}
                                        <span class="skill-value vph-skill">${skill.name}</span>
                                        <span class="skill-label"> ➜ </span>
                                        <span class="skill-value vph-skill">${timeToNextLevelStr ?? "N/A"}</span>
                                    </div>`
                                );
                            }
                        }
                    });

                    /* If there are any active skills */
                    if (resultSkills.length > 0) {
                        result.push(labelTime);
                        result.push(...resultSkills);
                    }
                }
                etaData = `<div class="cde-generic-panel">${result.join("")}</div>`;
                updated = true;
            }
        }
        parent.innerHTML = container(parent, summaryId, identity);
    }
    return updated;
}