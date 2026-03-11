import test from "node:test";
import assert from "node:assert/strict";

const etaDomain = await import("../modules/etaDomain.mjs");

test("calculateRatePerHour computes rounded hourly values and keeps legacy NaN string", () => {
    assert.equal(etaDomain.calculateRatePerHour(50, 1800000), 100);
    assert.equal(etaDomain.calculateRatePerHour(50, 0), "NaN");
});

test("calculateDps computes rounded DPS and keeps legacy NaN string", () => {
    assert.equal(etaDomain.calculateDps(25, 5000), 5);
    assert.equal(etaDomain.calculateDps(25, 0), "NaN");
});

test("calculateSecondsToTarget returns rounded seconds or zero when rate is invalid", () => {
    assert.equal(etaDomain.calculateSecondsToTarget(50, 100), 1800);
    assert.equal(etaDomain.calculateSecondsToTarget(50, "NaN"), 0);
});

test("computeCombatMetrics derives KPH and optional DPS values", () => {
    assert.deepEqual(
        etaDomain.computeCombatMetrics({
            diffKillcount: 10,
            diffUpdatedMs: 1800000,
            diffDmgDealt: 900,
            diffDmgTaken: 120,
            diffTimeMs: 60000,
            includeLiveDps: true
        }),
        {
            kph: 20,
            dpsDealt: 15,
            dpsTaken: 2
        }
    );
});

test("buildXpPredictionMap creates prediction entries from xp caps and rates", () => {
    const result = etaDomain.buildXpPredictionMap({
        caps: [1200, 1500],
        targetLevels: [10, 20],
        currentXp: 1000,
        ratePerHour: 100,
        formatDuration(ms) {
            return `${ms}ms`;
        }
    });

    assert.deepEqual(result, {
        10: {
            targetLevel: 10,
            xpCap: 1200,
            xpDiff: 200,
            secondsToCap: 7200,
            timeToCapStr: "7200000ms"
        },
        20: {
            targetLevel: 20,
            xpCap: 1500,
            xpDiff: 500,
            secondsToCap: 18000,
            timeToCapStr: "18000000ms"
        }
    });
});
