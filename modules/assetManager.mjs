// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// assetManager.mjs

let mods = null;
const URL_MELVORIDLE_ICON = "https://cdn2-main.melvor.net/assets/media/main/logo_no_text.png";

/* Asset IDs */
export const _png_arrowLeft_id  = "assets/cde-arrow-left.png";
export const _png_arrowRight_id = "assets/cde-arrow-right.png";
export const _png_chart_id      = "assets/cde-chart.png";
export const _png_hidden_id     = "assets/cde-hidden.png";
export const _png_reduce_id     = "assets/cde-reduce.png";
export const _png_scheduled_id  = "assets/cde-scheduled.png";
export const _png_visible_id    = "assets/cde-visible.png";

const registeredIds = {};
const ASSET_IDS = [
    _png_arrowLeft_id,
    _png_arrowRight_id,
    _png_chart_id,
    _png_hidden_id,
    _png_reduce_id,
    _png_scheduled_id,
    _png_visible_id
];

/**
 * Initialize asset manager module.
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

/**
 * Get the value for a settings reference.
 * @param {*} reference - The settings reference to get.
 * @returns {*} The value for the reference, or null if not found.
 */
function getCfg(reference) {
    return mods.getSettings()?.getCfg(reference);
}

/**
 * Calls the load method on all loaded panel submodules, passing the context.
 * @param {*} ctx - The context object to pass to each submodule's load method.
 */
export function load(ctx) {
    ASSET_IDS.forEach((id) => {
        registeredIds[id] = ctx.getResourceUrl(id);
    });
    if (mods?.getSettings().isDebug()) {
        console.log("[CDE] Loaded assets", registeredIds);
    }
}

/**
 * Get the URL for a registered asset.
 * @param {string} id - The registered ID of the asset.
 * @returns {string|null} The URL of the asset, or null if not found.
 */
export function getAssetUrl(id) {
    if (!registeredIds[id]) {
        console.error("[CDE] Invalid asset ID:", id);
        return null;
    }
    return registeredIds[id];
}

/**
 * Generate HTML for a registered asset, with optional additional CSS classes.
 * @param {string} assetId - The registered ID of the asset.
 * @param {string[]} [classExtends=[]] - Optional CSS classes to add to the asset.
 * @returns {string} The HTML for the asset, or an empty string if the asset wasn't registered.
 */
export function getAssetHtml(assetId, classExtends=[]) {
	return `<img class="cde-asset ${classExtends.join(" ")}" src="${
		getAssetUrl(assetId) ?? URL_MELVORIDLE_ICON
	}" />`;
}


/**
 * Replaces the inner HTML of an element with a new asset.
 * 
 * @param {string} objectId - The ID of the target element to update.
 * @param {string} newAssetId - The ID of the new asset to replace the current content.
 */
export function changeAsset (parent, objectId, newAssetId) {
    const assetHtml = mods.getAssetManager().getAssetHtml(newAssetId);
    if (assetHtml != null && assetHtml.length > 0) {
        const elementBtn = parent.querySelector(objectId);
        if (elementBtn) elementBtn.innerHTML = assetHtml;
        else if (mods.getSettings().isDebug()) console.log("[CDE] Can't find subWrapper:", elementBtn);
    }
}