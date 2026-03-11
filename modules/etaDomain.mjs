// Copyright (c) 2025 <a.agostini.fr@gmail.com>
// This work is free. You can redistribute it and/or modify it

// @ts-check
// etaDomain.mjs

/**
 * Compute a per-hour rate from a diff value and elapsed time.
 * Returns the legacy string "NaN" when the elapsed time is not positive.
 * @param {number} diffValue
 * @param {number} diffTimeMs
 * @returns {number|string}
 */
export function calculateRatePerHour(diffValue, diffTimeMs) {
    if (!(diffTimeMs > 0)) return "NaN";
    return Math.round((diffValue / (diffTimeMs / 3600000)) || 0);
}

/**
 * Compute rounded DPS from a damage diff and elapsed time.
 * Returns the legacy string "NaN" when the elapsed time is not positive.
 * @param {number} diffDamage
 * @param {number} diffTimeMs
 * @returns {number|string}
 */
export function calculateDps(diffDamage, diffTimeMs) {
    if (!(diffTimeMs > 0)) return "NaN";
    const raw = (diffDamage / (diffTimeMs / 1000)) || 0;
    return Math.round(raw * 100) / 100;
}

/**
 * Compute rounded seconds to target from a per-hour rate.
 * Returns 0 when the rate is not positive.
 * @param {number} diffToTarget
 * @param {number|string} ratePerHour
 * @returns {number}
 */
export function calculateSecondsToTarget(diffToTarget, ratePerHour) {
    const numericRate = typeof ratePerHour === "number" ? ratePerHour : Number(ratePerHour);
    if (!(numericRate > 0) || !(diffToTarget > 0)) return 0;
    return +(diffToTarget / (numericRate / 3600)).toFixed(0);
}

/**
 * Compute combat KPH and optional DPS values.
 * @param {{
 *   diffKillcount: number,
 *   diffUpdatedMs: number,
 *   diffDmgDealt?: number,
 *   diffDmgTaken?: number,
 *   diffTimeMs: number,
 *   includeLiveDps: boolean
 * }} params
 * @returns {{kph: number|string, dpsDealt: number|string, dpsTaken: number|string}}
 */
export function computeCombatMetrics(params) {
    const kph = calculateRatePerHour(params.diffKillcount, params.diffUpdatedMs);
    const dpsDealt = params.includeLiveDps ?
        calculateDps(params.diffDmgDealt ?? 0, params.diffTimeMs) :
        "NaN";
    const dpsTaken = params.includeLiveDps ?
        calculateDps(params.diffDmgTaken ?? 0, params.diffTimeMs) :
        "NaN";

    return { kph, dpsDealt, dpsTaken };
}

/**
 * Build prediction entries from xp caps and an hourly rate.
 * @param {{
 *   caps: number[],
 *   targetLevels?: Array<number|string>,
 *   currentXp: number,
 *   ratePerHour: number|string,
 *   formatDuration: (durationMs: number) => string
 * }} params
 * @returns {Record<string, {targetLevel: number|string|null, xpCap: number, xpDiff: number, secondsToCap: number, timeToCapStr: string}>}
 */
export function buildXpPredictionMap(params) {
    /** @type {Record<string, {targetLevel: number|string|null, xpCap: number, xpDiff: number, secondsToCap: number, timeToCapStr: string}>} */
    const predictions = {};
    params.caps.forEach((cap, index) => {
        const targetLevel = params.targetLevels?.[index] ?? null;
        const xpDiff = cap - params.currentXp;
        const secondsToCap = calculateSecondsToTarget(xpDiff, params.ratePerHour);
        const predictionKey = targetLevel ?? cap;
        predictions[predictionKey] = {
            targetLevel,
            xpCap: cap,
            xpDiff,
            secondsToCap,
            timeToCapStr: params.formatDuration(secondsToCap * 1000)
        };
    });
    return predictions;
}
