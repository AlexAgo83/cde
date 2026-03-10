## task_015_reduce_service_locator_reads_in_feature_modules - Reduce service locator reads in feature modules
> From version: 3.0.0
> Status: Done
> Understanding: 96%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog item `item_011_converge_on_an_explicit_composition_root_and_reduce_the_global_module_manager`.
- Source file: `logics/backlog/item_011_converge_on_an_explicit_composition_root_and_reduce_the_global_module_manager.md`.
- Related request(s): `req_012_converge_on_an_explicit_composition_root_and_reduce_the_global_module_manager`.

```mermaid
flowchart LR
    Backlog[Backlog source] --> Step1[Inventory service locator reads]
    Step1 --> Step2[Replace high leverage call sites]
    Step2 --> Step3[Validate reduced dependency fanout]
    Step3 --> Validation[Validation]
    Validation --> Report[Report and Done]
```

# Plan
- [x] 1. Audit feature modules for broad `mods.get...` or equivalent service-locator reads that should be replaced by clearer dependency boundaries first.
- [x] 2. Replace the highest-leverage call sites with explicit injected dependencies or orchestrated access paths without changing behavior.
- [x] 3. Validate the reduced dependency fanout through local checks and document the remaining service-locator hotspots before the composition-root task.
- [x] FINAL: Update related Logics docs

# AC Traceability
- AC1 -> Step 1 and Step 2. Proof: reduced service-locator usage in feature modules.
- AC2 -> Step 2 and Step 3. Proof: preserved startup and feature behavior with local validation.
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
- This task prepares the composition-root work by shrinking the hidden dependency graph first.
- Reduced service-locator reads in `modules/appOrchestrator.mjs` and `modules/viewerActions.mjs` by switching both modules to explicit dependency bundles instead of repeated `mods.get...` lookups at execution time.
- Rewired `modules.mjs` to initialize those modules with explicit dependencies, preserving current behavior while shrinking hidden fanout.
- Preserved existing module-manager compatibility in tests while making the preferred dependency path explicit for the composition-root slice.
- Validation executed:
- `node --test tests/test_utils.mjs tests/test_export_domain.mjs tests/test_settings_domain.mjs tests/test_eta_domain.mjs tests/test_app_orchestrator.mjs tests/test_browser_runtime.mjs tests/test_melvor_runtime.mjs tests/test_viewer_actions.mjs tests/test_panel_renderer.mjs tests/test_collector_adapter.mjs tests/test_collector_domain.mjs tests/test_composition_root.mjs`
- `python3 -m unittest discover -s tests -p "test_*.py" -v`
- `bash validate.sh`
