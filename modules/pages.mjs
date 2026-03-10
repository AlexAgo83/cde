// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// pages.mjs

let mods = null;
let _lastTick = null;
let subModules = [];
let pageObservers = new Map();

/** COMBAT PANEL */
let combatPanel = null;
export function getCombatPanel() { return combatPanel; }

/** SKILLS PANEL */
let woodcuttingPanel = null;
let fishingPanel = null;
let firemakingPanel = null;
let cookingPanel = null;
let miningPanel = null;
let smithingPanel = null;
let thievingPanel = null;
let fletchingPanel = null;
let craftingPanel = null;
let runecraftingPanel = null;
let herblorePanel = null;
let agilityPanel = null;
let summoningPanel = null;
let astrologyPanel = null;
let altMagicPanel = null;
let cartographyPanel = null;
let archaeologyPanel = null;
export function getWoodcuttingPanel() { return woodcuttingPanel; }
export function getFishingPanel() { return fishingPanel; }
export function getFiremakingPanel() { return firemakingPanel; }
export function getCookingPanel() { return cookingPanel; }
export function getMiningPanel() { return miningPanel; }
export function getSmithingPanel() { return smithingPanel; }
export function getThievingPanel() { return thievingPanel; }
export function getFletchingPanel() { return fletchingPanel; }
export function getCraftingPanel() { return craftingPanel; }
export function getRunecraftingPanel() { return runecraftingPanel; }
export function getHerblorePanel() { return herblorePanel; }
export function getAgilityPanel() { return agilityPanel; }
export function getSummoningPanel() { return summoningPanel; }
export function getAstrologyPanel() { return astrologyPanel; }
export function getAltMagicPanel() { return altMagicPanel; }
export function getCartographyPanel() { return cartographyPanel; }
export function getArchaeologyPanel() { return archaeologyPanel; }

/** Chart Panel */
let chartPanel = null;

/**
 * Loads panel submodules for the pages manager.
 * This should be called once during initialization to set up the pages's submodules.
 * @param {*} ctx - The context object used to load submodules.
 */
export async function loadSubModule(ctx) {
    const runtime = await ctx.loadModule("modules/melvorRuntime.mjs");
  
    /* Combat Panel */
    subModules.push(combatPanel = await runtime.loadModule(ctx, "pages/combatPanel.mjs"));
  
    /* Non-Combat Panel */
    const nonCombatPanel = await runtime.loadModule(ctx, "pages/nonCombatPanel.mjs");
    subModules.push(woodcuttingPanel = nonCombatPanel.createInstance("woodcutting"));
    subModules.push(fishingPanel = nonCombatPanel.createInstance("fishing"));
    subModules.push(firemakingPanel = nonCombatPanel.createInstance("firemaking"));
    subModules.push(cookingPanel = nonCombatPanel.createInstance("cooking"));
    subModules.push(miningPanel = nonCombatPanel.createInstance("mining"));
    subModules.push(smithingPanel = nonCombatPanel.createInstance("smithing"));
    subModules.push(thievingPanel = nonCombatPanel.createInstance("thieving"));
    subModules.push(fletchingPanel = nonCombatPanel.createInstance("fletching"));
    subModules.push(craftingPanel = nonCombatPanel.createInstance("crafting"));
    subModules.push(runecraftingPanel = nonCombatPanel.createInstance("runecraft"));
    subModules.push(herblorePanel = nonCombatPanel.createInstance("herblore"));
    subModules.push(agilityPanel = nonCombatPanel.createInstance("agility"));
    subModules.push(summoningPanel = nonCombatPanel.createInstance("summoning"));
    subModules.push(astrologyPanel = nonCombatPanel.createInstance("astrology"));
    subModules.push(altMagicPanel = nonCombatPanel.createInstance("altmagic"));
    subModules.push(cartographyPanel = nonCombatPanel.createInstance("cartography"));
    subModules.push(archaeologyPanel = nonCombatPanel.createInstance("archaeology"));

    /* Chart Panel */
    subModules.push(chartPanel = await runtime.loadModule(ctx, "pages/panel/chartPanel.mjs"));
}

