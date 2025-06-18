// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// notification.mjs

let mods = null;
let _internalTimer = null;
let _builder = null;
let _notify = null;
let _permGranted = null;
let _lastChecked = null;

const registeredNotifications = new Map();

const URL_MELVORIDLE_ICON = "https://cdn2-main.melvor.net/assets/media/main/logo_no_text.png";

/**
 * Initialize notification module.
 * @param {Object} modules - The modules object containing dependencies.
 */
export function init(modules) {
  mods = modules;
}

/**
 * Logs a debug message if the 'isDebug' setting is enabled.
 *
 * The message is prefixed with "[CDE/" + label + "] [Step: " + step + "] (" + from + "->" + to + ")".
 * If arguments are provided, ", args:" is appended to the prefix and the arguments are logged
 * after the prefix.
 *
 * @param {string} label - The label for the debug message.
 * @param {string} step - The step for the debug message.
 * @param {string} from - The starting position of the logged block.
 * @param {string} to - The ending position of the logged block.
 * @param {...*} args - The arguments to log.
 */
export function logger(label, step, from, to, ...args) {
    mods.getUtils().logger(label, step, "notification", from, to, ...args);
}

/**
 * Logs a debug message if the 'isDebug' setting is enabled with a prefix of "[Notif]".
 * The message is prefixed with "[Notif] [Step: " + step + "] (" + from + "->" + to + ")".
 * If arguments are provided, ", args:" is appended to the prefix and the arguments are logged
 * after the prefix.
 * @param {string} step - The step for the debug message.
 * @param {string} from - The starting position of the logged block.
 * @param {string} to - The ending position of the logged block.
 * @param {...*} args - The arguments to log.
 */
export function loggerNotif(step, from, to, ...args) {
    logger("Notif", step, from, to, ...args);
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
    return mods.getUtils().sanitizeCharacterName(_game().characterName);
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
    if (_internalTimer) {
        loggerNotif("New notif", "registerNotify", "Internal timer already found, ask for clear!");
        clearNotify(false);
    }
    _notify = newNotification;

    loggerNotif("New notif", "registerNotify", "Schedule notification!", newNotification, when);
    /* Schedule the notification */
    _internalTimer = setTimeout(() => {
        if (_notify) {
            loggerNotif("Push Notif", "registerNotify", "Time to push notification!", _notify);
            /* Display the notification */
            const notif = _notify();
            /* Clean up */
            clearNotify(true);
        }
    }, when);
    loggerNotif("New notif", "registerNotify", "State of timer & notify:", _notify, _internalTimer);
}

/**
 * Creates a new callback function for a notification.
 * @param {string} notifLabel - The notification title.
 * @param {string} notifDescription - The notification description.
 * @param {string} [media=URL_MELVORIDLE_ICON] - The notification icon URL.
 * @returns {Function} A function that can be executed to display the notification.
 */
function newNotificationCb(notifLabel, notifDescription, media=URL_MELVORIDLE_ICON) {
    return () => {
        loggerNotif("New notif", "newNotificationCb", "Start to init the notification to display!", notifLabel, notifDescription, media);
        if (isRequestPermissionAllowed()) {
            /* Native notification */
            const result = new Notification(
                notifLabel, {
                    body: notifDescription,
                    icon: media
                }
            );
            return result;
        }
        
        /* Ingame notification */
        const popupTitre = notifLabel;
        let popupHtml = `<div class="cde-generic-panel cde-notif-panel">`;
        popupHtml += `<img class="cde-ignotif-media" src="${media}" />`;
        popupHtml += `<span class="cde-ignotif">${notifDescription}</span>`;
        popupHtml += `</div>`;
        return mods.getViewer().popupSuccess(popupTitre, popupHtml);
    }
}

/**
 * Creates and registers a notification to be displayed when the given crafting action is complete.
 * The notification has a title of `"${dataObject.etaName}" ETA Reached!` and a description of `Your "${dataObject.etaName}" action is complete.`,
 * and is registered to be displayed after a delay of `dataObject.timeInMs` milliseconds.
 * @param {object} dataObject - An object containing data for the notification.
 * @param {number} dataObject.autoNotify - Whether to automatically notify when the action is nearly complete.
 * @param {string} dataObject.etaName - The name of the crafting action.
 * @param {string} dataObject.media - The media associated with the notification.
 * @param {number} dataObject.timeInMs - The delay in milliseconds for notification display.
 * @param {boolean} [withPopup=true] - Whether to show a popup notification or not.
 */
