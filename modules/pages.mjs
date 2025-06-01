// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// pages.mjs

let mods = null;
let subModules = [];
let pageObservers = new Map();

let combatPanel = null;
let runecraftPanel = null;

let refreshOnPatch = false;

export function getCombatPanel() { return combatPanel; }
export function getRunecraftPanel() { return runecraftPanel; }

/**
 * Loads panel submodules for the pages manager.
 * This should be called once during initialization to set up the pages's submodules.
 * @param {*} ctx - The context object used to load submodules.
 */
export async function loadSubModule(ctx) {
  subModules.push(combatPanel = await ctx.loadModule("pages/combatPanel.mjs"));
  subModules.push(runecraftPanel = await ctx.loadModule("pages/nonCombatPanel.mjs"));
}

/**
 * Initialize pages module.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(modules) {
  mods = modules;
  initSubModule(modules);
}

/* @ts-ignore Handle DEVMODE */
function _Skill()  {  return Skill;  }

/* @ts-ignore Handle DEVMODE */
function _CombatManager()  {  return CombatManager;  }

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

/**
 * Returns the list of loaded panel submodules (e.g., combatPanel).
 * @returns {Array} An array of loaded submodule instances.
 */
export function getViews() {
  return subModules;
}

/**
 * Initializes all loaded panel submodules with the provided modules object.
 * @param {*} modules - The modules object containing dependencies.
 */
export function initSubModule(modules) {
  getViews().forEach((m) => {
    if (m && typeof m.init === "function")
        m.init(modules);
    else console.log("[CDE] Page error", m);
  });
}

/**
 * Calls the load method on all loaded panel submodules, passing the context.
 * @param {*} ctx - The context object to pass to each submodule's load method.
 */
export function load(ctx) {
    if (mods?.getSettings().isDebug()) {
        console.log("[CDE] Loading pages", getViews());
    }

    getViews().forEach((m) => {
        if (m && typeof m.load === "function")
            m.load(ctx);
        else console.log("[CDE] Page error", m);
    });
}

/**
 * 
 * @param {*} ctx 
 * // Skill.onRecipeComplete
 */
export function worker(ctx) {
    // Worker UI refresh
    ctx.patch(_CombatManager(), 'onEnemyDeath').after(function(...args) {
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] Combat ended:", ...args);
        }
        const panel = getCombatPanel();
        if (panel && typeof panel.onRefresh === "function") {
            panel.onRefresh();
        }
    });
}

/**
 * Generates the HTML ID for the ETA panel header for a given identifier.
 * @param {*} identifier - Unique identifier for the panel.
 * @returns {string} The header element ID.
 */
function getHeaderID(identifier) {
    return `cde-${identifier}-header`;
}
/**
 * Generates the HTML ID for the ETA panel summary for a given identifier.
 * @param {*} identifier - Unique identifier for the panel.
 * @returns {string} The summary element ID.
 */
function getSummaryID(identifier) {
    return `cde-${identifier}-summary`;
}

/**
 * Returns the default HTML for an ETA panel.
 * @param {*} summaryId - The summary element ID to use in the panel.
 * @returns {string} The default panel HTML.
 */
function onDefaultPanel(parentPanel, summaryId, identifier) {
    return `<div class="cde-eta-panel">
            <strong>DEBUG TITLE</strong><br>
            <span id="${summaryId}">DEBUG SUMMARY - ${identifier}</span>
            </div>`;
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
function pageContainer(targetPage, identifier, viewPanel, onRefresh) {
    if (!mods) {
        throw new Error("Modules not initialized. Call init(modules) before using pageContainer.");
    }
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
        block.innerHTML = viewPanel(block, summaryId, identifier);
        if (typeof onRefresh === "function") {
            block.addEventListener("click", onRefresh);
        }
        container.prepend(block);
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
        const references = []
        
        // Combat
        const pCombat = getCombatPanel();
        if (pCombat && typeof pCombat.container === "function" && typeof pCombat.onRefresh === "function")
            references.push(pageContainer('#combat-container', 'combat', pCombat.container, pCombat.onRefresh));

        // Runecraft
        const pRunecraft = getRunecraftPanel();
        if (pRunecraft && typeof pRunecraft.container === "function" && typeof pRunecraft.onRefresh === "function")
            references.push(pageContainer('#runecrafting-container', 'runecraft', pRunecraft.container, pRunecraft.onRefresh));
        
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] Observers initialized", references);
        }
        if (references && references.length > 0 && connect) {
            references.forEach((reference) => {
                reference.observer.observe(document.body, { childList: true, subtree: true });
            })
        }
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

/**
 * 
 * @param {*} cb 
 */
export function setCollectCb(cb) {
    getViews().forEach((m) => {
        if (m && typeof m.setCollectCb === "function")
            m.setCollectCb(cb);
        else console.log("[CDE] Page error", m);
    });
}