/**
 * Initialize pages module.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(modules) {
  mods = modules;
  initSubModule(modules);
}

/**
 * Logs a debug message if the 'isDebug' setting is enabled.
 * The message is prefixed with "[CDE/" + label + "] [Step: " + step + "] (" + from + "->" + to + ")".
 * If arguments are provided, ", args:" is appended to the prefix and the arguments are logged
 * after the prefix.
 * @param {string} label - The label for the debug message.
 * @param {string} step - The step for the debug message.
 * @param {string} from - The starting position of the logged block.
 * @param {string} to - The ending position of the logged block.
 * @param {...*} args - The arguments to log.
 */
export function logger(label, step, from, to, ...args) {
    mods.getUtils().logger(label, step, "pages", from, to, ...args);
}

/**
 * Logs a debug message if the 'isDebug' setting is enabled with a prefix of "[Notif]".
 * The message is prefixed with "[Notif] [Step: " + step + "] (" + from + "->" + to + ")".
 * If arguments are provided, ", args:" is appended to the prefix and the arguments are logged
 * after the prefix.
 * @param {string} step - The step for the debug message.
 * @param {string} from - The starting position of the logged block.
 * @param {string} to - The ending position of the logged block.
 * @param {...*} args - The arguments to log.
 */
export function loggerNotif(step, from, to, ...args) {
    logger("Notif", step, from, to, ...args);
}

/* @ts-ignore Handle DEVMODE */
function _game()  {  return mods.getMelvorRuntime().getGame(); }
/* @ts-ignore Handle DEVMODE */
function _GameClass() { return mods.getMelvorRuntime().getGlobal("Game"); }
/* @ts-ignore Handle DEVMODE */
function _ui() { return mods.getMelvorRuntime().getUi(); }
/* @ts-ignore Handle DEVMODE */
function _Swal() { return Swal; }
/* @ts-ignore Handle DEVMODE */
function _Skill()  {  return mods.getMelvorRuntime().getGlobal("Skill");  }
/* @ts-ignore Handle DEVMODE */
function _CraftingSkill() { return mods.getMelvorRuntime().getGlobal("CraftingSkill"); }
/* @ts-ignore Handle DEVMODE */
function _GatheringSkill() { return mods.getMelvorRuntime().getGlobal("GatheringSkill"); }
/* @ts-ignore Handle DEVMODE */
function _Thieving() { return mods.getMelvorRuntime().getGlobal("Thieving"); }
/* @ts-ignore Handle DEVMODE */
function _CombatManager()  {  return mods.getMelvorRuntime().getGlobal("CombatManager");  }
/* @ts-ignore Handle DEVMODE */
function _Player()  {  return mods.getMelvorRuntime().getGlobal("Player");  }
/* @ts-ignore Handle DEVMODE */
function _Enemy()  {  return mods.getMelvorRuntime().getGlobal("Enemy");  }
/* @ts-ignore Handle DEVMODE */
function _AltMagic() { return mods.getMelvorRuntime().getGlobal("AltMagic"); }
/* @ts-ignore Handle DEVMODE */
function _Archaeology() { return mods.getMelvorRuntime().getGlobal("Archaeology"); }
/* @ts-ignore Handle DEVMODE */
function _Cartography() { return mods.getMelvorRuntime().getGlobal("Cartography"); }

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
 * Get the value for a settings reference.
 * @param {*} reference - The settings reference to get.
 * @returns {*} The value for the reference, or null if not found.
 */
function getCfg(reference) {
    return mods.getSettings()?.getCfg(reference);
}

function runtime() {
    return mods.getMelvorRuntime();
}

