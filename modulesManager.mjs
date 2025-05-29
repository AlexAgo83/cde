// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// modules.mjs


let mLZString = null;
let mSettings = null;
let mUtils = null;
let mLocalStorage = null;
let mCloudStorage = null;
let mDisplayStats = null;
let mCollector = null;

export function getSettings() {
    return mSettings;
}

export function getUtils() {
    return mUtils;
}

export function getLocalStorage() {
    return mLocalStorage;
}

export function getCloudStorage() {
    return mCloudStorage;
}

export function getDisplayStats() {
    return mDisplayStats;
}

export function getCollector() {
    return mCollector;
}

export function getLZString() {
    return mLZString;
}

export async function onModuleLoad(ctx) {
    // Load Libs :
    mLZString = await ctx.loadModule("libs/lz-string.js");
    if (mLZString && typeof mLZString.default === 'object') {
        mLZString = mLZString.default;
    }
    
    // Load Modules :
    mSettings = await ctx.loadModule("modules/settings.mjs");
    mUtils = await ctx.loadModule("modules/utils.mjs");
    mLocalStorage = await ctx.loadModule("modules/localStorage.mjs");
    mCloudStorage = await ctx.loadModule("modules/cloudStorage.mjs");
    mDisplayStats = await ctx.loadModule("modules/displayStats.mjs");
    mCollector = await ctx.loadModule("modules/collector.mjs");
}

export async function onDataLoad(settings, characterStorage, onSettingsChange) {
    /// Initialize settings module
    mSettings.init(this, settings);
    mSettings.setOnSettingsChange(onSettingsChange);
    mSettings.createSettings();
    if (mSettings.isDebug()) {
        console.log("[CDE] Warning: debug mode allowed");
    }
    
    // Core modules initialization
    mUtils.init(this);
    mLocalStorage.init(this);
    mCloudStorage.init(this, characterStorage);

    // Game data modules initialization
    mDisplayStats.init(this);
    mCollector.init(this);
}