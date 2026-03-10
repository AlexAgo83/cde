// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// contracts.mjs

/**
 * @typedef {{
 *   section: string,
 *   key: string,
 *   toggle?: any
 * }} SettingsReferenceContract
 */

/**
 * @typedef {{
 *   reference: SettingsReferenceContract,
 *   value: any
 * }} PersistedSettingEntryContract
 */

/**
 * @typedef {{
 *   exportTimestamp: string,
 *   processTime: number,
 *   lastProcessTime: number,
 *   processBuffer: number,
 *   isFullExport: boolean,
 *   gameVersion: string,
 *   modVersion: string
 * }} ExportMetaContract
 */

/**
 * @typedef {Map<string, string[]>} ChangesHistoryContract
 */

export function isSettingsReferenceContract(reference) {
    return !!reference
        && typeof reference.section === "string"
        && typeof reference.key === "string";
}

export function isPersistedSettingEntryContract(entry) {
    return !!entry
        && isSettingsReferenceContract(entry.reference)
        && "value" in entry;
}

export function isExportMetaContract(meta) {
    return !!meta
        && typeof meta.exportTimestamp === "string"
        && typeof meta.processTime === "number"
        && typeof meta.lastProcessTime === "number"
        && typeof meta.processBuffer === "number"
        && typeof meta.isFullExport === "boolean"
        && typeof meta.gameVersion === "string"
        && typeof meta.modVersion === "string";
}

export function isChangesHistoryContract(history) {
    if (!(history instanceof Map)) {
        return false;
    }

    for (const [key, value] of history.entries()) {
        if (typeof key !== "string") {
            return false;
        }
        if (!Array.isArray(value) || value.some((line) => typeof line !== "string")) {
            return false;
        }
    }

    return true;
}
