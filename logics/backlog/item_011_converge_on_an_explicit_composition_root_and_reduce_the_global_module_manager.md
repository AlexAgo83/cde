## item_011_converge_on_an_explicit_composition_root_and_reduce_the_global_module_manager - Converge on an explicit composition root and reduce the global module manager
> From version: 3.0.0
> Status: Done
> Understanding: 97%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Even after the major seams land, the architecture can remain trapped in a hybrid state if the global module manager stays the main dependency hub.
- That would preserve hidden coupling and lifecycle ambiguity.
- This item converges the rewrite around a clearer composition root and a reduced service-locator role.

# Scope
- In:
- clarify ownership of startup wiring and dependency composition
- reduce the broad coordinating role currently played by `modules.mjs`
- validate startup and core feature wiring through local checks and CI-backed scenarios
- Out:
- adopting a heavyweight DI framework
- rewriting bootstrap from scratch in one pass
- redesigning features that are already stable

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: A composition-root convergence slice is defined around explicit dependency wiring and reduced service-locator usage.
- AC2: Startup and feature wiring remain stable while composition ownership becomes clearer.
- AC3: The item is coordinated through the shared orchestration task and regular `logics` updates.

# AC Traceability
- AC1 -> Scope defines the convergence target for composition and lifecycle ownership.
- AC2 -> Acceptance criteria preserve startup behavior while reducing hidden dependency routing.
- AC3 -> Links and notes connect the item to the umbrella task.

# Links
- Request: `req_012_converge_on_an_explicit_composition_root_and_reduce_the_global_module_manager`
- Primary task(s): `task_015_reduce_service_locator_reads_in_feature_modules`, `task_016_introduce_an_explicit_composition_root_for_startup_wiring`, `task_004_orchestrate_incremental_rewrite_execution_governance_and_validation`

# Priority
- Impact: P3. Convergence is high leverage once the main architecture seams are already in place.
- Urgency: Medium-low. It should follow the earlier seam and boundary work.

# Notes
- Derived from request `req_012_converge_on_an_explicit_composition_root_and_reduce_the_global_module_manager`.
- Source file: `logics/request/req_012_converge_on_an_explicit_composition_root_and_reduce_the_global_module_manager.md`.
- Execution order: 8 of 11 rewrite items.
- Dependencies: `item_004` through `item_010` materially in place.
- Execution slices:
- reduce service-locator fanout first
- converge startup wiring into a composition root second
- Current delivery state:
- service-locator fanout is reduced in `modules/appOrchestrator.mjs` and `modules/viewerActions.mjs` through explicit dependency bundles
- startup wiring is now owned by `modules/compositionRoot.mjs`, with `setup.mjs` reduced to lifecycle hook registration
