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
 * Creates or retrieves a MutationObserver reference object for a given target page and identifier.
 * The observer monitors changes to the DOM and injects a styled header block with a summary
 * if it does not already exist in the target container.
 *
 * @param {string} targetPage - The CSS selector for the target page container.
 * @param {string} identifier - A unique identifier used to generate element IDs.
 * @returns {{observer: MutationObserver, identifier: string}} The observer reference object.
 */
function pageContainer(targetPage, identifier) {
    if (pageObservers && pageObservers.has(targetPage)) {
        return pageObservers.get(targetPage);
    }
    const observer = new MutationObserver(() => {
        const container = document.querySelector(targetPage);
        if (!container) return;
        const headerId = getHeaderID(identifier)
        if (document.getElementById(headerId)) return;
        const summaryId = getSummaryID(identifier);
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
    const reference = {
        observer: observer,
        identifier: identifier    
    }
    pageObservers.set(targetPage, reference);
    if (mods.getSettings().isDebug()) {
        console.log("[CDE] New observer registered", reference);
    }
    return reference;
}

/**
 * Initializes all MutationObservers for the relevant pages.
 * Sets up observers to monitor DOM changes and inject summary headers if the corresponding setting is enabled.
 * @param {boolean} connect Connect observer to view
 */
function initObservers(etaDisplay = false, connect = false) {
    if (etaDisplay) {
        const reference = pageContainer('#combat-container', 'combat')
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] Observers initialized", reference);
        }
        if (reference && connect) reference.observer.observe(document.body, { childList: true, subtree: true });
    } else {
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] ETA display is turned off");
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
        pageObservers.forEach((reference, targetPage) => {
            document.getElementById(getHeaderID(reference.identifier))?.remove();
            reference.observer.disconnect();
            console.log("[CDE] Observer disconnected", targetPage);
        });
        pageObservers.clear();
    }
    if (value && pageObservers.size == 0) {
        initObservers(true, true);
    }
}