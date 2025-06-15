// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// notification.mjs

let mods = null;
let _internalTimer = null;
let _builder = null;
let _notify = null;

const registeredNotifications = new Map();

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
 * Retrieves the name of the current character from the game.
 * @returns {string} The character's name.
 */
function getCharName() {
    return _game().characterName;
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
 * Registers a new notification to be executed after a specified delay.
 * If a notification is already pending, it cancels the previous one and schedules the new one.
 * @param {Function} newNotification - The function to execute for the new notification.
 * @param {number} [when=0] - The delay in milliseconds after which the notification should be executed.
 */
function registerNotify(newNotification, when=0) {
    /* If a notification is already pending, remove it */
    if (_internalTimer) clearNotify();
    _notify = newNotification;
    /* Schedule the notification */
    _internalTimer = setTimeout(() => {
        if (_notify) {
            /* Display the notification */
            const notif = _notify();
            if (mods.getSettings().isDebug()) console.log("[CDE] Notification:notify", notif);
            /* Clean up */
            clearNotify();
        }
    }, when);
    if (mods.getSettings().isDebug()) console.log("[CDE] Notification:registerNotify");
}

/**
 * Creates a new notification to be displayed.
 * @param {string} notifLabel - The notification title.
 * @param {string} notifDescription - The notification description.
 * @param {string} [media=URL_MELVORIDLE_ICON] - The notification icon URL.
 * @returns {Function} A function that can be executed to display the notification.
 */
function newNotificationCb(notifLabel, notifDescription, media=URL_MELVORIDLE_ICON) {
    return () => {
        if (mods.getSettings().isDebug()) console.log("[CDE] Notification:newNotificationCb:execute", notifLabel, notifDescription, media);
        return new Notification(notifLabel, {
            body: notifDescription,
            icon: media
        });
    }
}

/**
 * Creates and registers a notification to be displayed when the given crafting action is complete.
 * The notification has a title of `"${dataObject.etaName}" ETA Reached!` and a description of `Your "${dataObject.etaName}" action is complete.`,
 * and is registered to be displayed after a delay of `dataObject.timeInMs` milliseconds.
 * @param {object} dataObject - An object containing data for the notification.
 * @param {string} dataObject.etaName - The name of the crafting action.
 * @param {string} dataObject.media - The media associated with the notification.
 * @param {number} dataObject.timeInMs - The delay in milliseconds for notification display.
 * @param {boolean} [withPoupup=true] - Whether to show a popup notification or not.
 */
let onNotifyAction = (dataObject, withPoupup=true) => {
    if (dataObject === undefined || dataObject === null || dataObject.etaName === undefined) {
        if (mods.getSettings().isDebug()) console.log("[CDE] Notification:data object invalide", dataObject);
        return;
    }
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            if (mods.getSettings().isDebug()) console.log("[CDE] Notification:permission granted");
            /* Load & save current builder */
            const newBuilder = initBuilder(dataObject);
            loadBuilder(newBuilder, withPoupup);
            saveBuilder();
        } else {
            if (mods.getSettings().isDebug()) console.log("[CDE] Notification:permission not granted");
        }
    });
    if (mods.getSettings().isDebug()) console.log("[CDE] Notification:onClickCallback:", dataObject);
}
/**
 * Surcharge the default onClick callback function with a custom callback.
 * @param {*} callback - The custom callback function.
 */
export function surchargeOnNotify(callback) {
    onNotifyAction = callback;
}

/**
 * Loads a notification builder and schedules the notification for display.
 * Optionally displays a success popup indicating the timer has been set.
 * @param {object} builder - The notification builder object containing properties for the notification.
 * @param {string} builder.label - The notification title.
 * @param {string} builder.desc - The notification description.
 * @param {string} builder.media - The notification icon URL.
 * @param {number} builder.requestAt - The time in milliseconds when the notification was requested.
 * @param {number} builder.timeInMs - The delay in milliseconds for notification display.
 * @param {boolean} [withPoupup=false] - Whether to display a success popup after scheduling the notification.
 * @returns {object} The notification builder object.
 */
function loadBuilder(builder, withPoupup=false) {
    _builder = builder;
    const notif = newNotificationCb(builder.label, builder.desc, builder.media);
    registerNotify(notif, builder.timeInMs);
    if (withPoupup) {
        const etaStr = new Date(builder.requestAt + builder.timeInMs).toLocaleString();
        mods.getViewer().popupSuccess('Timer set to: ' + etaStr);
    }
    return builder;
}

/**
 * Saves the current notification builder to cloud storage.
 * @private
 */
function saveBuilder() {
    mods.getCloudStorage().setCurrentNotification(_builder);
}

/**
 * Builds a notification object from the given dataObject.
 * @param {object} dataObject - An object containing data for the notification.
 * @param {string} dataObject.etaName - The name of the crafting action.
 * @param {string} dataObject.media - The media associated with the notification.
 * @param {number} dataObject.timeInMs - The delay in milliseconds for notification display.
 * @returns {object} An object with the notification properties (label, desc, media, etaStr).
 */
function initBuilder(dataObject) {
    let timeMs = dataObject.timeInMs;

    if (timeMs <= 15000) timeMs -= 5000;     /* Adjust short time */
    else if (timeMs <= 60000) timeMs -= 10000;    /* Adjust mid time */
    else timeMs -= 15000;    /* Adjust long time */

    const now = Date.now();
    const notifBuilder = {
        timeInMs: timeMs,
        label: `${getCharName()} complete "${dataObject.etaName}" action.`,
        desc: `Your "${dataObject.etaName}" action is nearly complete.`,
        media: dataObject.media ?? URL_MELVORIDLE_ICON,
        requestAt: now
    };
    if (mods.getSettings().isDebug()) console.log("[CDE] Notification:initBuilder:", notifBuilder);
    return notifBuilder;
}

