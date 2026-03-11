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

test("active action helpers infer state from activeAction when active collections are unavailable", () => {
    const craftingSkill = {
        localID: "Crafting",
        xp: 123,
        level: 99,
    };
    const activeAction = {
        localID: "Crafting",
        xp: 456,
        level: 100,
    };

    utils.init({
        getMelvorRuntime() {
            return {
                getGame() {
                    return {
                        activeAction,
                        skills: {
                            registeredObjects: [craftingSkill],
                        },
                    };
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

    assert.equal(utils.getActiveActions().registeredObjects.length, 1);
    assert.equal(utils.getActiveActions().registeredObjects[0].localID, "Crafting");
    assert.equal(utils.getActiveActions().registeredObjects[0].isActive, true);
    assert.deepEqual(utils.getActiveSkills(), [craftingSkill]);
});
