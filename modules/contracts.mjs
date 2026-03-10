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

/**
 * @typedef {{
 *   xpCap: number,
 *   xpDiff: number,
 *   secondsToCap: number,
 *   timeToCapStr: string
 * }} EtaPredictionEntryContract
 */

/**
 * @typedef {{
 *   activity: string,
 *   potion: string,
 *   charges: number
 * }} CollectorActivePotionContract
 */

/**
 * @typedef {{
 *   id: string,
 *   killCount: number,
 *   startKillcount: number,
 *   diffKillcount: number,
 *   startTime: string|number|Date,
 *   updateTime: string|number|Date,
 *   startDmgDealt: number,
 *   startDmgTaken: number
 * }} CurrentMonsterStorageContract
 */

/**
 * @typedef {Record<string, Record<string, any>|any>} CurrentActivityStorageContract
 */

/**
 * @typedef {{
 *   playerName?: string,
 *   charName?: string,
 *   actionName: string,
 *   media: string,
 *   requestAt: number,
 *   timeInMs: number
 * }} NotificationBuilderContract
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

export function isEtaPredictionMapContract(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    return Object.values(value).every((entry) =>
        !!entry
        && typeof entry.xpCap === "number"
        && typeof entry.xpDiff === "number"
        && typeof entry.secondsToCap === "number"
        && typeof entry.timeToCapStr === "string"
    );
}

export function isCollectorActivePotionSnapshotContract(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    return Object.values(value).every((entry) =>
        !!entry
        && typeof entry.activity === "string"
        && typeof entry.potion === "string"
        && typeof entry.charges === "number"
    );
}

export function isCurrentMonsterStorageContract(value) {
    return !!value
        && typeof value.id === "string"
        && typeof value.killCount === "number"
        && typeof value.startKillcount === "number"
        && typeof value.diffKillcount === "number"
        && (typeof value.startTime === "string" || typeof value.startTime === "number" || value.startTime instanceof Date)
        && (typeof value.updateTime === "string" || typeof value.updateTime === "number" || value.updateTime instanceof Date)
        && typeof value.startDmgDealt === "number"
        && typeof value.startDmgTaken === "number";
}

export function isCurrentActivityStorageContract(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    return Object.values(value).every((entry) => !!entry && typeof entry === "object" && !Array.isArray(entry));
}

export function isNotificationBuilderContract(value) {
    return !!value
        && (typeof value.playerName === "string" || typeof value.charName === "string")
        && typeof value.actionName === "string"
        && typeof value.media === "string"
        && typeof value.requestAt === "number"
        && typeof value.timeInMs === "number";
}

export function isPendingNotificationStoreContract(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    return Object.values(value).every((entry) => isNotificationBuilderContract(entry));
}
