import test from "node:test";
import assert from "node:assert/strict";

import {
  init,
  createCollectDataUseCase,
  shouldAutoExportOnLoad,
  loadCharacterData,
  prepareInterface,
} from "../modules/appOrchestrator.mjs";

function createModules({
  autoExportStored,
  autoExportFallback = false,
  etaDisplay = false,
  debug = false,
  processCollectDataReturn = { ok: true },
} = {}) {
  const callOrder = [];
  let metaVersion = null;
  let exportCollectArgs = null;

  const exportView = {
    setCollectCb(value) {
      callOrder.push(["exportView.setCollectCb", value]);
    },
  };

  const pages = {
    setCollectCb(value) {
      callOrder.push(["pages.setCollectCb", value]);
    },
    triggerObservers(value) {
      callOrder.push(["pages.triggerObservers", value]);
    },
    worker(ctx) {
      callOrder.push(["pages.worker", ctx]);
    },
  };

  const modules = {
    onDataLoad: async (...args) => {
      callOrder.push(["onDataLoad", args]);
    },
    onViewLoad: async (ctx) => {
      callOrder.push(["onViewLoad", ctx]);
    },
    getSettings() {
      return {
        SettingsReference: {
          AUTO_EXPORT_ONLOAD: "AUTO_EXPORT_ONLOAD",
          ETA_DISPLAY: "ETA_DISPLAY",
        },
        isCfg(reference) {
          if (reference === "AUTO_EXPORT_ONLOAD") {
            return autoExportFallback;
          }
          if (reference === "ETA_DISPLAY") {
            return etaDisplay;
          }
          return false;
        },
        isDebug() {
          return debug;
        },
      };
    },
    getCloudStorage() {
      return {
        loadSetting(reference) {
          callOrder.push(["cloud.loadSetting", reference]);
          return autoExportStored;
        },
      };
    },
    getETA() {
      return {
        onCombat: "combat",
        onNonCombat: "nonCombat",
        onActiveSkill: "activeSkill",
        onSkillsUpdate: "skillsUpdate",
      };
    },
    getExport() {
      return {
        processCollectData(...args) {
          exportCollectArgs = args;
          const mutateMeta = args[6];
          const meta = {};
          mutateMeta(meta);
          metaVersion = meta.modVersion;
          return processCollectDataReturn;
        },
      };
    },
    getViewer() {
      return {
        getExportView() {
          return exportView;
        },
      };
    },
    getPages() {
      return pages;
    },
  };

  return { modules, callOrder, getMetaVersion: () => metaVersion, getExportCollectArgs: () => exportCollectArgs };
}

test("createCollectDataUseCase wires ETA callbacks and injects mod version", () => {
  const fixture = createModules({ processCollectDataReturn: { exported: true } });
  init(fixture.modules, "v3.0.2");

  const collectData = createCollectDataUseCase();
  const value = collectData(true, 125);

  assert.deepEqual(value, { exported: true });
  assert.equal(fixture.getMetaVersion(), "v3.0.2");
  assert.deepEqual(fixture.getExportCollectArgs().slice(0, 6), [
    "combat",
    "nonCombat",
    "activeSkill",
    "skillsUpdate",
    true,
    125,
  ]);
});

test("shouldAutoExportOnLoad prefers persisted setting when available", () => {
  const fixture = createModules({ autoExportStored: true, autoExportFallback: false });
  init(fixture.modules, "v3.0.2");

  assert.equal(shouldAutoExportOnLoad(), true);
});

test("shouldAutoExportOnLoad falls back to settings flag when storage is undefined", () => {
  const fixture = createModules({ autoExportStored: undefined, autoExportFallback: true });
  init(fixture.modules, "v3.0.2");

  assert.equal(shouldAutoExportOnLoad(), true);
});

test("loadCharacterData initializes modules and triggers auto export only when enabled", async () => {
  const fixture = createModules({ autoExportStored: true });
  init(fixture.modules, "v3.0.2");

  let collectCalls = 0;
  await loadCharacterData("settings", "character", "account", () => {
    collectCalls += 1;
    fixture.callOrder.push(["collectData"]);
  });

  assert.equal(collectCalls, 1);
  assert.deepEqual(fixture.callOrder.map(([name]) => name), [
    "onDataLoad",
    "cloud.loadSetting",
    "collectData",
  ]);
});

test("prepareInterface loads views and binds collect callback before starting page worker", async () => {
  const fixture = createModules({ etaDisplay: true });
  init(fixture.modules, "v3.0.2");

  const collectData = () => {};
  const ctx = { id: "ctx" };
  await prepareInterface(ctx, collectData);

  assert.deepEqual(fixture.callOrder, [
    ["onViewLoad", ctx],
    ["exportView.setCollectCb", collectData],
    ["pages.setCollectCb", collectData],
    ["pages.triggerObservers", true],
    ["pages.worker", ctx],
  ]);
});
