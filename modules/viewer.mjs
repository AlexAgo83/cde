// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// viewer.mjs

let mods = null;

let subModules = [];

let exportView = null;
let changelogView = null;

export function getExportView() { return exportView; }
export function getChangelogView() { return changelogView; }

/**
 * Loads views submodules for the viewer.
 * This should be called once during initialization to set up the viewer's submodules.
 * @param {*} ctx - The context object used to load submodules.
 */
export async function loadSubModule(ctx) {
  subModules.push(exportView = await ctx.loadModule("modules/views/exportView.mjs"));
  subModules.push(changelogView = await ctx.loadModule("modules/views/changelogView.mjs"));
}

/**
 * Initialize the viewer module.
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

/**
 * Get the settings reference object.
 * @returns {Object} The settings reference object.
 */
function Stg() {
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
 * Returns the list of loaded viewer submodules (e.g., exportView, changelogView).
 * @returns {Array} An array of loaded submodule instances.
 */
export function getViews() {
  return subModules;
}

/**
 * Initializes all loaded viewer submodules with the provided modules object.
 * @param {*} modules - The modules object containing dependencies.
 */
export function initSubModule(modules) {
  getViews().forEach((m) => {
    m.init(modules);
  });
}

/**
 * Calls the load method on all loaded viewer submodules, passing the context.
 * @param {*} ctx - The context object to pass to each submodule's load method.
 */
export function load(ctx) {
  getViews().forEach((m) => {
    m.load(ctx);
  });
}

/**
 * Displays a success popup using SweetAlert2.
 *
 * @param {string} titleStr - The title text to display in the popup.
 * @param {string|null} [content=null] - Optional HTML content for the popup. If provided, a modal popup is shown with a "Close" button. If not provided, a toast notification is shown.
 */
export function popupSuccess(titleStr, content = null) {
  const popup = {
    icon: 'success',
    title: titleStr
  };
  if (content) {
    popup.html = content;
    popup.showConfirmButton = true;
    popup.confirmButtonText = "Close";
  } else {
    popup.toast = true;
    popup.position = 'top-end';
    popup.showConfirmButton = false;
    popup.timer = 1200;
  }
  _Swal().fire(popup);
}

/**
 * Displays an informational popup using SweetAlert2.
 * @param {string} titleStr - The title text to display in the popup.
 * @param {string} msgStr - The message text to display in the popup.
 */
export function popupInfo(titleStr, msgStr) {
  _Swal().fire({
      icon: 'info',
      title: titleStr,
      text: msgStr
  });
}

/**
 * Displays an error popup using SweetAlert2.
 * @param {string} titleStr - The title text to display in the popup.
 * @param {string} msgStr - The error message text to display in the popup.
 */
export function popupError(titleStr, msgStr) {
  _Swal().fire({
      icon: 'error',
      title: titleStr,
      text: msgStr
  });
}

export async function doShareFile(identifier, contentString, timestampStr = null) {
    const blob = new Blob([contentString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const date = new Date();
    const timestamp = timestampStr == null ? mods.getUtils().parseTimestamp(date) : timestampStr;
    link.download = `melvor-${identifier}-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}