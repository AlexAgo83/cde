import test from "node:test";
import assert from "node:assert/strict";

import { createSetupComposition } from "../modules/compositionRoot.mjs";

function createFixture() {
  const calls = [];
  let moduleManager = null;
  const exportView = {
    setCollectCb() {},
  };

  const modules = {
    onModuleLoad: async (ctx, version) => {
      calls.push(["modules.onModuleLoad", ctx, version]);
    },
    getAppOrchestrator() {
      return {
        createCollectDataUseCase() {
          calls.push(["app.createCollectDataUseCase"]);
          return (extractEta = false, timeBuffer = 50) => {
            calls.push(["collectData", extractEta, timeBuffer]);
            return { extractEta, timeBuffer };
          };
        },
        async loadCharacterData(settings, characterStorage, accountStorage, collectData) {
          calls.push(["app.loadCharacterData", settings, characterStorage, accountStorage, collectData()]);
        },
        async prepareInterface(ctx, collectData) {
          calls.push(["app.prepareInterface", ctx, collectData(true, 125)]);
        },
      };
    },
    getViewer() {
      return {
        getViews() {
          return ["export", "changelog"];
        },
        getExportView() {
          return exportView;
        },
      };
    },
    getSettings() {
      return {
        setDebug(toggle) {
          calls.push(["settings.setDebug", toggle]);
        },
      };
    },
    getCloudStorage() {
      return {
        getPlayerPendingNotification() {
          return null;
        },
        getOtherPlayerPendingNotifications() {
          return {};
        },
        setPendingNotification(value) {
          calls.push(["cloud.setPendingNotification", Object.keys(value)]);
        },
      };
    },
    getNotification() {
      return {
        newNotifBuilder(name, label, media) {
          return { name, label, media };
        },
      };
    },
    getUtils() {
      return {
        dateToLocalString(value) {
          return value.toISOString();
        },
      };
    },
  };

  const ctx = {
    async loadModule(path) {
      calls.push(["ctx.loadModule", path]);
      if (path === "modules/melvorRuntime.mjs") {
        return {
          async loadModule(innerCtx, innerPath) {
            calls.push(["runtime.loadModule", innerCtx, innerPath]);
            moduleManager = modules;
            return modules;
          },
        };
      }
      throw new Error(`unexpected path ${path}`);
    },
  };

  return { calls, ctx, getModules: () => moduleManager };
}

test("composition root loads modules and delegates lifecycle wiring", async () => {
  const fixture = createFixture();
  const composition = createSetupComposition({
    settings: "settings",
    characterStorage: "character",
    accountStorage: "account",
    modVersion: "v3.0.1",
  });

  await composition.loadModules(fixture.ctx);
  await composition.loadCharacterData();
  await composition.prepareInterface({ id: "ui" });

  assert.equal(composition.createApi().getModules(), fixture.getModules());
  assert.deepEqual(composition.createApi().getViews(), ["export", "changelog"]);
  assert.deepEqual(fixture.calls, [
    ["ctx.loadModule", "modules/melvorRuntime.mjs"],
    ["runtime.loadModule", fixture.ctx, "modules.mjs"],
    ["modules.onModuleLoad", fixture.ctx, "v3.0.1"],
    ["app.createCollectDataUseCase"],
    ["collectData", false, 50],
    ["app.loadCharacterData", "settings", "character", "account", { extractEta: false, timeBuffer: 50 }],
    ["collectData", true, 125],
    ["app.prepareInterface", { id: "ui" }, { extractEta: true, timeBuffer: 125 }],
  ]);
});

test("composition root API delegates generate, debug and notification helpers", async () => {
  const fixture = createFixture();
  const composition = createSetupComposition({
    settings: "settings",
    characterStorage: "character",
    accountStorage: "account",
    modVersion: "v3.0.1",
  });

  await composition.loadModules(fixture.ctx);
  const api = composition.createApi();
  assert.deepEqual(api.generate(), { extractEta: false, timeBuffer: 50 });
  api.setDebug(true);
  api.debugNotif_injectData();

  assert.deepEqual(fixture.calls.slice(-3), [
    ["collectData", false, 50],
    ["settings.setDebug", true],
    ["cloud.setPendingNotification", ["TEST_1", "TEST_2", "TEST_3", "TEST_4", "TEST_5", "TEST_6"]],
  ]);
  assert.equal(api.getVersion(), "v3.0.1");
});