function renderer() {
    return mods.getPanelRenderer();
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
 * Handles refreshing and updating a UI panel for a given user page and panel.
 * @param {*} userPage - The current user page object.
 * @param {boolean} isCombat
 * @param {*} activeAction
 * @param {*} panel - The panel object to refresh.
 * @param {*} localID - A string identifier for logging/debugging.
 * @returns {boolean} updated
 */
function doWorker(userPage, isCombat, activeAction, panel, localID) {
    let updated = false;
    // if (mods.getSettings().isDebug()) console.log("[CDE] doWorker:run:"+localID, userPage);
    if (panel && typeof panel.onRefresh === "function") {
        let patchedLoginID = localID;

        /** Matching screen */
        const isNotActionPage = userPage && (userPage.localID !== localID);
        if (localID === "AltMagic" && !isCombat) patchedLoginID = "Magic";
        const isNotActiveAction = activeAction && (activeAction.localID !== patchedLoginID);
        if (isNotActionPage || isNotActiveAction) {
            // if (mods.getSettings().isDebug()) console.log("[CDE] doWorker:Not matching current screen:"+localID);
            panel.show(false);
            chartPanel.showChart(panel.getIdentity(), false);
            return updated;
        }
        
        /** Display Mode */
        const sizeCursor = panel.getIdentity();
        const etaSize = mods.getCloudStorage().getCurrentETASize(sizeCursor);

        /** Refresh & update visibility */
        try {
            /* Soft-refresh shared notification */
            softRefreshSharedNotification();

            /* Run onRefresh */
            updated = panel.onRefresh(etaSize);
            if (mods.getSettings().isDebug()) console.log("[CDE] doWorker:onRefresh("+etaSize+"):"+localID+" -> "+updated);
        } catch (error) {
            console.error("[CDE] doWorker:onRefresh:" + localID, error);
        }
        if (updated != null) {
            panel.show(updated);
            chartPanel.showChart(panel.getIdentity(), updated);
        }
        if (panel && typeof panel.getParent === "function") {
            const position = mods.getCloudStorage().getCurrentETAPostion();
            renderer().displayEtaAt(panel.getParent(), position);
        }
    } else if (mods.getSettings().isDebug()) console.log("[CDE] doWorker:Can't execute refresh:"+localID, panel);
    return updated;
}

/**
 * Soft-refreshes shared notifications by calling the handleOnCheck callback.
 * @function
 */
function softRefreshSharedNotification() {
    /* Try to soft-refresh shared notifications */
    try {
        const tickShared = mods.getNotification().handleOnCheck;
        // loggerNotif("Check Shared triggered", "doWorker:updated=true", "getNotification().checkSharedNotification", tickShared);
        mods.getNotification().checkSharedNotification(tickShared);
    } catch (error) {
        console.error("[CDE] doWorker:checkSharedNotification:", error);
    }
}

/**
 * Returns a function that executes the provided patch callback if the ETA display setting is enabled and the user page is valid.
 * @param {Function} onPatch - The callback to execute when patching, receives userPage and additional arguments.
 * @returns {Function} A function to be used as a patch handler.
 */
function patcher(onPatch=(userPage, isCombat, activeAction, ...args)=>{}) {
    return (...args) => {
        if (!isCfg(Stg().ETA_DISPLAY)) return;
        const userPage = _game().openPage;
        const isCombat = _game()?.combat?.isActive ?? false;
        const activeAction = _game().activeAction;
        if (userPage 
            && userPage.localID
            && userPage.containerID) {
            onPatch(userPage, isCombat, activeAction, ...args);
        } else if (mods.getSettings().isDebug()) console.log("[CDE] doWorker:Unable to access the active page", userPage);
    }
}

/**
 * Sets up hooks to refresh UI panels after certain in-game actions (combat, crafting, thieving).
 * @param {*} ctx - The context object used to patch game methods.
 */
export function worker(ctx) {
    /** On any game tick */
    
    runtime().patch(ctx, _GameClass(), 'tick').after(patcher((userPage, isCombat, activeAction, ...args) => {
        if (!isCfg(Stg().ETA_SKILLS)) return;
        if (!isCfg(Stg().ETA_USE_GLOBAL_EVENTS)) return;

        const now = Date.now();
        const minTick = mods.getSettings().getCfg(Stg().ETA_GLOBAL_EVENTS_RATE);
        if (_lastTick && now - _lastTick < minTick) return;
        _lastTick = now;
        
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:tick registered", args);
        }

        /* COMBAT */        doWorker(userPage, isCombat, activeAction, getCombatPanel(), "Combat");

        /* Firemaking */    doWorker(userPage, isCombat, activeAction, getFiremakingPanel(), "Firemaking");
        /* Cooking */       doWorker(userPage, isCombat, activeAction, getCookingPanel(), "Cooking");
        /* Smithing */      doWorker(userPage, isCombat, activeAction, getSmithingPanel(), "Smithing");
        /* Fletching */     doWorker(userPage, isCombat, activeAction, getFletchingPanel(), "Fletching");
        /* Crafting */      doWorker(userPage, isCombat, activeAction, getCraftingPanel(), "Crafting");
        /* Runecrafting */  doWorker(userPage, isCombat, activeAction, getRunecraftingPanel(), "Runecrafting");
        /* Herblore */      doWorker(userPage, isCombat, activeAction, getHerblorePanel(), "Herblore");
        /* Summoning */     doWorker(userPage, isCombat, activeAction, getSummoningPanel(), "Summoning");

        /* Woodcutting */   doWorker(userPage, isCombat, activeAction, getWoodcuttingPanel(), "Woodcutting");
        /* Fishing */       doWorker(userPage, isCombat, activeAction, getFishingPanel(), "Fishing");
        /* Mining */        doWorker(userPage, isCombat, activeAction, getMiningPanel(), "Mining");
        /* Agility */       doWorker(userPage, isCombat, activeAction, getAgilityPanel(), "Agility");
        /* Astrology */     doWorker(userPage, isCombat, activeAction, getAstrologyPanel(), "Astrology");

        /* AltMagic */      doWorker(userPage, isCombat, activeAction, getAltMagicPanel(), "AltMagic");
        /* Thieving */      doWorker(userPage, isCombat, activeAction, getThievingPanel(), "Thieving");
        /* Archaeology */   doWorker(userPage, isCombat, activeAction, getArchaeologyPanel(), "Archaeology");
        /* Cartography */   doWorker(userPage, isCombat, activeAction, getCartographyPanel(), "Cartography");
    }))

    /** COMBAT ONLY : Enemy Death */
    runtime().patch(ctx, _CombatManager(), 'onEnemyDeath').after(patcher((userPage, isCombat, activeAction, ...args) => {
        if (isCfg(Stg().ETA_USE_GLOBAL_EVENTS)) return;
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:Enemy death rised:", args);
        }
        if (!isCfg(Stg().ETA_COMBAT)) return;
        /* COMBAT */        doWorker(userPage, isCombat, activeAction, getCombatPanel(), "Combat");
    }))

    /** COMBAT ONLY : Combat Stop */
    runtime().patch(ctx, _CombatManager(), 'stop').after(patcher((userPage, isCombat, activeAction, ...args) => {
        _lastTick = Date.now();
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:onStop:", args);
        }
        if (!isCfg(Stg().ETA_COMBAT)) return;
        onStop();
        /* COMBAT */        doWorker(userPage, isCombat, activeAction, getCombatPanel(), "Combat");
    }))

    /** COMBAT ONLY : Player - Damage */
    runtime().patch(ctx, _Player(), 'damage').after(patcher((userPage, isCombat, activeAction, ...args) => {
        if (isCfg(Stg().ETA_USE_GLOBAL_EVENTS)) return;
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:Player damage():", args);
        }
        if (!isCfg(Stg().ETA_COMBAT)) return;
        /* COMBAT */        doWorker(userPage, isCombat, activeAction, getCombatPanel(), "Combat");
    }))

    /** COMBAT ONLY : Enemy - Damage */
    runtime().patch(ctx, _Enemy(), 'damage').after(patcher((userPage, isCombat, activeAction,...args) => {
        if (isCfg(Stg().ETA_USE_GLOBAL_EVENTS)) return;
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:Enemy damage():", args);
        }
        if (!isCfg(Stg().ETA_COMBAT)) return;
        /* COMBAT */        doWorker(userPage, isCombat, activeAction, getCombatPanel(), "Combat");
    }))

    /** Crafting - action */
    runtime().patch(ctx, _CraftingSkill(), 'action').after(patcher((userPage, isCombat, activeAction, ...args) => {
        if (isCfg(Stg().ETA_USE_GLOBAL_EVENTS)) return;
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:Craft action finished:", args);
        }
        if (!isCfg(Stg().ETA_SKILLS)) return;
        /* Firemaking */    doWorker(userPage, isCombat, activeAction, getFiremakingPanel(), "Firemaking");
        /* Cooking */       doWorker(userPage, isCombat, activeAction, getCookingPanel(), "Cooking");
        /* Smithing */      doWorker(userPage, isCombat, activeAction, getSmithingPanel(), "Smithing");
        /* Fletching */     doWorker(userPage, isCombat, activeAction, getFletchingPanel(), "Fletching");
        /* Crafting */      doWorker(userPage, isCombat, activeAction, getCraftingPanel(), "Crafting");
        /* Runecrafting */  doWorker(userPage, isCombat, activeAction, getRunecraftingPanel(), "Runecrafting");
        /* Herblore */      doWorker(userPage, isCombat, activeAction, getHerblorePanel(), "Herblore");
        /* Summoning */     doWorker(userPage, isCombat, activeAction, getSummoningPanel(), "Summoning");
    }))

    /** Crafting - stop */
    runtime().patch(ctx, _CraftingSkill(), 'stop').after(patcher((userPage, isCombat, activeAction, ...args) => {
        _lastTick = Date.now();
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:Craft action stopped:", args);
        }
        if (!isCfg(Stg().ETA_SKILLS)) return;
        onStop();
        /* Firemaking */    doWorker(userPage, isCombat, activeAction, getFiremakingPanel(), "Firemaking");
        /* Cooking */       doWorker(userPage, isCombat, activeAction, getCookingPanel(), "Cooking");
        /* Smithing */      doWorker(userPage, isCombat, activeAction, getSmithingPanel(), "Smithing");
        /* Fletching */     doWorker(userPage, isCombat, activeAction, getFletchingPanel(), "Fletching");
        /* Crafting */      doWorker(userPage, isCombat, activeAction, getCraftingPanel(), "Crafting");
        /* Runecrafting */  doWorker(userPage, isCombat, activeAction, getRunecraftingPanel(), "Runecrafting");
        /* Herblore */      doWorker(userPage, isCombat, activeAction, getHerblorePanel(), "Herblore");
        /* Summoning */     doWorker(userPage, isCombat, activeAction, getSummoningPanel(), "Summoning");
    }))

    /** Gathering - action */
    runtime().patch(ctx, _GatheringSkill(), 'action').after(patcher((userPage, isCombat, activeAction,...args) => {
        if (isCfg(Stg().ETA_USE_GLOBAL_EVENTS)) return;
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:Gathering action finished:", args);
        }
        if (!isCfg(Stg().ETA_SKILLS)) return;
        /* Woodcutting */   doWorker(userPage, isCombat, activeAction, getWoodcuttingPanel(), "Woodcutting");
        /* Fishing */       doWorker(userPage, isCombat, activeAction, getFishingPanel(), "Fishing");
        /* Mining */        doWorker(userPage, isCombat, activeAction, getMiningPanel(), "Mining");
        /* Agility */       doWorker(userPage, isCombat, activeAction, getAgilityPanel(), "Agility");
        /* Astrology */     doWorker(userPage, isCombat, activeAction, getAstrologyPanel(), "Astrology");
    }));

    /** Gathering - stop */
    runtime().patch(ctx, _GatheringSkill(), 'stop').after(patcher((userPage, isCombat, activeAction,...args) => {
        _lastTick = Date.now();
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:Gathering action stopped:", args);
        }
        if (!isCfg(Stg().ETA_SKILLS)) return;
        onStop();
        /* Woodcutting */   doWorker(userPage, isCombat, activeAction, getWoodcuttingPanel(), "Woodcutting");
        /* Fishing */       doWorker(userPage, isCombat, activeAction, getFishingPanel(), "Fishing");
        /* Mining */        doWorker(userPage, isCombat, activeAction, getMiningPanel(), "Mining");
        /* Agility */       doWorker(userPage, isCombat, activeAction, getAgilityPanel(), "Agility");
        /* Astrology */     doWorker(userPage, isCombat, activeAction, getAstrologyPanel(), "Astrology");
    }));

    runtime().patch(ctx, _AltMagic(), 'action').after(patcher((userPage, isCombat, activeAction,...args) => {
        if (isCfg(Stg().ETA_USE_GLOBAL_EVENTS)) return;
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:AltMagic action finished:", args);
        }
        if (!isCfg(Stg().ETA_SKILLS)) return;
        /* AltMagic */      doWorker(userPage, isCombat, activeAction, getAltMagicPanel(), "AltMagic");
    }));
    runtime().patch(ctx, _AltMagic(), 'stop').after(patcher((userPage, isCombat, activeAction,...args) => {
        _lastTick = Date.now();
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:AltMagic action stopped:", args);
        }
        if (!isCfg(Stg().ETA_SKILLS)) return;
        onStop();
        /* AltMagic */      doWorker(userPage, isCombat, activeAction, getAltMagicPanel(), "AltMagic");
    }));

    runtime().patch(ctx, _Thieving(), 'action').after(patcher((userPage, isCombat, activeAction,...args) => {
        if (isCfg(Stg().ETA_USE_GLOBAL_EVENTS)) return;
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:Thieving action finished:", args);
        }
        if (!isCfg(Stg().ETA_SKILLS)) return;
        /* Thieving */      doWorker(userPage, isCombat, activeAction, getThievingPanel(), "Thieving");
    }));
    runtime().patch(ctx, _Thieving(), 'stop').after(patcher((userPage, isCombat, activeAction,...args) => {
        _lastTick = Date.now();
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:Thieving action stopped:", args);
        }
        if (!isCfg(Stg().ETA_SKILLS)) return;
        onStop();
        /* Thieving */      doWorker(userPage, isCombat, activeAction, getThievingPanel(), "Thieving");
    }));

    runtime().patch(ctx, _Archaeology(), 'action').after(patcher((userPage, isCombat, activeAction,...args) => {
        if (isCfg(Stg().ETA_USE_GLOBAL_EVENTS)) return;
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:Archaeology action finished:", args);
        }
        if (!isCfg(Stg().ETA_SKILLS)) return;
        /* Archaeology */   doWorker(userPage, isCombat, activeAction, getArchaeologyPanel(), "Archaeology");
    }));
    runtime().patch(ctx, _Archaeology(), 'stop').after(patcher((userPage, isCombat, activeAction,...args) => {
        _lastTick = Date.now();
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:Archaeology action stopped:", args);
        }
        if (!isCfg(Stg().ETA_SKILLS)) return;
        onStop();
        /* Archaeology */   doWorker(userPage, isCombat, activeAction, getArchaeologyPanel(), "Archaeology");
    }));

    runtime().patch(ctx, _Cartography(), 'action').after(patcher((userPage, isCombat, activeAction,...args) => {
        if (isCfg(Stg().ETA_USE_GLOBAL_EVENTS)) return;
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:Cartography action finished:", args);
        }
        if (!isCfg(Stg().ETA_SKILLS)) return;
        /* Cartography */   doWorker(userPage, isCombat, activeAction, getCartographyPanel(), "Cartography");
    }));
    runtime().patch(ctx, _Cartography(), 'stop').after(patcher((userPage, isCombat, activeAction,...args) => {
        _lastTick = Date.now();
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] doWorker:Cartography action stopped:", args);
        }
        if (!isCfg(Stg().ETA_SKILLS)) return;
        onStop();
        /* Cartography */   doWorker(userPage, isCombat, activeAction, getCartographyPanel(), "Cartography");
    }));

}

