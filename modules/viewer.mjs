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
 * 
 */
export async function loadSubModule(ctx) {
  exportView = await ctx.loadModule("modules/views/exportView.mjs"); subModules.push(exportView);
  changelogView = await ctx.loadModule("modules/views/changelogView.mjs"); subModules.push(changelogView);
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

export function getViews() {
  return subModules;
}

/**
 * 
 * @param {*} modules 
 */
export function initSubModule(modules) {
  getViews().forEach((m) => {
    m.init(modules);
  });
}

/**
 * 
 */
export function load(ctx) {
  getViews().forEach((m) => {
    m.load(ctx);
  });
}

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
    popup.toast = true,
    popup.position = 'top-end',
    popup.showConfirmButton = false,
    popup.timer = 1200
  }
  _Swal().fire(popup);
}

export function popupInfo(titleStr, msgStr) {
  _Swal().fire({
      icon: 'info',
      title: titleStr,
      text: msgStr
  });
}

export function popupError(titleStr, msgStr) {
  _Swal().fire({
      icon: 'error',
      title: titleStr,
      text: msgStr
  });
}