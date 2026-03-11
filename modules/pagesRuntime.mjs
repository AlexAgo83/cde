// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// pagesRuntime.mjs

export const PANEL_REFRESH_INTERVAL_MS = 25;

const MAX_PATCH_TARGET_PROTOTYPE_DEPTH = 6;

function getFunctionName(candidate) {
    return typeof candidate === "function" ? candidate.name || "anonymous" : null;
}

function getInputConstructorName(candidate) {
    return typeof candidate?.constructor === "function"
        ? candidate.constructor.name || "anonymous"
        : null;
}

function expandPatchTargetCandidates(candidate, method) {
    if (typeof candidate === "function") {
        return candidate !== Object
            ? [{
                candidate,
                path: "direct",
                type: "function",
                name: getFunctionName(candidate),
                hasMethod: typeof candidate?.prototype?.[method] === "function",
            }]
            : [];
    }
    if (candidate == null || (typeof candidate !== "object" && typeof candidate !== "function")) {
        return [];
    }

    const resolutions = [];
    const seenTargets = new Set();
    const seenPrototypes = new Set();
    let current = candidate;
    let depth = 0;

    while (current != null && depth <= MAX_PATCH_TARGET_PROTOTYPE_DEPTH && !seenPrototypes.has(current)) {
        seenPrototypes.add(current);
        const ctor = current.constructor;
        if (typeof ctor === "function" && ctor !== Object && !seenTargets.has(ctor)) {
            seenTargets.add(ctor);
            resolutions.push({
                candidate: ctor,
                path: depth === 0 ? "instance.constructor" : `prototype:${depth}.constructor`,
                type: "function",
                name: getFunctionName(ctor),
                hasMethod: typeof ctor?.prototype?.[method] === "function",
            });
        }
        current = Object.getPrototypeOf(current);
        depth += 1;
    }

    return resolutions;
}

/**
 * Returns the first patchable constructor from the provided candidates.
 * Melvor globals can differ between runtimes, so callers may pass globals and instance constructors.
 * @param  {...any} candidates
 * @returns {Function|null}
 */
export function resolvePatchTarget(...candidates) {
    for (const candidate of candidates) {
        const expanded = expandPatchTargetCandidates(candidate, "");
        for (const resolution of expanded) {
            if (typeof resolution.candidate === "function" && resolution.candidate !== Object) {
                return resolution.candidate;
            }
        }
    }
    return null;
}

/**
 * Returns structured diagnostics for a patch target resolution attempt.
 * @param {{
 * label: string,
 * method: string,
 * globalTarget?: any,
 * fallbackTargets?: any[],
 * }} config
 * @returns {{
 * label: string,
 * method: string,
 * globalTargetType: string,
 * globalTargetName: string | null,
 * globalHasMethod: boolean,
 * globalCandidates: Array<{ path: string, type: string, name: string | null, hasMethod: boolean }>,
 * fallbackTargets: Array<{
 * index: number,
 * inputType: string,
 * inputConstructorName: string | null,
 * resolutions: Array<{ path: string, type: string, name: string | null, hasMethod: boolean }>
 * }>,
 * selectedTarget: Function | null,
 * selectedTargetName: string | null,
 * selectedSource: string | null,
 * selectedHasMethod: boolean,
 * isPatchable: boolean,
 * }}
 */
export function describePatchTargetResolution({
    label,
    method,
    globalTarget = undefined,
    fallbackTargets = [],
}) {
    const normalizedFallbackTargets = Array.isArray(fallbackTargets) ? fallbackTargets : [];
    const globalCandidates = expandPatchTargetCandidates(globalTarget, method);
    const fallbackCandidates = normalizedFallbackTargets.map((candidate, index) => ({
        index,
        inputType: typeof candidate,
        inputConstructorName: getInputConstructorName(candidate),
        resolutions: expandPatchTargetCandidates(candidate, method),
    }));

    const allResolutions = [
        ...globalCandidates.map((resolution) => ({
            bucket: "global",
            index: null,
            resolution,
        })),
        ...fallbackCandidates.flatMap((candidate) => candidate.resolutions.map((resolution) => ({
            bucket: "fallback",
            index: candidate.index,
            resolution,
        }))),
    ];

    const selectedResolution =
        allResolutions.find((entry) => entry.resolution.hasMethod)
        ?? allResolutions[0]
        ?? null;
    const selectedTarget = selectedResolution?.resolution?.candidate ?? null;
    const selectedHasMethod = selectedResolution?.resolution?.hasMethod ?? false;
    const selectedSource = selectedResolution == null
        ? null
        : selectedResolution.bucket === "global"
            ? `global:${selectedResolution.resolution.path}`
            : `fallback:${selectedResolution.index}:${selectedResolution.resolution.path}`;

    return {
        label,
        method,
        globalTargetType: typeof globalTarget,
        globalTargetName: getFunctionName(globalTarget),
        globalHasMethod: globalCandidates.some((candidate) => candidate.hasMethod),
        globalCandidates: globalCandidates.map((resolution) => ({
            path: resolution.path,
            type: resolution.type,
            name: resolution.name,
            hasMethod: resolution.hasMethod,
        })),
        fallbackTargets: fallbackCandidates.map((candidate) => ({
            index: candidate.index,
            inputType: candidate.inputType,
            inputConstructorName: candidate.inputConstructorName,
            resolutions: candidate.resolutions.map((resolution) => ({
                path: resolution.path,
                type: resolution.type,
                name: resolution.name,
                hasMethod: resolution.hasMethod,
            })),
        })),
        selectedTarget,
        selectedTargetName: getFunctionName(selectedTarget),
        selectedSource,
        selectedHasMethod,
        isPatchable: typeof selectedTarget === "function" && selectedHasMethod,
    };
}

