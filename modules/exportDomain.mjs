// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// exportDomain.mjs

let contractFns = {
    isChangesHistoryContract(history) {
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
    },
};

export function init(modules) {
    contractFns = modules?.getContracts?.() ?? contractFns;
}

/**
 * Resolve export cache by loading persisted data only when the in-memory cache is empty.
 * @param {*} cachedExport
 * @param {() => any} loadPersistedExport
 * @returns {*}
 */
export function resolveExportCache(cachedExport, loadPersistedExport) {
    if (cachedExport != null) return cachedExport;
    return loadPersistedExport() ?? {};
}

/**
 * Convert export payload to a JSON string.
 * @param {*} exportJson
 * @param {boolean} compact
 * @returns {string}
 */
export function stringifyExport(exportJson, compact) {
    return compact ?
        JSON.stringify(exportJson) :
        JSON.stringify(exportJson, null, 2);
}

/**
 * Normalize a persisted changes history payload into a Map.
 * @param {*} storedHistory
 * @returns {Map<any, any>}
 */
export function normalizeChangesHistory(storedHistory) {
    return contractFns.isChangesHistoryContract(storedHistory) ? new Map(storedHistory) : new Map();
}

/**
 * Parse the max changes history setting with a fallback.
 * @param {*} rawValue
 * @param {number} fallback
 * @returns {number}
 */
export function parseMaxHistory(rawValue, fallback = 10) {
    const parsed = parseInt(String(rawValue), 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * Trim the changes history to the configured maximum while preserving insertion order.
 * @param {Map<any, any>} history
 * @param {number} maxHistory
 * @returns {{history: Map<any, any>, removedKeys: any[]}}
 */
export function trimChangesHistory(history, maxHistory) {
    const nextHistory = new Map(history);
    const removedKeys = [];

    while (nextHistory.size > maxHistory) {
        const oldestKey = nextHistory.keys().next().value;
        if (oldestKey === undefined) break;
        removedKeys.push(oldestKey);
        nextHistory.delete(oldestKey);
    }

    return { history: nextHistory, removedKeys };
}

/**
 * Append a changes entry and enforce history retention.
 * @param {Map<any, any>} history
 * @param {any} key
 * @param {*} data
 * @param {number} maxHistory
 * @returns {{history: Map<any, any>, removedKeys: any[]}}
 */
export function appendChangesHistory(history, key, data, maxHistory) {
    const nextHistory = new Map(history);
    nextHistory.set(key, data);
    return trimChangesHistory(nextHistory, maxHistory);
}

/**
 * Clone an export snapshot using JSON semantics so persisted payload shape stays stable.
 * @param {*} snapshot
 * @returns {*}
 */
export function cloneExportSnapshot(snapshot) {
    return JSON.parse(JSON.stringify(snapshot));
}

/**
 * Build a user-facing changes header.
 * @param {string} characterName
 * @param {string} exportTime
 * @returns {string}
 */
export function buildChangesHeader(characterName, exportTime) {
    return `🧾 Changelog for: ${characterName || "Unknown"} — ${exportTime}`;
}

/**
 * Build the export diff payload shown in the changelog.
 * @param {{
 *   previousExport: any,
 *   nextExport: any,
 *   header: string,
 *   diff: (previousExport: any, nextExport: any) => string[]
 * }} params
 * @returns {string[]}
 */
export function buildChangesDiff({ previousExport, nextExport, header, diff }) {
    if (!previousExport) {
        return [header, "🆕 First export — no previous data to compare."];
    }
    return [header, ...diff(previousExport, nextExport)];
}
