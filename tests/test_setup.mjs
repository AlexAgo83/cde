import test from "node:test";
import assert from "node:assert/strict";

import { setup } from "../setup.mjs";

function createFixture() {
  const calls = [];
  const registered = {};
  let moduleManager = null;

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
      if (path === "modules/compositionRoot.mjs") {
        return {
          createSetupComposition() {
            calls.push(["compositionRoot.createSetupComposition"]);
            return {
              async loadModules(innerCtx) {
                const runtime = await innerCtx.loadModule("modules/melvorRuntime.mjs");
                moduleManager = await runtime.loadModule(innerCtx, "modules.mjs");
                await moduleManager.onModuleLoad(innerCtx, "v3.0.8");
                this.collectData = moduleManager.getAppOrchestrator().createCollectDataUseCase();
              },
              async loadCharacterData() {
                return moduleManager
                  .getAppOrchestrator()
                  .loadCharacterData("settings", "character", "account", this.collectData);
              },
              async prepareInterface(innerCtx) {
                return moduleManager
                  .getAppOrchestrator()
                  .prepareInterface(innerCtx, this.collectData);
              },
              createApi() {
                return {
                  generate: () => this.collectData(),
                  getModules: () => moduleManager,
                  getViews: () => moduleManager.getViewer().getViews(),
                  setDebug: (toggle) => moduleManager.getSettings().setDebug(toggle),
                  getVersion: () => "v3.0.8",
                };
              },
            };
          },
        };
      }
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

  const register = (name) => (callback) => {
    registered[name] = callback;
    calls.push(["register", name]);
  };

  let apiInstance = null;

  setup({
    settings: "settings",
    api(value) {
      apiInstance = value;
      calls.push(["register", "api"]);
    },
    characterStorage: "character",
    accountStorage: "account",
    onModsLoaded: register("onModsLoaded"),
    onCharacterSelectionLoaded: register("onCharacterSelectionLoaded"),
    onCharacterLoaded: register("onCharacterLoaded"),
    onInterfaceReady: register("onInterfaceReady"),
  });

  return { apiInstance, calls, ctx, registered, getModules: () => moduleManager };
}

test("setup registers hooks and exposes versioned API", async () => {
  const fixture = createFixture();

  assert.ok(fixture.apiInstance);
  assert.equal(fixture.apiInstance.getVersion(), "v3.0.8");
  assert.deepEqual(
    Object.keys(fixture.registered).sort(),
    ["onCharacterLoaded", "onCharacterSelectionLoaded", "onInterfaceReady", "onModsLoaded"],
  );

  await fixture.registered.onModsLoaded(fixture.ctx);
  await fixture.registered.onCharacterLoaded({ id: "character" });
  await fixture.registered.onInterfaceReady({ id: "ui" });

  assert.equal(fixture.apiInstance.getModules(), fixture.getModules());
  assert.deepEqual(fixture.apiInstance.getViews(), ["export", "changelog"]);
  assert.deepEqual(fixture.calls, [
    ["register", "onModsLoaded"],
    ["register", "onCharacterSelectionLoaded"],
    ["register", "onCharacterLoaded"],
    ["register", "onInterfaceReady"],
    ["register", "api"],
    ["ctx.loadModule", "modules/compositionRoot.mjs"],
    ["compositionRoot.createSetupComposition"],
    ["ctx.loadModule", "modules/melvorRuntime.mjs"],
    ["runtime.loadModule", fixture.ctx, "modules.mjs"],
    ["modules.onModuleLoad", fixture.ctx, "v3.0.8"],
    ["app.createCollectDataUseCase"],
    ["collectData", false, 50],
    ["app.loadCharacterData", "settings", "character", "account", { extractEta: false, timeBuffer: 50 }],
    ["collectData", true, 125],
    ["app.prepareInterface", { id: "ui" }, { extractEta: true, timeBuffer: 125 }],
  ]);
});
