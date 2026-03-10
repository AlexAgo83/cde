import test from "node:test";
import assert from "node:assert/strict";

const settingsDomain = await import("../modules/settingsDomain.mjs");

test("resolveSettingValue falls back only for nullish values", () => {
    assert.equal(settingsDomain.resolveSettingValue(undefined, true), true);
    assert.equal(settingsDomain.resolveSettingValue(null, true), true);
    assert.equal(settingsDomain.resolveSettingValue(false, true), false);
    assert.equal(settingsDomain.resolveSettingValue(0, 10), 0);
});

test("normalizeSettingInput unwraps UI option payloads", () => {
    assert.equal(settingsDomain.normalizeSettingInput({ value: 250 }), 250);
    assert.equal(settingsDomain.normalizeSettingInput(true), true);
});

test("serialize and deserialize setting values preserve booleans numbers objects and strings", () => {
    const objectValue = { mode: "compact" };
    assert.equal(settingsDomain.serializeSettingValue(true), "true");
    assert.equal(settingsDomain.deserializeSettingValue("true"), true);
    assert.equal(settingsDomain.deserializeSettingValue("42"), 42);
    assert.deepEqual(
        settingsDomain.deserializeSettingValue(settingsDomain.serializeSettingValue(objectValue)),
        objectValue
    );
    assert.equal(settingsDomain.deserializeSettingValue("plain-text"), "plain-text");
});

test("collectPersistedSettings keeps only non nullish persisted values", () => {
    const refs = {
        FIRST: { section: "General", key: "first", toggle: true },
        SECOND: { section: "General", key: "second", toggle: false },
        THIRD: { section: "General", key: "third", toggle: false },
        INVALID: { section: "General", toggle: false }
    };
    const persisted = new Map([
        ["first", false],
        ["second", null],
        ["third", 0]
    ]);

    const result = settingsDomain.collectPersistedSettings(
        refs,
        (reference) => persisted.get(reference.key)
    );

    assert.deepEqual(result, [
        { reference: refs.FIRST, value: false },
        { reference: refs.THIRD, value: 0 }
    ]);
});
