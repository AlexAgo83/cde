import test from "node:test";
import assert from "node:assert/strict";

const exportDomain = await import("../modules/exportDomain.mjs");

test("resolveExportCache reuses cached export when available", () => {
    const cached = { meta: { exportTimestamp: "cached" } };
    const result = exportDomain.resolveExportCache(cached, () => {
        throw new Error("loader should not run when cache is present");
    });
    assert.equal(result, cached);
});

test("resolveExportCache falls back to persisted export and then empty object", () => {
    const persisted = { meta: { exportTimestamp: "persisted" } };
    assert.deepEqual(
        exportDomain.resolveExportCache(null, () => persisted),
        persisted
    );
    assert.deepEqual(
        exportDomain.resolveExportCache(null, () => null),
        {}
    );
});

test("stringifyExport switches between compact and pretty JSON", () => {
    const payload = { a: 1, b: { c: 2 } };
    assert.equal(exportDomain.stringifyExport(payload, true), JSON.stringify(payload));
    assert.equal(exportDomain.stringifyExport(payload, false), JSON.stringify(payload, null, 2));
});

test("appendChangesHistory trims older entries beyond max history", () => {
    const history = new Map([
        ["oldest", ["a"]],
        ["middle", ["b"]]
    ]);

    const result = exportDomain.appendChangesHistory(history, "latest", ["c"], 2);

    assert.deepEqual(Array.from(result.history.keys()), ["middle", "latest"]);
    assert.deepEqual(result.removedKeys, ["oldest"]);
});

test("buildChangesDiff emits first export message without previous payload", () => {
    const result = exportDomain.buildChangesDiff({
        previousExport: null,
        nextExport: { meta: { exportTimestamp: "now" } },
        header: "header",
        diff() {
            return ["should not run"];
        }
    });

    assert.deepEqual(result, ["header", "🆕 First export — no previous data to compare."]);
});

test("buildChangesDiff delegates to provided diff implementation", () => {
    const previousExport = { value: 1 };
    const nextExport = { value: 2 };
    const result = exportDomain.buildChangesDiff({
        previousExport,
        nextExport,
        header: "header",
        diff(prev, next) {
            assert.equal(prev, previousExport);
            assert.equal(next, nextExport);
            return ["changed"];
        }
    });

    assert.deepEqual(result, ["header", "changed"]);
});
