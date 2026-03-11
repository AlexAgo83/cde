import test from "node:test";
import assert from "node:assert/strict";

import {
  describePatchTargetResolution,
  getNextEtaPosition,
  getNextEtaSize,
  getNextEtaVisibility,
  getPanelRefreshDecision,
  resolvePatchTarget,
  renderEtaPanelShell,
  resolveWorkerActionID,
  shouldHidePanelForContext,
  shouldRunGlobalTick,
} from "../modules/pagesRuntime.mjs";

test("pagesRuntime resolves worker action identifiers and page visibility rules", () => {
  assert.equal(resolveWorkerActionID("AltMagic", false), "Magic");
  assert.equal(resolveWorkerActionID("AltMagic", true), "AltMagic");

  assert.equal(
    shouldHidePanelForContext({
      userPage: { localID: "Magic" },
      activeAction: { localID: "Magic" },
      localID: "AltMagic",
      isCombat: false,
    }),
    false,
  );
  assert.equal(
    shouldHidePanelForContext({
      userPage: { localID: "AltMagic" },
      activeAction: { localID: "Magic" },
      localID: "AltMagic",
      isCombat: false,
    }),
    false,
  );
  assert.equal(
    shouldHidePanelForContext({
      userPage: { localID: "Fishing" },
      activeAction: { localID: "Fishing" },
      localID: "Fishing",
      isCombat: false,
    }),
    false,
  );
  assert.equal(
    shouldHidePanelForContext({
      userPage: { localID: "Crafting" },
      activeAction: { localID: "melvorF:Red_Dhide_Body" },
      localID: "Crafting",
      isCombat: false,
    }),
    false,
  );
  assert.equal(
    shouldHidePanelForContext({
      userPage: null,
      activeAction: { localID: "Crafting" },
      localID: "Crafting",
      isCombat: false,
    }),
    false,
  );
});

test("pagesRuntime computes global tick and control transitions", () => {
  assert.equal(shouldRunGlobalTick({ lastTick: null, now: 1000, minTick: 50 }), true);
  assert.equal(shouldRunGlobalTick({ lastTick: 980, now: 1000, minTick: 50 }), false);
  assert.equal(shouldRunGlobalTick({ lastTick: 900, now: 1000, minTick: 50 }), true);

  assert.equal(getNextEtaPosition("cde-btn-eta-displayLeft", "center"), "left");
  assert.equal(getNextEtaPosition("cde-btn-eta-displayRight", "left"), "center");
  assert.equal(getNextEtaPosition("noop", "right"), "right");

  assert.equal(getNextEtaSize("cde-btn-eta-displaySmall", "large"), "small");
  assert.equal(getNextEtaSize("cde-btn-eta-displaySmall", "small"), "large");
  assert.equal(getNextEtaVisibility("cde-btn-eta-extra", true), false);
  assert.equal(getNextEtaVisibility("noop", false), false);
});

test("pagesRuntime resolves the first patchable constructor candidate", () => {
  function RuntimeCtor() {}
  function FallbackCtor() {}

  assert.equal(resolvePatchTarget(null, RuntimeCtor, FallbackCtor), RuntimeCtor);
  assert.equal(resolvePatchTarget(undefined, null, FallbackCtor), FallbackCtor);
  assert.equal(resolvePatchTarget(undefined, null, {}), null);
});

test("pagesRuntime describes patch target selection and method availability", () => {
  function GlobalCtor() {}
  GlobalCtor.prototype.tick = function tick() {};
  function FallbackCtor() {}

  const diagnostics = describePatchTargetResolution({
    label: "Game",
    method: "tick",
    globalTarget: GlobalCtor,
    fallbackTargets: [FallbackCtor],
  });

  assert.equal(diagnostics.globalTargetName, "GlobalCtor");
  assert.equal(diagnostics.globalHasMethod, true);
  assert.deepEqual(diagnostics.globalCandidates, [
    { path: "direct", type: "function", name: "GlobalCtor", hasMethod: true },
  ]);
  assert.equal(diagnostics.selectedTargetName, "GlobalCtor");
  assert.equal(diagnostics.selectedSource, "global:direct");
  assert.equal(diagnostics.selectedHasMethod, true);
  assert.equal(diagnostics.isPatchable, true);
  assert.deepEqual(diagnostics.fallbackTargets, [
    {
      index: 0,
      inputType: "function",
      inputConstructorName: "Function",
      resolutions: [
        { path: "direct", type: "function", name: "FallbackCtor", hasMethod: false },
      ],
    },
  ]);
});

test("pagesRuntime reports unpatchable targets when the selected constructor lacks the method", () => {
  function FallbackCtor() {}

  const diagnostics = describePatchTargetResolution({
    label: "CombatManager",
    method: "onEnemyDeath",
    globalTarget: undefined,
    fallbackTargets: [FallbackCtor],
  });

  assert.equal(diagnostics.globalTargetType, "undefined");
  assert.equal(diagnostics.selectedTargetName, "FallbackCtor");
  assert.equal(diagnostics.selectedSource, "fallback:0:direct");
  assert.equal(diagnostics.selectedHasMethod, false);
  assert.equal(diagnostics.isPatchable, false);
});

test("pagesRuntime resolves constructors from runtime instance prototype chains", () => {
  function RuntimeCtor() {}
  RuntimeCtor.prototype.stop = function stop() {};

  const instance = Object.create(RuntimeCtor.prototype);
  instance.constructor = Object;

  const diagnostics = describePatchTargetResolution({
    label: "Skill",
    method: "stop",
    globalTarget: undefined,
    fallbackTargets: [instance],
  });

  assert.equal(diagnostics.selectedTargetName, "RuntimeCtor");
  assert.equal(diagnostics.selectedSource, "fallback:0:prototype:1.constructor");
  assert.equal(diagnostics.selectedHasMethod, true);
  assert.equal(diagnostics.isPatchable, true);
  assert.deepEqual(diagnostics.fallbackTargets[0], {
    index: 0,
    inputType: "object",
    inputConstructorName: "Object",
    resolutions: [
      { path: "prototype:1.constructor", type: "function", name: "RuntimeCtor", hasMethod: true },
    ],
  });
});

test("pagesRuntime computes refresh throttling and shared panel shell markup", () => {
  const first = getPanelRefreshDecision(null, new Date("2026-03-10T10:00:00.000Z"));
  assert.equal(first.shouldRefresh, true);

  const second = getPanelRefreshDecision(
    first.nextLastCallTime,
    new Date("2026-03-10T10:00:00.010Z"),
  );
  assert.equal(second.shouldRefresh, false);

  const third = getPanelRefreshDecision(
    first.nextLastCallTime,
    new Date("2026-03-10T10:00:00.040Z"),
  );
  assert.equal(third.shouldRefresh, true);

  const html = renderEtaPanelShell({
    identity: "fishing",
    summaryId: "summary-fishing",
    etaData: "<div>ETA</div>",
    controlsPanel: "<button />",
    etaSize: "small",
    isEtaVisible: false,
  });
  assert.match(html, /cde-fishing-panel/);
  assert.match(html, /cde-eta-summary-small/);
  assert.match(html, /cde-eta-generic-flat/);
  assert.match(html, /<button \/>/);
});
