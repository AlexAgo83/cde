// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// combatPanel.mjs

let mods = null;

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
        // const data = collectCb(true);
        // console.log(data);
    }
}

let processCollectData;
/**
 * 
 * @param {*} cb 
 */
export function setCollectCb(cb) {
    processCollectData = cb;
}

/**
 * Returns the default HTML for an ETA panel.
 * @param {*} summaryId - The summary element ID to use in the panel.
 * @returns {string} The default panel HTML.
 */
export function container(summaryId) {
    if (typeof processCollectData === "function" && isCfg(Stg().ETA_DISPLAY)) {
        const data = processCollectData(true);
        console.log(data);
    }
    return `<div class="cde-eta-panel">
            <strong>ETA - Combat</strong><br>
            <span id="${summaryId}">DEBUG SUMMARY</span>
            </div>`;
}