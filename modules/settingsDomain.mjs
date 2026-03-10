// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// settingsDomain.mjs

import { isPersistedSettingEntryContract, isSettingsReferenceContract } from "./contracts.mjs";

/**
 * @param {*} reference
 * @returns {*}
 */
export function getSettingDefault(reference) {
    return reference?.toggle;
}

/**
 * @param {*} reference
 * @returns {boolean}
 */
export function isValidSettingReference(reference) {
    return isSettingsReferenceContract(reference);
}

/**
 * Resolve a persisted or current setting value against its default.
 * @param {*} value
 * @param {*} fallback
 * @returns {*}
 */
export function resolveSettingValue(value, fallback) {
    return value !== undefined && value !== null ? value : fallback;
}

/**
 * Normalize UI change payloads so domain logic receives only persisted values.
 * @param {*} value
 * @returns {*}
 */
export function normalizeSettingInput(value) {
    return value && typeof value === "object" && "value" in value ? value.value : value;
}

/**
 * Convert a setting value to a storable string payload.
 * @param {*} value
 * @returns {string}
 */
export function serializeSettingValue(value) {
    return typeof value === "string" ? value : JSON.stringify(value);
}

/**
 * Parse a stored setting payload back into a runtime value.
 * @param {*} raw
 * @returns {*}
 */
export function deserializeSettingValue(raw) {
    if (typeof raw !== "string") return raw;
    if (raw === "true") return true;
    if (raw === "false") return false;
    if (!Number.isNaN(Number(raw)) && raw.trim() !== "") return Number(raw);
    if (raw.startsWith("{") || raw.startsWith("[")) return JSON.parse(raw);
    return raw;
}

/**
 * Collect persisted settings that should override current section values.
 * @param {Record<string, any>} settingsReference
 * @param {(reference: any) => any} loadPersistedValue
 * @returns {Array<{reference: any, value: any}>}
 */
export function collectPersistedSettings(settingsReference, loadPersistedValue) {
    const persistedEntries = [];
    for (const key in settingsReference) {
        const reference = settingsReference[key];
        if (!isValidSettingReference(reference)) {
            continue;
        }
        const value = loadPersistedValue(reference);
        if (value !== undefined && value !== null) {
            const entry = { reference, value };
            if (isPersistedSettingEntryContract(entry)) {
                persistedEntries.push(entry);
            }
        }
    }
    return persistedEntries;
}
