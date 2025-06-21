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

export const URL_COMPLETION = "https://cdn2-main.melvor.net/assets/media/main/completion_log.png";
export const URL_COMBAT = "https://cdn2-main.melvor.net/assets/media/skills/combat/combat.png";
export const URL_DEFENCE = "https://cdn2-main.melvor.net/assets/media/skills/defence/defence.png"
export const URL_STATISTICS = "https://cdn2-main.melvor.net/assets/media/main/statistics_header.png";;

/**
 * Extracts ETA (Estimated Time of Arrival) data for combat activities.
 * @param {boolean} etaExtract - Whether to perform ETA extraction.
 * @param {number} timeBuffer - Optional buffer time in ms for extraction.
 * @returns {{ currentActivity: any }} An object containing the current activity data.
 */
let extractETA = (etaExtract=true, timeBuffer=100) => {return {currentActivity: null}};

/**
 * Placeholder for Controls Panel function.
 */
let controlsPanelCb = () => {};

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
 * Logs a debug message if the 'isDebug' setting is enabled.
 *
 * The message is prefixed with "[CDE/" + label + "] [Step: " + step + "] (" + func + ")".
 * If arguments are provided, ", args:" is appended to the prefix and the arguments are logged
 * after the prefix.
 *
 * @param {string} label - The label for the debug message.
 * @param {string} step - The step for the debug message.
 * @param {string} from - The starting position of the logged block.
 * @param {string} to - The ending position of the logged block.
 * @param {...*} args - The arguments to log.
 */
