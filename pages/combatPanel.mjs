// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// combatPanel.mjs

let mods = null;
let parent = null;
let summaryId = null;
let etaData = null;
let lastTickTime = null;

/**
 * 
 * @param {*} etaExtract 
 * @returns {{ currentActivity: any }}
 */
let processCollectData = (etaExtract=true) => {return {currentActivity: null}};

/**
 * Initialize the panel.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(modules) {
  mods = modules;
}

/* @ts-ignore Handle DEVMODE */
function _game()  {  return game;  }
/* @ts-ignore Handle DEVMODE */
function _ui() { return ui; }
/* @ts-ignore Handle DEVMODE */
function _Swal() { return Swal; }
/* @ts-ignore Handle DEVMODE */
function _Skill()  {  return Skill;  }

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
        ctx.patch(_Skill(), 'addXP').after(function(amount, masteryAction) {
            onRefresh();
            return [amount, masteryAction];
        });
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
    processCollectData = cb;
}

/**
 * Returns the default HTML for an ETA panel.
 * @param {*} summaryIdentifier - The summary element ID to use in the panel.
 * @returns {string} The default panel HTML.
 */
export function container(parentPanel, summaryIdentifier) {
    parent = parentPanel;
    summaryId = summaryIdentifier;
    const etaStr = etaData ? etaData : "n/a";
    return `<div class="cde-combat-panel">
            <strong>ETA - Combat</strong><br>
            <span id="${summaryIdentifier}">${etaStr}</span>
            </div>`;
}

/**
 * 
 */
export function onRefresh() {
    const currTime = new Date();
    if (lastTickTime == null || lastTickTime.getTime() + 1000 < currTime.getTime()) {
        lastTickTime = currTime;
    } else {
        return;
    }
    if (typeof processCollectData === "function" && isCfg(Stg().ETA_DISPLAY)) {
        
        const scan = processCollectData(true);
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

            // ETA - Combat
            const activity = activities.Combat;
            const kph = activity.monster?.kph;
            const time = activity.monster?.diffTimeStr;
            const result = [];
            
            result.push(
                `<b>Kills per Hour:</b> <span style="color:#8fff8f">${kph ?? "N/A"}</span>`,
                `<b>Fight Duration:</b> <span style="color:#8fcaff">${time ?? "N/A"}</span>`
            );

            if (activity && Object.prototype.hasOwnProperty.call(activity, "skills")) {
                const skills = activity.skills;
                result.push(`<b>Time to Next Level:</b>`);
                _game().skills?.registeredObjects.forEach((skill) => {
                    if (skill.isCombat && Object.prototype.hasOwnProperty.call(skills, skill.localID)) {
                        const current = skills[skill.localID];
                        result.push(
                            `&nbsp;&nbsp;<span style="color:#ffd700">${skill.name}:</span> <span style="color:#fff">${current.timeToNextLevelStr}</span>`
                        );
                    }
                });
            }
            etaData = result.join("<br>");
        }
        parent.innerHTML = container(parent, summaryId);
    }
}