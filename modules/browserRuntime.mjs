// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// modules/browserRuntime.mjs

let runtime = null;

export function createBrowserRuntime(env) {
    return {
        showModal(config) {
            return env.Swal.fire(config);
        },
        async copyText(text) {
            return env.navigator.clipboard.writeText(text);
        },
        downloadTextFile(filename, content, type = "application/json") {
            const blob = new env.Blob([content], { type });
            const url = env.URL.createObjectURL(blob);
            const link = env.document.createElement("a");
            link.href = url;
            link.download = filename;
            env.document.body.appendChild(link);
            link.click();
            env.document.body.removeChild(link);
            env.URL.revokeObjectURL(url);
        },
        readStorage(key) {
            return env.localStorage.getItem(key);
        },
        writeStorage(key, value) {
            env.localStorage.setItem(key, value);
        },
        removeStorage(key) {
            env.localStorage.removeItem(key);
        },
        isNotificationPermissionRequestSupported() {
            return !!env.Notification && typeof env.Notification.requestPermission === "function";
        },
        async requestNotificationPermission() {
            return env.Notification.requestPermission();
        },
        showNativeNotification(title, options) {
            return new env.Notification(title, options);
        },
    };
}

export function init() {
    runtime = createBrowserRuntime(globalThis);
}

export function showModal(config) {
    return runtime.showModal(config);
}

export async function copyText(text) {
    return runtime.copyText(text);
}

export function downloadTextFile(filename, content, type) {
    return runtime.downloadTextFile(filename, content, type);
}

export function readStorage(key) {
    return runtime.readStorage(key);
}

export function writeStorage(key, value) {
    return runtime.writeStorage(key, value);
}

export function removeStorage(key) {
    return runtime.removeStorage(key);
}

export function isNotificationPermissionRequestSupported() {
    return runtime.isNotificationPermissionRequestSupported();
}

export async function requestNotificationPermission() {
    return runtime.requestNotificationPermission();
}

export function showNativeNotification(title, options) {
    return runtime.showNativeNotification(title, options);
}