let onNotifyAction = (dataObject, withPopup=true) => {
    if (dataObject === undefined || dataObject === null || dataObject.etaName === undefined) {
        loggerNotif("New notif", "onNotifyAction", "Invalide data object... STOP", dataObject);
        return;
    }

    loggerNotif("New notif", "onNotifyAction", "(Call)initBuilder", dataObject);
    const newBuilder = initBuilder(dataObject);
    requestPermission(() => {
        loggerNotif("New notif", "onNotifyAction", "(Call)loadBuilder", newBuilder, withPopup);
        loadBuilder(newBuilder, withPopup);
        loggerNotif("New notif", "onNotifyAction", "(Call)saveBuilder");
        saveBuilder();
    });

    loggerNotif("New notif", "onNotifyAction", "End of process...");
}
/**
 * Surcharge the default onSubmit callback function with a custom callback.
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
    loggerNotif("Loading Builder", "loadBuilder", "(Call)newNotificationCb", builder.label, builder.desc, builder.media);
    const newNotif = newNotificationCb(builder.label, builder.desc, builder.media);
    loggerNotif("Loading Builder", "loadBuilder", "(Call)registerNotify", newNotif, builder.timeInMs);
    registerNotify(newNotif, builder.timeInMs);
    if (withPoupup) {
        const etaStr = mods.getUtils().dateToLocalString(new Date(builder.requestAt + builder.timeInMs));
        mods.getViewer().popupSuccess('Timer set to: ' + etaStr);
    }
    return builder;
}

/**
 * Saves the current notification builder to cloud storage.
 * If the ETA notification sharing setting is enabled, the builder is saved as a pending notification for the current character.
 * If the builder is null, any pending notification for the current character is removed.
 */
function saveBuilder() {
    loggerNotif("Save", "saveBuilder", "(Call)setCurrentNotification", _builder);
    mods.getCloudStorage().setCurrentNotification(_builder);
    if (isCfg(Stg().ETA_SHARED_NOTIFY)) {
        if (_builder) {
            loggerNotif("Save", "saveBuilder", "(Call)updatePendingNotificationForCurrentCharacter", _builder);
            mods.getCloudStorage().updatePendingNotificationForCurrentCharacter(() => _builder);
        } else {
            loggerNotif("Save", "saveBuilder", "(Call)removePlayerPendingNotification");
            mods.getCloudStorage().removePlayerPendingNotification();
        }
    }   
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
    
    loggerNotif("*", "initBuilder", "New builder created:", notifBuilder);
    return notifBuilder;
}


/**
 * Resets the internal timer and clears the current notification (if any).
 * If `withBuilder` is true, also resets the current notification builder.
 * Saves the new state to cloud storage.
 * @param {boolean} [withBuilder=true] - Whether to reset the current notification builder.
 */