/**
 * Resets the current monster data and activity data in cloud storage, and clears the in-game notification.
 */
function onStop() {
    if (mods.getSettings().isDebug()) console.log("[CDE] doWorker:onStop called");
    mods.getCollector().clearMutable();
    mods.getCloudStorage().removeCurrentMonsterData();
    mods.getCloudStorage().removeCurrentActivityData();
    
    // loggerNotif("Stop", "doWorker:onStop", "getNotification().clearNotify");
    mods.getNotification().clearNotify(true);
}

/**
 * Generates the HTML ID for the ETA panel header for a given identifier.
 * @param {*} identifier - Unique identifier for the panel.
 * @returns {string} The header element ID.
 */
/**
 * Returns the controls panel HTML for ETA.
 * @returns {string} The controls panel HTML.
 */
const onControlsPanel = () => {
    const pngVisible    = mods.getAssetManager().getAssetHtml(mods.getAssetManager()._png_visible_id);
    const pngHidden     = mods.getAssetManager().getAssetHtml(mods.getAssetManager()._png_hidden_id);
    const pngArrowLeft  = mods.getAssetManager().getAssetHtml(mods.getAssetManager()._png_arrowLeft_id);
    const pngReduce     = mods.getAssetManager().getAssetHtml(mods.getAssetManager()._png_reduce_id);
    const pngArrowRight = mods.getAssetManager().getAssetHtml(mods.getAssetManager()._png_arrowRight_id);
    
    const currVisibility = mods.getCloudStorage().isEtaVisible();
    const pngVisibility = currVisibility ? pngVisible : pngHidden;

    /* Register controls */
    let controls = ``;
    controls += `<span id="cde-btn-eta-extra" class="btn-info m-1 cde-eta-btn" title="Extra">${pngVisibility}</span>`;
    controls += `<span class="cde-eta-spacer"></span>`;
    controls += `<span id="cde-btn-eta-displayLeft" class="btn-info m-1 cde-eta-btn" title="Move ETA left">${pngArrowLeft}</span>`;
    controls += `<span id="cde-btn-eta-displaySmall" class="btn-info m-1 cde-eta-btn" title="Toggle ETA size">${pngReduce}</span>`;
    controls += `<span id="cde-btn-eta-displayRight" class="btn-info m-1 cde-eta-btn" title="Move ETA right">${pngArrowRight}</span>`;
    
    /* Register controls panel */
    return `<div id="cde-controls-panel" class="cde-eta-controls">${controls}</div>`;
};

