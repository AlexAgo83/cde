// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// pages.mjs

let mods = null;
let pageObservers = new Map();

/**
 * Initialize pages module.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(modules) {
  mods = modules;
}

/**
 * Get the proxy-settings reference object.
 * @returns {Object} The settings reference object.
 */
function Stg() {
	return mods.getSettings()?.SettingsReference;
}

/**
 * Get the boolean value for a settings reference.
 * @param {*} reference - The settings reference to check.
 * @returns {boolean} True if the reference is allowed, false otherwise.
 */
function isCfg(reference) {
	return mods.getSettings()?.isCfg(reference);
}

function getHeaderID(identifier) {
    return `cde-${identifier}-header`;
}
function getSummaryID(identifier) {
    return `cde-${identifier}-summary`;
}

/**
 * Creates or retrieves a MutationObserver for a given target page and identifier.
 * The observer monitors changes to the DOM and injects a styled header block with a summary
 * if it does not already exist in the target container.
 *
 * @param {string} targetPage - The CSS selector for the target page container.
 * @param {string} identifier - A unique identifier used to generate element IDs.
 * @returns {MutationObserver} The MutationObserver instance associated with the target page.
 */
function pageContainer(targetPage, identifier) {
    if (pageObservers && pageObservers.has(targetPage)) {
        return pageObservers.get(targetPage);
    }
    const observer = new MutationObserver(() => {
        const container = document.querySelector(targetPage);
        const headerId = getHeaderID(identifier)
        const summaryId = getSummaryID(identifier);
        if (!container) return;
        if (document.querySelector(headerId)) return;

        const block = document.createElement('div');
        block.id = headerId;
        block.innerHTML = `
            <div style="
            background: linear-gradient(to right, #1e1e2f, #2b2b40);
            color: #fff;
            padding: 10px;
            margin-bottom: 12px;
            border-radius: 8px;
            box-shadow: 0 0 5px rgba(0,0,0,0.5);
            font-family: sans-serif;
            font-size: 14px;
            ">
            <strong>DEBUG TITLE</strong><br>
            <span id="${summaryId}">DEBUG SUMMARY</span>
            </div>
        `;
        container.prepend(block);

        const content = `DEBUG UPDATED SUMMARY`;
        const summaryElem = document?.getElementById(summaryId);
        if (summaryElem) summaryElem.innerHTML = content;
    });
    pageObservers.set(targetPage, observer);
    if (mods.getSettings().isDebug()) {
        console.log("[CDE] New observer registered", observer);
    }
    return observer;
}

/**
 * Initializes all MutationObservers for the relevant pages.
 * Sets up observers to monitor DOM changes and inject summary headers if the corresponding setting is enabled.
 */
function initObservers() {
    if (isCfg(Stg().ETA_DISPLAY)) {
        const observer = pageContainer('#combat-container', 'combat')
        observer.observe(document.body, { childList: true, subtree: true });
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] Observers initialized", observer);
        }
    }
}
/**
 * Enables or disables all registered page observers based on the provided value.
 * If value is falsy, disconnects all observers. If value is truthy and no observers exist, initializes them.
 * @param {*} value - If truthy, observers are initialized; if falsy, observers are disconnected.
 */
export function triggerObservers(value) {
    if (!value && pageObservers.size > 0) {
        pageObservers.forEach((obs) => {
            obs.disconnect();
            console.log("[CDE] Observer disconnected", obs);
        });
    }
    if (value && pageObservers.size == 0) {
        initObservers();
    }
}