function logger(label, step, from, to, ...args) {
    mods.getUtils().logger(label, step, "combatPanel", from, to, ...args);
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
 * Sets the callback function used to generate the controls panel.
 * @param {*} cb - Callback function that generate controls panel.
 */
export function setControlsPanelCb(cb) {
    if (mods.getSettings().isDebug()) {
        console.log("[CDE] Controls panel callback:", cb);
    }
    controlsPanelCb = cb;
}
/**
 * Returns the parent panel element.
 * @returns {Object} The parent panel element.
 */
export function getParent() {
    return parent;
}

/**
 * Retrieves the unique identifier for the combat panel.
 * @returns {string} The identifier of the combat panel.
 */
export function getIdentity() {
    return identity;
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
    const controlsPanel = controlsPanelCb();
    const etaSize = mods.getCloudStorage().getCurrentETASize(identity);

    let wrapper = `<span class="cde-eta-summary ${etaSize == "small" ? "cde-eta-summary-small" : ""}" id="${summaryIdentifier}">${etaStr}</span>${controlsPanel}`;
    let isVisible = mods.getCloudStorage().isEtaVisible() ? ``:` cde-eta-generic-flat`;

    return `<div class="cde-${identity}-panel cde-eta-generic${isVisible}"><div class="cde-eta-wrapper">${wrapper}</div></div>`;
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
export const onRefresh = (etaSize) => {
    const currTime = new Date();
    let updated = false;
    const isSmallMode = (etaSize === "small");
    const isNotSmallMode = !isSmallMode;

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
        
        const activities = mods.getUtils().getIfExist(scan, "currentActivity");
        const activity = mods.getUtils().getIfExist(activities, "Combat");

        if (
            scan 
            && typeof scan === "object" 
            && scan !== null 
            && activities
        ) {
            /* Focus on Activity (only): Combat */
            if (
                activities 
                && typeof activities === "object" 
                && activities !== null 
                && activity) {
            
                const kph = activity.monster?.kph;
                const dCount = activity.monster?.area?.areaCompletion;
                const kCount = activity.monster?.killCount;
                const dpsDealt = activity.monster?.dpsDealt;
                const dpsTaken = activity.monster?.dpsTaken;
                const seconds = activity.monster?.diffTime;
                const media = activity.monster?.media;
                const areaMedia = activity.monster?.area?.areaMedia;
                const time = mods.getUtils().formatDuration(seconds, "vph-combat-fade");
                
                const resultTop = [];
                const resultCenter = [];
                const resultEnd = [];
                const resultNotification = mods.getNotification().displayNotification();
                
                const activePotion = mods.getCollector().collectActivePotionsForDisplay("Combat");
                
                let pKphStr = `${URL_COMPLETION ? `<img class="skill-media" src="${URL_COMPLETION}" />` : `<span class="skill-media"></span>`}`;
                pKphStr += `<span class="skill-label"> Kills per Hour ➜ </span>`;
                if (!kph || kph === "NaN" || kph === 0) {
                    pKphStr += `<span class="vph vph-tiny vph-combat-fade">Compute ⏱️</span>`;
                } else {
                    pKphStr += `<span class="vph vph-combat">${kph ?? "N/A"}</span><span class="vph vph-combat-fade">k/h</span>`;
                }

                let pMediaArea = `${(areaMedia ? `<img class="skill-media" src="${areaMedia}"/>`:`<span class="skill-media"></span>`)}`;
                let pMediaMonster = `${(media ? `<img class="skill-media" src="${media}"/>`:`<span class="skill-media"></span>`)}`;
                let pCountAreaStr = dCount ? `<span class="vph vph-tiny vph-combat-fade">x</span><span class="vph vph-tiny vph-combat">${dCount}</span>`:``;
                let pCountMonsterStr = kCount ? `<span class="vph vph-tiny vph-combat-fade">x</span><span class="vph vph-tiny vph-combat">${kCount}</span>`:``;

                if (isCfg(Stg().ETA_LIVE_DPS)) {
                    resultTop.push(
                        `<div class="cde-generic-panel">
                            ${URL_COMBAT ? `<img class="skill-media" src="${URL_COMBAT}" />` : `<span class="skill-media"></span>`}
                            <span class="skill-label">DPS Dealt ➜ </span>
                            <span class="vph vph-combat-dealt">${dpsDealt ?? "N/A"}</span><span class="vph vph-combat-dealt-fade">dmg/s</span>
                        </div>`
                    );
                    resultTop.push(
                        `<div class="cde-generic-panel">
                            ${URL_DEFENCE ? `<img class="skill-media" src="${URL_DEFENCE}" />` : `<span class="skill-media"></span>`}
                            <span class="skill-label">DPS Taken ➜ </span>
                            <span class="vph vph-combat-taken">${dpsTaken ?? "N/A"}</span><span class="vph vph-combat-taken-fade">dmg/s</span>
                        </div>`
                    );
                }
                
                if (isNotSmallMode) {
                    resultTop.push(
                        `<div class="cde-generic-panel">${pKphStr}<span class="skill-label"> (</span>${pMediaArea}${pCountAreaStr}${pMediaMonster}${pCountMonsterStr}<span class="skill-label"> )</span></div>`
                    );
                }
                
                if (activePotion) {
                    Object.keys(activePotion).forEach((pot) => {
                        const value = activePotion[pot];
                        resultTop.push(
                            `<div class="cde-generic-panel">
                                ${value.media ? `<img class="skill-media" src="${value.media}" />` : `<span class="skill-media"></span>`}
                                <span class="skill-label">${value.potionLabel} ➜ </span>
                                <span class="vph vph-combat vph-small">${value.charges ?? "N/A"}</span>
                                <span class="vph vph-combat-fade vph-small">c</span>
                                <span class="skill-label"> (</span>
                                <span class="vph vph-combat vph-small">${value.inBank ?? "N/A"}</span>
                                <span class="skill-label">)</span>
                            </div>`
                        );
                    })
                }

                resultTop.push(
                    `<div class="cde-generic-panel">
                        ${URL_STATISTICS ? `<img class="skill-media" src="${URL_STATISTICS}" />` : `<span class="skill-media"></span>`}
                        <span class="skill-label">Fight Duration ➜ </span>
                        <span class="vph vph-combat">${time ?? "N/A"}</span>
                    </div>`
                );


                const skills = mods.getUtils().getIfExist(activity, "skills");
                if (isNotSmallMode 
                    && activity 
                    && skills) {
                    const labelTime = 
                        `<div class="cde-generic-panel cde-generic-header">
                            <span class="skill-label">Time to Next Level:</span>
                        </div>`;
                    
                    const resultSkills = [];
                    _game().skills?.registeredObjects.forEach((skill) => {
                        const current = mods.getUtils().getIfExist(skills, skill.localID);
                        if (skill.isCombat && current) {
                            const progression = typeof current.skillNextLevelProgress === "number"
                                ? (Math.round(current.skillNextLevelProgress * 100) / 100).toFixed(2)
                                : "N/A";
                            const seconds = current.secondsToNextLevel;
                            if (seconds && seconds > 0) {
                                const timeToNextLevelStr = mods.getUtils().formatDuration(seconds * 1000, "vph-skill-fade");
                                const skillMedia = skill.media;
                                resultSkills.push(
                                    `<div class="cde-generic-panel">
                                        ${skillMedia ? `<img class="skill-media" src="${skillMedia}" />` : `<span class="skill-media"></span>`}
                                        <span class="skill-value vph-skill">${skill.name}</span>
                                        <span class="skill-value vph-tiny vph-skill-fade"> to ${skill.level+1}</span>
                                        <span class="skill-label"> ➜ </span>
                                        <span class="skill-value vph-skill">${timeToNextLevelStr ?? "N/A"}</span>
                                        <span class="skill-label">( </span><span class="skill-value vph-tiny vph-skill">${progression}</span><span class="skill-value vph-small vph-skill-fade">%</span><span class="skill-label"> )</span>
                                    </div>`
                                );
                            }
                        }
                    });

                    /* If there are any active skills */
                    if (resultSkills.length > 0) {
                        resultTop.push(labelTime);
                        resultTop.push(...resultSkills);
                    }
                }
                const showHide = mods.getCloudStorage().isEtaVisible() ? "" : "hide";
                etaData = `<div id="cde-subwrapper" class="${showHide}"><div class="cde-combat-panel">${resultTop.join("")}${resultCenter.join("")}${resultEnd.join("")}</div><div class="cde-combat-notification">${resultNotification.join("")}</div></div>`;
                updated = true;
            }
        }
        parent.innerHTML = container(parent, summaryId, identity);
    }
    return updated;
}