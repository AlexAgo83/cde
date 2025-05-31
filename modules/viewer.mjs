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
  subModules.push(exportView = await ctx.loadModule("views/exportView.mjs"));
  subModules.push(changelogView = await ctx.loadModule("views/changelogView.mjs"));
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

/**
 * Copies the given string to the clipboard and optionally shows a success popup.
 * @param {string} contentString - The text content to copy to the clipboard.
 * @param {boolean} [withPopupSuccess=true] - Whether to show a success popup after copying.
 * @returns {Promise<void>} Resolves when the copy is complete.
 */
export async function doCopyClipboard(contentString, withPopupSuccess=true) {
    try {
        await navigator.clipboard.writeText(contentString);
        if (withPopupSuccess)
          popupSuccess('Copied to clipboard!');
    } catch (err) {
        console.error("Clipboard copy failed:", err);
        popupError('Oops...', 'Could not copy to clipboard.');
    }
}

/**
 * Triggers a download of the given content as a JSON file, using the provided identifier and timestamp.
 * @param {string} identifier - A string to include in the filename (e.g., character name or export type).
 * @param {string} contentString - The content to save as a file (usually JSON).
 * @param {string|null} [timestampStr=null] - Optional timestamp string for the filename. If not provided, the current date/time is used.
 * @returns {Promise<void>} Resolves when the file download is triggered.
 */
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

/**
 * Uploads the given content to Hastebin, copies the resulting link to the clipboard, and shows a popup with the link.
 * @param {string} contentString - The content to upload to Hastebin.
 * @returns {Promise<void>} Resolves when the upload and copy are complete.
 */
export async function doShareHastebin(contentString) {
    try {
        const hastebinLink = await mods.getUtils().uploadToHastebin(contentString);
        doCopyClipboard(hastebinLink, false);

        mods.getViewer().popupSuccess('Hastebin link copied!', `URL:<br><a href="${hastebinLink}" target="_blank">${hastebinLink}</a>`);
        // window.open(hastebinLink, "_blank");
    } catch (err) {
        console.error("Failed to upload to Hastebin:", err);
        mods.getViewer().popupError('Upload failed', 'Could not upload to Hastebin. Please try again later.')
    }
}