/**
 * Cancels any pending notifications.
 * If a notification was previously registered using registerNotify, this method
 * will prevent it from being shown.
 */
export function clearNotify() {
    let lChange = false;
    if (_internalTimer) {
        clearTimeout(_internalTimer);
        _internalTimer = null;
        lChange = true;
    }
    if (_notify || _builder) {
        _notify = null;
        _builder = null;
        saveBuilder();
        lChange = true;
    }
    if (lChange && mods.getSettings().isDebug()) console.log("[CDE] Notification:clearNotify");
}

/**
 * Creates an HTML structure that can be used to create a notification button.
 * The button is a simple clickable div with a clock icon.
 * @param {string} buttonId - The id to assign to the button element.
 * @returns {string} The HTML structure for the button.
 */
export function createButton(buttonId) {
    return `<span class="btn-info m-1 cde-eta-btn clickable" title="New ETA Notification" id="${buttonId}">⏰</span>`;
}

/**
 * Registers a notification button with an associated onClick event handler.
 * The handler is created using the provided dataObject and is stored in the
 * registeredNotifications map with the specified buttonId as the key.
 *
 * @param {string} buttonId - The unique identifier for the notification button.
 * @param {object} dataObject - An object containing data for the notification.
 * @param {string} dataObject.etaName - The name of the crafting action.
 * @param {number} dataObject.timeInMs - The delay in milliseconds for notification display.
 * @param {boolean} dataObject.autoNotify - Whether to automatically notify when the action is nearly complete.
 */
export function registerButton(buttonId, dataObject, customClickCallback=null) {
    registeredNotifications.set(buttonId, {
        data: dataObject, 
        event: customClickCallback ?? onNotifyAction
    });
    return registeredNotifications.get(buttonId);
}

/**
 * Handles the click event for a notification button.
 * If the buttonId is found in the registeredNotifications map, the associated onClick event handler is called.
 * @param {string} buttonId - The unique identifier for the notification button.
 * @param {object} dataObject - An object containing data for the notification.
 */
export function onClick(buttonId, dataObject=null) {
    if (buttonId && registeredNotifications.has(buttonId)) {
        const object = registeredNotifications.get(buttonId);
        if (object) {
            /* Surcharge the data object */
            const data = dataObject ? dataObject : object.data;
            const callback = object.event;
            if (data && callback) {
                callback(data);
            }
        }
    }
}

/**
 * Automatically triggers all registered notifications with an etaName matching the given dataObject.
 * This is called when an action is nearly complete.
 * @param {object} dataObject - An object containing data for the notification.
 * @param {string} dataObject.etaName - The name of the crafting action.
 */
export function onAutoNotify(dataObject) {
    if (dataObject === undefined || dataObject === null || dataObject.etaName === undefined) return;
    if (isCfg(Stg().ETA_NOTIFICATION) === false) return;
    if (isCfg(Stg().ETA_AUTO_NOTIFY) === false) return;
    registeredNotifications.forEach((object, buttonId) => {
        if (object 
            && object.data 
            && object.data.autoNotify 
            && object.data?.etaName === dataObject.etaName) {
            onClick(buttonId, dataObject);
            if (mods.getSettings().isDebug()) console.log("[CDE] Notification:autoNotify", dataObject);
        }
    })
}

/**
 * Loads the saved notification builder from cloud storage and schedules the notification for display.
 * If a notification is already loaded with the same timing, no action is taken.
 * Requests notification permission from the user before proceeding.
 * @param {*} ctx - The context object used for the load operation.
 */
export function load(ctx) {
    const savedBuilder = mods.getCloudStorage().getCurrentNotification();
    
    /* Notification is disabled */
    if (!isCfg(Stg().ETA_NOTIFICATION)) { 
        if (mods.getSettings().isDebug()) console.log("[CDE] Notification:disabled");
        return;
    }
    /* No notification saved to reload */
    if (savedBuilder === null || savedBuilder === undefined) {
        if (mods.getSettings().isDebug()) console.log("[CDE] Notification:no saved builder found");
        return;
    }
    /* All notifications are already loaded */
    if (_builder && _builder.timeInMs === savedBuilder.timeInMs) {
        if (mods.getSettings().isDebug()) console.log("[CDE] Notification:builder already setup", savedBuilder);
        return;
    }
    /* Notification is already expired */
    const now = Date.now();
    const targetTime = savedBuilder.requestAt + savedBuilder.timeInMs;
    const remainingTime = now - targetTime;
    if (remainingTime > 0) {
        if (mods.getSettings().isDebug()) console.log("[CDE] Notification:builder already expired", savedBuilder, remainingTime);
        return;
    } else {
        /* Update saved builder to match new current time */
        savedBuilder.requestAt = now;
        savedBuilder.timeInMs = -remainingTime;
        if (mods.getSettings().isDebug()) console.log("[CDE] Notification:update current builder", savedBuilder, remainingTime);
    }

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            if (mods.getSettings().isDebug()) console.log("[CDE] Notification:permission granted");
            loadBuilder(savedBuilder, false);
            saveBuilder();
        } else {
            if (mods.getSettings().isDebug()) console.log("[CDE] Notification:permission not granted");
        }
    });

    if (mods.getSettings().isDebug()) console.log("[CDE] Notification:loaded", savedBuilder);
}