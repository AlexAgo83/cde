// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// pages.mjs

let mods = null;
let subModules = [];
let pageObservers = new Map();

let combatPanel = null;
let runecraftPanel = null;
let thievingPanel = null;

export function getCombatPanel() { return combatPanel; }
export function getRunecraftPanel() { return runecraftPanel; }
export function getThievingPanel() { return thievingPanel; }

/**
 * Loads panel submodules for the pages manager.
 * This should be called once during initialization to set up the pages's submodules.
 * @param {*} ctx - The context object used to load submodules.
 */
export async function loadSubModule(ctx) {
  subModules.push(combatPanel = await ctx.loadModule("pages/combatPanel.mjs"));
  subModules.push(runecraftPanel = await ctx.loadModule("pages/nonCombatPanel.mjs"));
  subModules.push(thievingPanel = await ctx.loadModule("pages/nonCombatPanel.mjs"));
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
function _game()  {  return game;  }
/* @ts-ignore Handle DEVMODE */
function _ui() { return ui; }
/* @ts-ignore Handle DEVMODE */
function _Swal() { return Swal; }
/* @ts-ignore Handle DEVMODE */
function _Skill()  {  return Skill;  }
/* @ts-ignore Handle DEVMODE */
function _CraftingSkill() { return CraftingSkill; }
/* @ts-ignore Handle DEVMODE */
function _Thieving() { return Thieving; }
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

const doWorker = (userPage, panel, localID) => {
    if (mods.getSettings().isDebug()) console.log("[CDE] doWorker:"+localID, userPage);
    if (panel && typeof panel.onRefresh === "function") {
        const updated = panel.onRefresh();
        if (updated != null) panel.show(updated);
    } else if (mods.getSettings().isDebug()) console.log("[CDE] worker can't execute refresh", panel);
}

/**
 * Sets up hooks to refresh UI panels after certain in-game actions (combat, crafting, thieving).
 * @param {*} ctx - The context object used to patch game methods.
 */
export function worker(ctx) {
    // Worker UI refresh
    ctx.patch(_CombatManager(), 'onEnemyDeath').after(function(...args) {
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] Combat ended:", ...args);
        }
        
        const userPage = _game().openPage;
        if (userPage 
            && userPage.localID
            && userPage.containerID) {
            
            /* COMBAT */ doWorker(userPage, getCombatPanel(), "Combat");

        } else if (mods.getSettings().isDebug()) console.log("[CDE] Unable to access the active page", userPage);
    });

    ctx.patch(_CraftingSkill(), 'action').after(function(...args) {
       if (mods.getSettings().isDebug()) {
            console.log("[CDE] Craft ended:", ...args);
        }

        const userPage = _game().openPage;
        if (userPage 
            && userPage.localID
            && userPage.containerID) {
            
            /* Runecrafting */ doWorker(userPage, getRunecraftPanel(), "Runecrafting");

        } else if (mods.getSettings().isDebug()) console.log("[CDE] Unable to access the active page", userPage);
    });

    ctx.patch(_Thieving(), 'action').after(function(...args) {
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] Thieving action finished", ...args);
        }

        const userPage = _game().openPage;
        if (userPage 
            && userPage.localID
            && userPage.containerID) {
            
            /* Thieving */ doWorker(userPage, getThievingPanel(), "Thieving");

        } else if (mods.getSettings().isDebug()) console.log("[CDE] Unable to access the active page", userPage);
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
        const corePanel = document.createElement('div');
        corePanel.id = headerId;
        corePanel.classList.add("cde-eta-header");
        corePanel.innerHTML = viewPanel(corePanel, summaryId, identifier);
        corePanel.style.display = "none";
        if (typeof onRefresh === "function") {
            corePanel.addEventListener("click", onRefresh);
        }

        const rowDeck = container.querySelector('.row-deck');
        if (rowDeck) {
            if (mods.getSettings().isDebug()) {
                console.log("[CDE] Match current row-deck:", rowDeck);
            }
            rowDeck.prepend(corePanel);
        } else {
            if (mods.getSettings().isDebug()) {
                console.log("[CDE] Can't match row-deck:", rowDeck);
            }
            container.prepend(corePanel);
        }
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
 * Registers a MutationObserver for a given panel and page, adding it to the references array.
 * @param {*} references - Array to store observer references.
 * @param {*} panel - The panel object containing container and onRefresh methods.
 * @param {*} pageId - The CSS selector for the page container.
 * @param {*} identifier - Unique identifier for the observer.
 */
function registerObserver(references, panel, pageId, identifier) {
    if (panel && typeof panel.container === "function" && typeof panel.onRefresh === "function") {
        references.push(pageContainer(pageId, identifier, panel.container, panel.onRefresh));
    }
}

/**
 * Initializes all MutationObservers for the relevant pages.
 * Sets up observers to monitor DOM changes and inject summary headers if the corresponding setting is enabled.
 * @param {boolean} connect Connect observer to view
 */
function initObservers(etaDisplay = false, connect = false) {
    if (etaDisplay) {
        const references = []
                
        /* Combat */ registerObserver(references, getCombatPanel(), '#combat-container', 'combat')
        /* Runecraft */ registerObserver(references, getRunecraftPanel(), '#runecrafting-container', 'runecraft')
        /* Thieving */ registerObserver(references, getThievingPanel(), '#thieving-container', 'thieving')

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
 * Sets the collect callback function for all loaded panel submodules.
 * @param {Function} cb - The callback function to be set for collection.
 */
export function setCollectCb(cb) {
    getViews().forEach((m) => {
        if (m && typeof m.setCollectCb === "function")
            m.setCollectCb(cb);
        else console.log("[CDE] Page error", m);
    });
}