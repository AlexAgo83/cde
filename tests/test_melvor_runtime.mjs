import test from "node:test";
import assert from "node:assert/strict";

import { createMelvorRuntime } from "../modules/melvorRuntime.mjs";

test("melvor runtime exposes game ui and named globals", () => {
  const runtime = createMelvorRuntime({
    game: { id: "game" },
    ui: { id: "ui" },
    CombatManager: function CombatManager() {},
  });

  assert.deepEqual(runtime.getGame(), { id: "game" });
  assert.deepEqual(runtime.getUi(), { id: "ui" });
  assert.equal(runtime.getGlobal("CombatManager").name, "CombatManager");
});

test("melvor runtime resolves game ui and globals from window-like fallback scopes", () => {
  const hostWindow = {
    game: { id: "window-game" },
    ui: { id: "window-ui" },
    CombatManager: function CombatManager() {},
  };
  const runtime = createMelvorRuntime({
    window: hostWindow,
  });

  assert.deepEqual(runtime.getGame(), { id: "window-game" });
  assert.deepEqual(runtime.getUi(), { id: "window-ui" });
  assert.equal(runtime.getGlobal("CombatManager").name, "CombatManager");
});

test("melvor runtime prefers direct Melvor identifiers before host scope properties", () => {
  const directGame = { id: "direct-game" };
  const directUi = { id: "direct-ui" };
  function DirectCombatManager() {}

  const runtime = createMelvorRuntime(
    {
      game: { id: "env-game" },
      ui: { id: "env-ui" },
      CombatManager: function EnvCombatManager() {},
    },
    {
      resolveDirectName(name) {
        switch (name) {
          case "game":
            return directGame;
          case "ui":
            return directUi;
          case "CombatManager":
            return DirectCombatManager;
          default:
            return undefined;
        }
      },
    },
  );

  assert.equal(runtime.getGame(), directGame);
  assert.equal(runtime.getUi(), directUi);
  assert.equal(runtime.getGlobal("CombatManager"), DirectCombatManager);
});

test("melvor runtime falls back to scope properties when direct Melvor identifiers are unavailable", () => {
  function CombatManager() {}

  const runtime = createMelvorRuntime(
    {
      game: { id: "env-game" },
      ui: { id: "env-ui" },
      CombatManager,
    },
    {
      resolveDirectName() {
        return undefined;
      },
    },
  );

  assert.deepEqual(runtime.getGame(), { id: "env-game" });
  assert.deepEqual(runtime.getUi(), { id: "env-ui" });
  assert.equal(runtime.getGlobal("CombatManager"), CombatManager);
});

test("melvor runtime delegates loader module loading and patching", async () => {
  const calls = [];
  const runtime = createMelvorRuntime({});
  const ctx = {
    async loadModule(path) {
      calls.push(["loadModule", path]);
      return { path };
    },
    patch(target, method) {
      calls.push(["patch", target, method]);
      return { target, method };
    },
  };

  const loaded = await runtime.loadModule(ctx, "modules/pages.mjs");
  const patched = runtime.patch(ctx, "CombatManager", "stop");

  assert.deepEqual(loaded, { path: "modules/pages.mjs" });
  assert.deepEqual(patched, { target: "CombatManager", method: "stop" });
  assert.deepEqual(calls, [
    ["loadModule", "modules/pages.mjs"],
    ["patch", "CombatManager", "stop"],
  ]);
});
