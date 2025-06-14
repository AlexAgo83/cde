// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// notification.mjs

let mods = null;
let _internalTimer = null;
let _registeredNotify = null;

const URL_MELVORIDLE_ICON = "https://cdn2-main.melvor.net/assets/media/main/logo_no_text.png";

/**
 * Initialize notification module.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(modules) {
  mods = modules;
}

// --- MOCK ---
function _game() {
	// @ts-ignore
	return game;
}

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
 * Requests permission to display notifications.
 * @param {Function} onRequest - The function to call if permission is granted.
 * @param {Function} onError - The function to call if permission is not granted.
 */
export function requestPermission(onRequest, onError) {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            if (mods.getSettings().isDebug()) console.log("[CDE] Notification:permission granted");
            onRequest();
        } else {
            if (mods.getSettings().isDebug()) console.log("[CDE] Notification:permission not granted");
            onError();
        }
    });
}


/**
 * Registers a new notification to be executed after a specified delay.
 * If a notification is already pending, it cancels the previous one and schedules the new one.
 * @param {Function} newNotification - The function to execute for the new notification.
 * @param {number} [when=0] - The delay in milliseconds after which the notification should be executed.
 */
export function registerNotify(newNotification, when=0) {
    /* If a notification is already pending, remove it */
    if (_internalTimer) clearNotify();
    _registeredNotify = newNotification;
    /* Schedule the notification */
    _internalTimer = setTimeout(() => {
        if (_registeredNotify) {
            /* Display the notification */
            const notif = _registeredNotify();
            if (mods.getSettings().isDebug()) console.log("[CDE] Notification:notify", notif);
            /* Clean up */
            clearNotify();
        }
    }, when);
    if (mods.getSettings().isDebug()) console.log("[CDE] Notification:registerNotify");
}

/**
 * Cancels any pending notifications.
 * If a notification was previously registered using registerNotify, this method
 * will prevent it from being shown.
 */
export function clearNotify() {
    if (_internalTimer) {
        clearTimeout(_internalTimer);
        _internalTimer = null;
        if (mods.getSettings().isDebug()) console.log("[CDE] Notification:clearNotify");
    }
}

/**
 * Creates a new notification to be displayed.
 * @param {string} notifLabel - The notification title.
 * @param {string} notifDescription - The notification description.
 * @returns {Function} A function that can be executed to display the notification.
 */
export function newNotify(notifLabel, notifDescription) {
    return () => {
        return new Notification(notifLabel, {
            body: notifDescription,
            icon: URL_MELVORIDLE_ICON
        });
    }
}

/**
 * Requests a notification to be displayed when the given crafting action is complete.
 * @param {string} craftName - The name of the crafting action.
 * @param {number} timeInMs - The delay in milliseconds after which the notification should be displayed.
 */
export function notifyEtaAction(craftName, timeInMs) {
    const notif = newNotify(`"${craftName}" ETA Reached!`, `Your "${craftName}" action is complete.`);
    registerNotify(notif, timeInMs);
}