/**
 * Creates or retrieves a MutationObserver reference object for a given target page and identifier.
 * The observer monitors changes to the DOM and injects a styled header block with a summary
 * if it does not already exist in the target container.
 *
 * @param {string} targetPage - The CSS selector for the target page container.
 * @param {string} identifier - A unique identifier used to generate element IDs.
 * @returns {{observer: MutationObserver, identifier: string}} The observer reference object.
 */
function pageContainer(targetPage, identifier, currPanel) {
    if (!mods) {
        throw new Error("Modules not initialized. Call init(modules) before using pageContainer.");
    }
    if (pageObservers && pageObservers.has(targetPage)) {
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] matching existing panel for targetPage:", targetPage);
        }
        return pageObservers.get(targetPage);
    }

    const mutationCompute = {};
    mutationCompute.container = null;
    mutationCompute.corePanel = null;

    const observer = new MutationObserver(() => {
        const rendered = renderer().injectPanel({
            documentRef: document,
            targetPage,
            identifier,
            currPanel,
            chartPanel,
            isChartEnabled: isCfg(Stg().ETA_CHART),
            controlsPosition: mods.getCloudStorage().getCurrentETAPostion() ?? "center",
            onControlsPanel,
            onPanelClick: setupClickListener,
        });
        if (!rendered) return;

        mutationCompute.container = rendered.container;
        mutationCompute.corePanel = rendered.corePanel;
    });

    const reference = {
        observer: observer,
        identifier: identifier,
        targetPage: targetPage,
        mutation: mutationCompute
    }

    pageObservers.set(targetPage, reference);
    if (mods.getSettings().isDebug()) {
        console.log("[CDE] New observer registered", reference);
    }
    return reference;
}

