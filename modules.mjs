// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// modules.mjs

let currModVersion = null;
let mLZString = null;
let mSettings = null;
let mSettingsDomain = null;
let mUtils = null;
let mAssetManager = null;
let mBrowserRuntime = null;
let mLocalStorage = null;
let mCloudStorage = null;
let mNotification = null;
let mDisplayStats = null;
let mCollector = null;
let mMelvorRuntime = null;
let mExport = null;
let mExportDomain = null;
let mAppOrchestrator = null;
let mEtaDomain = null;
let mEta = null;
let mViewer = null;
let mViewerActions = null;
let mPanelRenderer = null;
let mPages = null;

export function getModVersion() {
    return currModVersion;
}

export function getSettings() {
    return mSettings;
}

export function getSettingsDomain() {
    return mSettingsDomain;
}

export function getUtils() {
    return mUtils;
}

export function getAssetManager() {
    return mAssetManager;
}

export function getBrowserRuntime() {
    return mBrowserRuntime;
}

export function getLocalStorage() {
    return mLocalStorage;
}

export function getCloudStorage() {
    return mCloudStorage;
}

export function getNotification() {
    return mNotification;
}

export function getDisplayStats() {
    return mDisplayStats;
}

export function getMelvorRuntime() {
    return mMelvorRuntime;
}

export function getCollector() {
    return mCollector;
}

export function getExport() {
    return mExport;
}

export function getExportDomain() {
    return mExportDomain;
}

export function getAppOrchestrator() {
    return mAppOrchestrator;
}

export function getEtaDomain() {
    return mEtaDomain;
}

export function getETA() {
    return mEta;
}

export function getLZString() {
    return mLZString;
}

export function getViewer() {
    return mViewer;
}

export function getViewerActions() {
    return mViewerActions;
}

export function getPanelRenderer() {
    return mPanelRenderer;
}

export function getPages() {
    return mPages;
}

/**
 * Get the settings reference object.
 * @returns {Object} The settings reference object.
 */
function Stg() {
	return getSettings()?.SettingsReference;
}

/**
 * Get the boolean value for a settings reference.
 * @returns {boolean} True if the reference is allowed, false otherwise.
 */
function isCfg(reference) {
	return getSettings()?.isCfg(reference);
}

/**
 * Loads all required libraries and modules for the mod.
 * This should be called once during mod initialization.
 * @param {*} ctx - The context object provided by the mod loader, used to load dependencies.
 */
export async function onModuleLoad(ctx, modVersion) {
    currModVersion = modVersion;

    // Load Libs :
    mLZString = await ctx.loadModule("libs/lz-string.js");
    if (mLZString && typeof mLZString.default === 'object') {
        mLZString = mLZString.default;
    }
    
    // Load Modules :
    mSettings = await ctx.loadModule("modules/settings.mjs");
    mSettingsDomain = await ctx.loadModule("modules/settingsDomain.mjs");
    mUtils = await ctx.loadModule("modules/utils.mjs");
    mAssetManager = await ctx.loadModule("modules/assetManager.mjs");
    mBrowserRuntime = await ctx.loadModule("modules/browserRuntime.mjs");
    mLocalStorage = await ctx.loadModule("modules/localStorage.mjs");
    mCloudStorage = await ctx.loadModule("modules/cloudStorage.mjs");
    mDisplayStats = await ctx.loadModule("modules/displayStats.mjs");
    mNotification = await ctx.loadModule("modules/notification.mjs");
    mMelvorRuntime = await ctx.loadModule("modules/melvorRuntime.mjs");
    mCollector = await ctx.loadModule("modules/collector.mjs");
    mExport = await ctx.loadModule("modules/export.mjs");
    mExportDomain = await ctx.loadModule("modules/exportDomain.mjs");
    mAppOrchestrator = await ctx.loadModule("modules/appOrchestrator.mjs");
    mEtaDomain = await ctx.loadModule("modules/etaDomain.mjs");
    mEta = await ctx.loadModule("modules/eta.mjs");
    mViewer = await ctx.loadModule("modules/viewer.mjs");
    mViewerActions = await ctx.loadModule("modules/viewerActions.mjs");
    mPanelRenderer = await ctx.loadModule("modules/panelRenderer.mjs");
    mPages = await ctx.loadModule("modules/pages.mjs");
    
    // Load subModules :
    await Promise.all([
        mViewer.loadSubModule(ctx),
        mPages.loadSubModule(ctx)
    ]);

    mAppOrchestrator.init?.(this, currModVersion);
}

/**
 * Initializes all modules with the current settings and storage.
 * Should be called after the character and settings are loaded.
 * @param {*} settings - The settings object for the mod.
 * @param {*} characterStorage - The storage object for the current character.
 * @param {*} accountStorage - The storage object for the current account.
 */
export async function onDataLoad(settings, characterStorage, accountStorage) {
    /// Initialize settings module
    mSettings.init(this, settings);
    mSettingsDomain.init?.(this);
    mSettings.createSettings();
    
    // Core modules initialization
    mUtils.init(this);
    mAssetManager.init(this);
    mBrowserRuntime.init?.(this);
    mMelvorRuntime.init?.(this);

    // Storage modules initialization
    mCloudStorage.init(this, characterStorage, accountStorage);
    mLocalStorage.init(this);
    mNotification.init(this);

    // Game data modules initialization
    mDisplayStats.init(this);
    mCollector.init(this);
    mExport.init(this);
    mExportDomain.init?.(this);
    mEtaDomain.init?.(this);
    mEta.init(this);

    // Interfaces
    mViewer.init(this);
    mViewerActions.init(this);
    mPages.init(this);
}

/**
 * Placeholder function for future extension.
 * @param {*} ctx - The context object.
 */
export async function onViewLoad(ctx) {
    // Loading settings...
    mSettings.loadAllSettings();
    if (mSettings.isDebug()) {
        console.log("[CDE] Warning: debug mode allowed");
    }

    // Load assets
    mAssetManager.load(ctx);

    // Load views
    mViewer.load(ctx);
    mPages.load(ctx);

    // Load notification
    mNotification.load(ctx);
}
