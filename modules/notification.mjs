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
 */
const onClickCallback = (dataObject) => {
    if (dataObject === undefined || dataObject === null || dataObject.etaName === undefined) return;
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            if (mods.getSettings().isDebug()) console.log("[CDE] Notification:permission granted");
            /* Load & save current builder */
            const newBuilder = initBuilder(dataObject);
            loadBuilder(newBuilder, true);
            saveBuilder();
        } else {
            if (mods.getSettings().isDebug()) console.log("[CDE] Notification:permission not granted");
        }
    });
    if (mods.getSettings().isDebug()) console.log("[CDE] Notification:onClickCallback:", dataObject);
}

/**
 * Loads a notification builder and schedules the notification for display.
 * Optionally displays a success popup indicating the timer has been set.
 * @param {object} builder - The notification builder object containing properties for the notification.
 * @param {string} builder.label - The notification title.
 * @param {string} builder.desc - The notification description.
 * @param {string} builder.media - The notification icon URL.
 * @param {number} builder.timeInMs - The delay in milliseconds for notification display.
 * @param {string} builder.etaStr - The ETA string to show in the success popup.
 * @param {boolean} [withPoupup=false] - Whether to display a success popup after scheduling the notification.
 * @returns {object} The notification builder object.
 */
function loadBuilder(builder, withPoupup=false) {
    _builder = builder;
    const notif = newNotificationCb(builder.label, builder.desc, builder.media);
    registerNotify(notif, builder.timeInMs);
    if (withPoupup) mods.getViewer().popupSuccess('Timer set to: ' + builder.etaStr);
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
    const notifBuilder = {
        timeInMs: dataObject.timeInMs,
        label: `${getCharName()} complete "${dataObject.etaName}" action.`,
        desc: `Your "${dataObject.etaName}" action is complete.`,
        media: dataObject.media ?? URL_MELVORIDLE_ICON,
        etaStr: new Date(Date.now() + dataObject.timeInMs).toLocaleString()
    };
    return notifBuilder;
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
        _notify = null;
        if (mods.getSettings().isDebug()) console.log("[CDE] Notification:clearNotify");
    }
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
 */
export function registerButton(buttonId, dataObject, customClickCallback=null) {
    registeredNotifications.set(buttonId, {
        data: dataObject, 
        event: customClickCallback ?? onClickCallback
    });
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
 * Loads the saved notification builder from cloud storage and schedules the notification for display.
 * If a notification is already loaded with the same timing, no action is taken.
 * Requests notification permission from the user before proceeding.
 * @param {*} ctx - The context object used for the load operation.
 */
export function load(ctx) {
    const savedBuilder = mods.getCloudStorage().getCurrentNotification();
    
    /* No notification saved to reload */
    if (savedBuilder === null || savedBuilder === undefined) return;
    /* All notifications are already loaded */
    if (_builder && _builder.timeInMs === savedBuilder.timeInMs) return;

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            if (mods.getSettings().isDebug()) console.log("[CDE] Notification:permission granted");
            loadBuilder(savedBuilder, false);
        } else {
            if (mods.getSettings().isDebug()) console.log("[CDE] Notification:permission not granted");
        }
    });
}