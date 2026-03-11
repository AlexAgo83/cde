// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// pagesRuntime.mjs

export const PANEL_REFRESH_INTERVAL_MS = 25;

/**
 * Returns the first patchable constructor from the provided candidates.
 * Melvor globals can differ between runtimes, so callers may pass globals and instance constructors.
 * @param  {...any} candidates
 * @returns {Function|null}
 */
export function resolvePatchTarget(...candidates) {
    for (const candidate of candidates) {
        if (typeof candidate === "function" && candidate !== Object) {
            return candidate;
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
 * fallbackTargets: Array<{ index: number, type: string, name: string | null, hasMethod: boolean }>,
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
    const selectedTarget = resolvePatchTarget(globalTarget, ...normalizedFallbackTargets);

    const describeCandidate = (candidate, index = null) => ({
        ...(index == null ? {} : { index }),
        type: typeof candidate,
        name: typeof candidate === "function" ? candidate.name || "anonymous" : null,
        hasMethod: typeof candidate?.prototype?.[method] === "function",
    });

    const fallbackDiagnostics = normalizedFallbackTargets.map((candidate, index) =>
        describeCandidate(candidate, index)
    );

    let selectedSource = null;
    if (selectedTarget === globalTarget && typeof globalTarget === "function") {
        selectedSource = "global";
    } else {
        const fallbackIndex = normalizedFallbackTargets.findIndex((candidate) => candidate === selectedTarget);
        if (fallbackIndex >= 0) {
            selectedSource = `fallback:${fallbackIndex}`;
        }
    }

    const selectedHasMethod = typeof selectedTarget?.prototype?.[method] === "function";

    return {
        label,
        method,
        globalTargetType: typeof globalTarget,
        globalTargetName: typeof globalTarget === "function" ? globalTarget.name || "anonymous" : null,
        globalHasMethod: typeof globalTarget?.prototype?.[method] === "function",
        fallbackTargets: fallbackDiagnostics,
        selectedTarget,
        selectedTargetName: typeof selectedTarget === "function" ? selectedTarget.name || "anonymous" : null,
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