function setupClickListener(event, currPanel, contentPanel) {
    // @ts-ignore
    if (event && event.target && event.target.id) {
        /* Collect cloud settings */
        // @ts-ignore
        const id = event?.target?.id;
        const currState = mods.getCloudStorage().getCurrentETAPostion() ?? "center";
        
        const sizeCursor = currPanel.getIdentity();
        const etaSize = mods.getCloudStorage().getCurrentETASize(sizeCursor);

        /* Setup position */
        if (id === "cde-btn-eta-displayLeft") {
            if (currState === "center") mods.getCloudStorage().setCurrentETAPostion("left");
            if (currState === "right") mods.getCloudStorage().setCurrentETAPostion("center");
        } else if (id === "cde-btn-eta-displayRight") {
            if (currState === "center") mods.getCloudStorage().setCurrentETAPostion("right");
            if (currState === "left") mods.getCloudStorage().setCurrentETAPostion("center");
        }

        /* Update Position */
        const newCurrState = mods.getCloudStorage().getCurrentETAPostion() ?? "center";
        renderer().displayEtaAt(contentPanel, newCurrState);
        if (mods.getSettings().isDebug()) {
            console.log("[CDE] Updated ETA position:", {currState, newCurrState});
        }

        /* Setup size */
        if (id === "cde-btn-eta-displaySmall") {
            if (etaSize === "large") mods.getCloudStorage().setCurrentETASize(sizeCursor, "small");
            if (etaSize === "small") mods.getCloudStorage().setCurrentETASize(sizeCursor, "large");
            currPanel.onRefresh(etaSize);
        }

        /* Notification */
        // loggerNotif("Click", "pageContainer", "getNotification().onSubmit_fromClick", id);
        if (mods.getNotification().onSubmit_fromClick(id)) {
            /* Soft-refresh shared notification */
            softRefreshSharedNotification();
            /* Refresh current panel */
            currPanel.onRefresh(etaSize);
        }

        /* Show / Hide subWrapper */
        if (id === "cde-btn-eta-extra") {
            // Toggle visibility
            const newVisibility = !mods.getCloudStorage().isEtaVisible();
            mods.getCloudStorage().setEtaVisibility(newVisibility);

            // Dynamic show or hide wrapper panel
            const subWrapper = contentPanel.querySelector("#cde-subwrapper");
            if (subWrapper && subWrapper instanceof HTMLElement)
                subWrapper.style.display = newVisibility ? "" : "none";
            else {
                if (mods.getSettings().isDebug())
                    console.log("[CDE] Can't find subWrapper:", subWrapper, contentPanel);
            }

            // Change asset for button
            const currPngId = newVisibility ? 
                mods.getAssetManager()._png_visible_id : 
                mods.getAssetManager()._png_hidden_id;
            mods.getAssetManager().changeAsset(contentPanel, "#cde-btn-eta-extra", currPngId);
        }
    }
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
        const reference = pageContainer(pageId, identifier, panel);
        if (reference != null) {
            references.push(reference);
            if (mods.getSettings().isDebug()) {
                console.log("[CDE] Register new Observer, identifier:" + identifier + " pageId:" + pageId, reference);
            }
        }
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
                
        /* Combat */ registerObserver(references, getCombatPanel(), '#combat-container', 'combat');
        /* Woodcutting */ registerObserver(references, getWoodcuttingPanel(), '#woodcutting-container', 'woodcutting');
        /* Fishing */ registerObserver(references, getFishingPanel(), '#fishing-container', 'fishing');
        /* Firemaking */ registerObserver(references, getFiremakingPanel(), '#firemaking-container', 'firemaking');
        /* Cooking */ registerObserver(references, getCookingPanel(), '#cooking-container', 'cooking');
        /* Mining */ registerObserver(references, getMiningPanel(), '#mining-container', 'mining');
        /* Smithing */ registerObserver(references, getSmithingPanel(), '#smithing-container', 'smithing');
        /* Thieving */ registerObserver(references, getThievingPanel(), '#thieving-container', 'thieving');
        /* Fletching */ registerObserver(references, getFletchingPanel(), '#fletching-container', 'fletching');
        /* Crafting */ registerObserver(references, getCraftingPanel(), '#crafting-container', 'crafting');
        /* Runecraft */ registerObserver(references, getRunecraftingPanel(), '#runecrafting-container', 'runecraft');
        /* Herblore */ registerObserver(references, getHerblorePanel(), '#herblore-container', 'herblore');
        /* Agility */ registerObserver(references, getAgilityPanel(), '#agility-container', 'agility');
        /* Summoning */ registerObserver(references, getSummoningPanel(), '#summoning-container', 'summoning');
        /* Astrology */ registerObserver(references, getAstrologyPanel(), '#astrology-container', 'astrology');
        /* Magic */ registerObserver(references, getAltMagicPanel(), '#magic-container', 'magic');
        /* Cartography */ registerObserver(references, getCartographyPanel(), '#cartography-container', 'cartography');
        /* Archaeology */ registerObserver(references, getArchaeologyPanel(), '#archaeology-container', 'archaeology');

        if (mods.getSettings().isDebug()) {
            console.log("[CDE] Observers initialized", references);
        }
        if (references && references.length > 0 && connect) {
            references.forEach((reference) => {
                if (reference && reference.observer) {
                    const targetObserver = document.body;
                    // const targetObserver = reference.targetPage
                    //     ? document.querySelector(reference.targetPage)
                    //     : document.body;
                    if (targetObserver) {
                        reference.observer.observe(targetObserver, { childList: true, subtree: true });
                    } else if (mods.getSettings().isDebug()) {
                        console.log("[CDE] Could not find container for observer", reference.targetPage);
                    }
                }
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
            renderer().removeInjectedPanel(document, reference.identifier);
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