export function clearNotify(withBuilder=true) {
    let lChange = false;
    if (_internalTimer) {
        clearTimeout(_internalTimer);
        _internalTimer = null;
        lChange = true;
        loggerNotif("Clear", "clearNotify", "Internal timer reset!");
    }
    if (_notify) {
        _notify = null;
        lChange = true;
        loggerNotif("Clear", "clearNotify", "Notification reset!");
    }
    if (withBuilder && _builder) {
        _builder = null;
        lChange = true;
        loggerNotif("Clear", "clearNotify", "Builder reset!");
    }
    if (lChange) {
        saveBuilder();
        loggerNotif("Clear", "clearNotify", "clear was called with success!");
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
 * Registers a notification button with an associated onSubmit event handler.
 * The handler is stored in the registeredNotifications map with the specified
 * buttonId as the key.
 * @param {string} buttonId - The unique identifier for the notification button.
 * @param {object} actionObject - An object containing data for the notification.
 * @returns {object} The registered notification action object.
 */
export function registerButton(buttonId, actionObject) {
    registeredNotifications.set(buttonId, actionObject);
    return registeredNotifications.get(buttonId);
}

/**
 * Creates a click action object for a notification button.
 * The object contains the buttonId, associated dataObject and a click event handler.
 * If customClickCallback is null or undefined, the default onNotifyAction is used.
 * @param {string} buttonId - The unique identifier for the notification button.
 * @param {object} dataObject - An object containing data for the notification.
 * @param {Function|null} [customEvent=onNotifyAction] - A custom click event handler.
 * @returns {object} The click action object.
 */
export function createClickAction(buttonId, dataObject, customEvent=onNotifyAction) {
    return {
        id: buttonId,
        data: dataObject, 
        event: customEvent ?? onNotifyAction
    };
}

/**
 * Handles the click event for a notification button.
 * If the buttonId is found in the registeredNotifications map, the associated onSubmit event handler is called.
 * @param {string} buttonId - The unique identifier for the notification button.
 * @param {object} dataObject - An object containing data for the notification.
 * @param {boolean} [withPopup=false] - Whether to show the notification popup.
 * @returns {boolean} The result of the onSubmit event handler.
 */
export function onSubmit(buttonId, dataObject=null, withPopup=true) {
    loggerNotif("Click", "onSubmit", "Something trigger onSubmit with buttonId: " + buttonId + "!", dataObject);
    let lResult = false;
    if (buttonId && registeredNotifications.has(buttonId)) {
        const object = registeredNotifications.get(buttonId);
        if (object) {
            /* Surcharge the data object */
            const data = dataObject ? dataObject : object.data;
            /* default: onNotifyAction */
            const callback = object.event;
            if (data && callback) {
                loggerNotif("Click", "onSubmit", "callBack (Id: " + buttonId + " match with button)", data);
                lResult = callback(data, withPopup);
            }
        }
    } else {
        loggerNotif("Click", "onSubmit", "No button found for id: " + buttonId + "!", dataObject);
    }
    return lResult;
}

/**
 * Handles the click event for a notification button.
 * Calls onSubmit with the buttonId, no dataObject and withPopup=true.
 * @param {string} buttonId - The unique identifier for the notification button.
 * @returns {boolean} The result of the onSubmit event handler.
 */
export function onSubmit_fromClick(buttonId) {
    return onSubmit(buttonId, null, true);
}

/**
 * Automatically triggers the notification associated with the given buttonId.
 * This is called when an action is nearly complete and the autoNotify flag is set.
 * @param {string} buttonId - The unique identifier for the notification button.
 * @param {object} dataObject - An object containing data for the notification.
 * @returns {boolean} True if a notification was triggered, false otherwise.
 */
export function onSubmit_fromAutoNotify(buttonId, dataObject) {
    return onSubmit(buttonId, dataObject, false);
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

    requestPermission(() => {
        loadBuilder(savedBuilder, false);
        saveBuilder();
    });

    if (mods.getSettings().isDebug()) console.log("[CDE] Notification:loaded", savedBuilder);
}

/**
 * Returns true if the user has already granted notification permission, false otherwise.
 * @returns {boolean} True if permission is granted, false otherwise.
 */
export function isPermissionGranted() {
    return _permGranted
}

/**
 * Checks if the browser supports the `requestPermission` method for the Notification API.
 * @returns {boolean} True if the method is supported, false otherwise.
 */
export function isRequestPermissionAllowed() {
    return isCfg(Stg().ETA_BROWSER_NOTIFY) && 'Notification' in window && 'requestPermission' in Notification;
}

/**
 * Requests notification permission from the user.
 * If permission is granted, executes the provided onSuccess callback.
 * Logs the permission result if debug mode is enabled.
 * @param {Function} onSuccess - The callback to execute if permission is granted.
 */
export function requestPermission(onSuccess, onFail=() => {}) {
    if (isRequestPermissionAllowed() && !isPermissionGranted()) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                _permGranted = true;
                loggerNotif("*", "requestPermission", "Success!");
                onSuccess();
            } else {
                _permGranted = false;
                loggerNotif("*", "requestPermission", "Failed!");
                onFail();
            }
        });
    } else {
        /* Force onSuccess, permission is already granted or native notification system not allowed */
        onSuccess();
    }
}

/**
 * Default callback for checkSharedNotification.
 * Logs the notification data for each player if debug mode is enabled.
 * @param {string} key - The key for the notification data.
 * @param {Object} builder - The notification builder object.
 */
export const defaultOnCheck = (key, builder) => {
    loggerNotif("Check Shared", "defaultOnCheck", "Default callback for key: " + key, builder);
}

/**
 * Callback for checkSharedNotification.
 * Checks if the notification is in the past, the future, or nearly due.
 * If nearly due, requests permission and displays the notification.
 * Logs the notification data for each player if debug mode is enabled.
 * @param {string} key - The key for the notification data.
 * @param {Object} builder - The notification builder object.
 */
export const handleOnCheck = (key, builder) => {
    loggerNotif("Check Shared", "handleOnCheck", "Starting callback for key: " + key);
    if (builder
        && builder.hasOwnProperty("desc")
        && builder.hasOwnProperty("label")
        && builder.hasOwnProperty("media")
        && builder.hasOwnProperty("requestAt")
        && builder.hasOwnProperty("timeInMs")) {
        const targetTime = builder.requestAt + builder.timeInMs;
        const now = Date.now();
        const remainingTime = targetTime - now;

        if (remainingTime < 0) { /* ... is in the past */
            loggerNotif("Check Shared", "handleOnCheck", "Matching notification to publish, key:" + key, builder, remainingTime);
            const notif = newNotificationCb(builder.label, builder.desc, builder.media);
            requestPermission(() => {
                notif();    
            });
            mods.getCloudStorage().removeOtherPlayerPendingNotification(key);  
        }

    } else {
        loggerNotif("Check Shared", "handleOnCheck", "Wrong builder for key: " + key, builder);
    }
}

