import test from "node:test";
import assert from "node:assert/strict";

globalThis.exp = {
    levelToXP(level) {
        return level * 100;
    }
};

const utils = await import("../modules/utils.mjs");

test("getMasteryProgressPercent returns positive progress toward next level", () => {
    const result = utils.getMasteryProgressPercent(10, 1050);
    assert.equal(result.nextLevel, 11);
    assert.equal(result.percent, 50);
});

test("getMasteryProgressPercent caps maxed mastery at 100 percent", () => {
    const result = utils.getMasteryProgressPercent(98, 200000);
    assert.deepEqual(result, { level: 99, percent: 100 });
});

test("active action helpers fall back safely when runtime game state is not ready", () => {
    utils.init({
        getMelvorRuntime() {
            return {
                getGame() {
                    return {};
                },
            };
        },
        getSettings() {
            return {
                isCfg() {
                    return false;
                },
            };
        },
    });

    assert.equal(utils.getActiveAction(), undefined);
    assert.deepEqual(utils.getActiveActions(), { registeredObjects: [] });
    assert.deepEqual(utils.getActiveSkills(), []);
    assert.equal(utils.getDungeonCount({ localID: "Dungeon" }), 0);
    assert.equal(utils.getQteInBank({ localID: "Item" }), 0);
});
