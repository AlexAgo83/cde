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

/**
 * 
 * @param {*} modules 
 */
export function initSubModule(modules) {
  subModules.forEach((m) => {
    m.init(modules);
  });
}

/**
 * 
 */
export function load(ctx) {
  subModules.forEach((m) => {
    m.load(ctx);
  });
}