/**
 * Returns the action identifier that should match the current page worker.
 * Alt Magic is surfaced under the Magic page when not in combat.
 * @param {string} localID
 * @param {boolean} isCombat
 * @returns {string}
 */
export function resolveWorkerActionID(localID, isCombat) {
    if (localID === "AltMagic" && !isCombat) {
        return "Magic";
    }
    return localID;
}

/**
 * Returns true when the current page/action context does not match the panel.
 * @param {{
 * userPage?: { localID?: string } | null,
 * activeAction?: { localID?: string } | null,
 * localID: string,
 * isCombat: boolean,
 * }} context
 * @returns {boolean}
 */
export function shouldHidePanelForContext({ userPage, activeAction, localID, isCombat }) {
    const pageMismatch = Boolean(userPage?.localID) && userPage.localID !== localID;
    const expectedActionID = resolveWorkerActionID(localID, isCombat);
    const actionMismatch = Boolean(activeAction?.localID) && activeAction.localID !== expectedActionID;
    return pageMismatch || actionMismatch;
}

/**
 * Returns true when the global tick worker should run.
 * @param {{ lastTick?: number | null, now: number, minTick?: number | null }} config
 * @returns {boolean}
 */
export function shouldRunGlobalTick({ lastTick, now, minTick }) {
    if (!Number.isFinite(minTick) || minTick == null || minTick <= 0) {
        return true;
    }
    if (!Number.isFinite(lastTick) || lastTick == null) {
        return true;
    }
    return now - lastTick >= minTick;
}

/**
 * Returns the next ETA panel position based on the clicked control.
 * @param {string} buttonId
 * @param {"left" | "center" | "right"} currentPosition
 * @returns {"left" | "center" | "right"}
 */
export function getNextEtaPosition(buttonId, currentPosition) {
    if (buttonId === "cde-btn-eta-displayLeft") {
        if (currentPosition === "center") return "left";
        if (currentPosition === "right") return "center";
    } else if (buttonId === "cde-btn-eta-displayRight") {
        if (currentPosition === "center") return "right";
        if (currentPosition === "left") return "center";
    }
    return currentPosition;
}

/**
 * Returns the next ETA size based on the clicked control.
 * @param {string} buttonId
 * @param {"small" | "large"} currentSize
 * @returns {"small" | "large"}
 */
export function getNextEtaSize(buttonId, currentSize) {
    if (buttonId !== "cde-btn-eta-displaySmall") {
        return currentSize;
    }
    return currentSize === "small" ? "large" : "small";
}

/**
 * Returns the next ETA visibility state based on the clicked control.
 * @param {string} buttonId
 * @param {boolean} currentVisibility
 * @returns {boolean}
 */
export function getNextEtaVisibility(buttonId, currentVisibility) {
    if (buttonId !== "cde-btn-eta-extra") {
        return currentVisibility;
    }
    return !currentVisibility;
}

/**
 * Returns whether the panel may refresh now and the timestamp to keep.
 * @param {Date | null} lastCallTime
 * @param {Date} [now]
 * @param {number} [minIntervalMs]
 * @returns {{ shouldRefresh: boolean, nextLastCallTime: Date | null }}
 */
export function getPanelRefreshDecision(
    lastCallTime,
    now = new Date(),
    minIntervalMs = PANEL_REFRESH_INTERVAL_MS,
) {
    if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
        throw new TypeError("now must be a valid Date");
    }
    if (!(lastCallTime instanceof Date) || (lastCallTime.getTime() + minIntervalMs) < now.getTime()) {
        return { shouldRefresh: true, nextLastCallTime: now };
    }
    return { shouldRefresh: false, nextLastCallTime: lastCallTime };
}

/**
 * Builds the shared ETA panel shell used by combat and non-combat panels.
 * @param {{
 * identity: string,
 * summaryId: string,
 * etaData?: string | null,
 * controlsPanel?: string,
 * etaSize?: string,
 * isEtaVisible: boolean,
 * }} config
 * @returns {string}
 */
export function renderEtaPanelShell({
    identity,
    summaryId,
    etaData = null,
    controlsPanel = "",
    etaSize = "large",
    isEtaVisible,
}) {
    const etaStr = etaData || "n/a";
    const wrapper = `<span class="cde-eta-summary ${etaSize === "small" ? "cde-eta-summary-small" : ""}" id="${summaryId}">${etaStr}</span>${controlsPanel}`;
    const hiddenClass = isEtaVisible ? "" : " cde-eta-generic-flat";
    return `<div class="cde-${identity}-panel cde-eta-generic${hiddenClass}"><div class="cde-eta-wrapper">${wrapper}</div></div>`;
}
