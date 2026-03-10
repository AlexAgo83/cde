## task_016_introduce_an_explicit_composition_root_for_startup_wiring - Introduce an explicit composition root for startup wiring
> From version: 3.0.0
> Status: Done
> Understanding: 96%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog item `item_011_converge_on_an_explicit_composition_root_and_reduce_the_global_module_manager`.
- Source file: `logics/backlog/item_011_converge_on_an_explicit_composition_root_and_reduce_the_global_module_manager.md`.
- Related request(s): `req_012_converge_on_an_explicit_composition_root_and_reduce_the_global_module_manager`.

```mermaid
flowchart LR
    Backlog[Backlog source] --> Step1[Design startup composition root]
    Step1 --> Step2[Move wiring into composition root]
    Step2 --> Step3[Validate startup and feature wiring]
    Step3 --> Validation[Validation]
    Validation --> Report[Report and Done]
```

# Plan
- [x] 1. Define the explicit composition-root responsibilities for startup wiring after the service-locator fanout has been reduced.
- [x] 2. Move dependency construction and startup wiring toward the composition root while keeping feature behavior stable.
- [x] 3. Validate startup and core feature wiring through local smoke checks and update the architecture docs to reflect the new ownership.
- [x] FINAL: Update related Logics docs

# AC Traceability
- AC1 -> Step 1 and Step 2. Proof: explicit composition-root responsibilities and wiring changes.
- AC2 -> Step 2 and Step 3. Proof: preserved startup and feature wiring with local validation.
- AC3 -> FINAL. Proof: updated `logics` docs and regular commits.

# Links
- Backlog item: `item_011_converge_on_an_explicit_composition_root_and_reduce_the_global_module_manager`
- Request(s): `req_012_converge_on_an_explicit_composition_root_and_reduce_the_global_module_manager`
- Orchestration task: `task_004_orchestrate_incremental_rewrite_execution_governance_and_validation`

# Validation
- `bash validate.sh`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `python3 -m unittest discover -s tests -p "test_*.py" -v`
- `node --test tests/test_utils.mjs tests/test_export_domain.mjs tests/test_settings_domain.mjs tests/test_eta_domain.mjs tests/test_app_orchestrator.mjs tests/test_browser_runtime.mjs tests/test_melvor_runtime.mjs tests/test_viewer_actions.mjs tests/test_panel_renderer.mjs tests/test_collector_adapter.mjs tests/test_collector_domain.mjs tests/test_composition_root.mjs`

# Definition of Done (DoD)
- [x] Scope implemented and acceptance criteria covered.
- [x] Validation commands executed and results captured.
- [x] Linked request/backlog/task docs updated.
- [x] Status is `Done` and progress is `100%`.

# Report
- This task should start only after `task_015_reduce_service_locator_reads_in_feature_modules` has materially reduced hidden dependency routing.
- Added `modules/compositionRoot.mjs` as the explicit startup composition root that owns module loading, character-data startup, interface preparation, and API exposure for `setup.mjs`.
- Simplified `setup.mjs` so it now wires lifecycle hooks through the composition root instead of keeping startup state and API wiring inline.
- Added `tests/test_composition_root.mjs` to validate module loading, lifecycle delegation, API generation, and debug helper behavior through controlled fixtures.
- Validation executed:
- `node --test tests/test_utils.mjs tests/test_export_domain.mjs tests/test_settings_domain.mjs tests/test_eta_domain.mjs tests/test_app_orchestrator.mjs tests/test_browser_runtime.mjs tests/test_melvor_runtime.mjs tests/test_viewer_actions.mjs tests/test_panel_renderer.mjs tests/test_collector_adapter.mjs tests/test_collector_domain.mjs tests/test_composition_root.mjs`
- `python3 -m unittest discover -s tests -p "test_*.py" -v`
- `bash validate.sh`
