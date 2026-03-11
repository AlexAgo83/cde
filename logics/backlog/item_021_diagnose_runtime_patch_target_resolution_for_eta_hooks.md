## item_021_diagnose_runtime_patch_target_resolution_for_eta_hooks - Diagnose runtime patch target resolution for ETA hooks
> From version: 3.0.8
> Status: Done
> Understanding: 92%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Reliability
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The mod bootstrap now succeeds, but ETA runtime hooks still fail to attach during live Melvor execution.
- `modules/pages.mjs` logs repeated `Skipping patch for ... target class unavailable` messages for gameplay hooks such as `Game.tick`, `CombatManager`, `Player`, `Enemy`, and multiple skill action/stop handlers.
- Browser-console inspection cannot access the same runtime scope as the mod, so the remaining problem must be diagnosed from inside the mod runtime itself.

# Scope
- In:
- instrument runtime patch target resolution in `modules/pages.mjs`
- log discovered globals, fallback instances, selected constructors, and prototype method availability for each hook target
- evaluate whether patch timing needs a delayed or retried registration path
- preserve the current stabilized bootstrap and current visible ETA behavior while diagnosing the hook layer
- Out:
- redesigning ETA formulas
- changing export schema behavior
- cosmetic UI redesign
- unrelated third-party mod failures that do not affect `CDE` runtime hook attachment

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: Runtime diagnostics make it explicit why each ETA patch target is or is not patchable in live Melvor execution.
- AC2: The diagnosis distinguishes between missing globals, missing fallback instances, missing prototype methods, and timing-related unavailability.
- AC3: The slice preserves current bootstrap behavior and does not widen into unrelated ETA or UI changes.

# AC Traceability
- AC1 -> Scope requires in-mod instrumentation for each runtime hook target.
- AC2 -> Scope explicitly includes constructor and method-resolution diagnostics plus timing evaluation.
- AC3 -> Scope keeps the change bounded to diagnostics and runtime hook stabilization.

# Links
- Request: `req_022_diagnose_runtime_patch_target_resolution_for_eta_hooks`
- Primary task(s): `task_026_diagnose_runtime_patch_target_resolution_for_eta_hooks`

# Priority
- Impact: P2. ETA functionality depends on these runtime hooks attaching successfully during live gameplay.
- Urgency: High. Bootstrap is now stable, so this is the next blocking runtime reliability issue.

# Notes
- Derived from request `req_022_diagnose_runtime_patch_target_resolution_for_eta_hooks`.
- Source file: `logics/request/req_022_diagnose_runtime_patch_target_resolution_for_eta_hooks.md`.
- Current live findings:
- `setup`, `compositionRoot`, module loading, character loading, and interface preparation all complete successfully
- page observers and UI wiring initialize successfully
- runtime patch targets remain unavailable at worker registration time
- browser console scope does not expose `game`, `ui`, Melvor classes, or the public `CDE` API object
- Expected outcome:
- targeted runtime diagnostics should reveal whether the issue is constructor discovery, prototype mismatch, or registration timing