/**
 * Checks shared notifications for all players and triggers the provided callback for each.
 * Ensures that notifications are not checked more frequently than once per second.
 * If the shared notification and ETA notification settings are enabled, iterates over
 * all shared notifications and invokes the onCheck callback with the player's key 
 * and builder object.
 * 
 * @param {Function} [onCheck=defaultOnCheck] - The callback function to handle each player's notification.
 *                                              Defaults to the defaultOnCheck function if not provided.
 */
export function checkSharedNotification(onCheck = defaultOnCheck) {
    const time = Date.now();
    if (!_lastChecked) _lastChecked = time;
    if (time - _lastChecked < 1000) return;
    if (!onCheck || typeof onCheck !== "function") return;
    if (isCfg(Stg().ETA_NOTIFICATION)
        && isCfg(Stg().ETA_SHARED_NOTIFY)) {
        loggerNotif("Check Shared", "checkSharedNotification", "Start checking shared notifications");
        const sharedBuilder = mods.getCloudStorage().getOtherPlayerPendingNotifications();
        if (Object.keys(sharedBuilder).length > 0) {
            Object.keys(sharedBuilder).forEach((key) => {
                const playerBuilder = sharedBuilder[key];
                onCheck(key, playerBuilder);
            })
        }
    }
    _lastChecked = time;
}

/**
 * Returns an array of strings representing the notifications to be displayed in the notification panel.
 * Iterates over the player's pending notification and all other player's pending notifications,
 * and formats them into a string that can be displayed in the notification panel.
 * If the ETA notification setting is disabled, returns an empty array.
 * @returns {string[]} An array of strings representing the notifications to be displayed.
 */
export function displayNotification() {
    let result = [];
    if (!isCfg(Stg().ETA_NOTIFICATION)) return result;
    
    const notifs = [];
    const pNotif = mods.getCloudStorage().getPlayerPendingNotification();
    if (pNotif
        && pNotif.requestAt
        && pNotif.timeInMs
        && pNotif.label
    ) {
        notifs.push({
            player: getCharName(),
            eta: new Date(pNotif.requestAt + pNotif.timeInMs),
            media: pNotif.media
        });
    }

    const oNotif = mods.getCloudStorage().getOtherPlayerPendingNotifications();
    Object.keys(oNotif).forEach((key) => {
        const notification = oNotif[key];
        if (notification
            && notification.requestAt
            && notification.timeInMs
            && notification.label
        ) {
            notifs.push({
                player: key,
                eta: new Date(notification.requestAt + notification.timeInMs),
                media: notification.media
            });
        }
    })

    if (notifs && notifs.length > 0) {
        /* Start sort array of notifs */
        let order = "asc";
        let newArraysSorted = notifs.sort((a, b) => {
            return order === "asc" ?
                    a.eta.getTime() - b.eta.getTime() : 
                    b.eta.getTime() - a.eta.getTime();
            return 0;
        });

        /** PRINT SHARED NOTIFICATION */
        notifs.forEach((notif) => {
            const mediaImg = notif.media ? `<img class="skill-media skill-media-short" src="${notif.media}" />` : `<span class="skill-media"></span>`;
            // const etaStr = mods.getUtils().formatDuration(notif.eta, "span-notif-fade");
            const etaStr = notif.eta ? mods.getUtils().dateToLocalString(notif.eta) : "N/A";
            result.push(`<div class="cde-generic-panel cde-notif-panel">
                <span class="skill-label span-notif vph-tiny">⏰</span>
                ${mediaImg}
                <span class="skill-label span-notif vph-tiny">${notif.player}</span>
                <span class="skill-label"> ➜ </span>
                <span class="skill-label span-notif vph-tiny">${etaStr}</span>
            </div>`);
        }) 
    }
    
    return result;
}

/**
 * Creates a new dataObject for a non-combat panel.
 * @param {string} label - The notification title.
 * @param {string} media - The notification icon URL.
 * @param {number} timeInMs - The delay in milliseconds for notification display.
 * @param {boolean} [autoNotify=false] - Whether to automatically notify when the action is nearly complete.
 * @returns {object} The new dataObject.
 */
export function newDataObject(label, media, timeInMs, autoNotify=false) {
    return {
        etaName: label, 
        media: media, 
        timeInMs: timeInMs,
        autoNotify: autoNotify
    };
}