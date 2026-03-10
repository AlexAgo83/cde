## task_010_normalize_melvor_runtime_and_loader_adapters - Normalize Melvor runtime and loader adapters
> From version: 3.0.0
> Status: Done
> Understanding: 97%
> Confidence: 98%
> Progress: 100%
> Complexity: Medium
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog item `item_008_normalize_melvor_and_browser_runtime_adapters`.
- Source file: `logics/backlog/item_008_normalize_melvor_and_browser_runtime_adapters.md`.
- Related request(s): `req_009_normalize_melvor_and_browser_runtime_adapters`.

```mermaid
flowchart LR
    Backlog[Backlog source] --> Step1[Map Melvor runtime access]
    Step1 --> Step2[Define Melvor and loader adapters]
    Step2 --> Step3[Rewire runtime consumers]
    Step3 --> Validation[Validation]
    Validation --> Report[Report and Done]
```

# Plan
- [x] 1. Audit direct Melvor runtime and loader access such as `game`, `ui`, `Swal`, hooks, and patch APIs across setup, pages, viewer, and feature modules.
- [x] 2. Introduce explicit Melvor runtime and loader adapters that narrow ownership of those accesses.
- [x] 3. Rewire consumers onto the adapters and add focused smoke checks or tests for the new runtime contracts.
- [x] FINAL: Update related Logics docs

# AC Traceability
- AC1 -> Step 1 and Step 2. Proof: explicit Melvor runtime and loader adapter boundaries.
- AC2 -> Step 2 and Step 3. Proof: preserved side effects and local validation.
- AC3 -> FINAL. Proof: updated `logics` docs and regular commits.

# Links
- Backlog item: `item_008_normalize_melvor_and_browser_runtime_adapters`
- Request(s): `req_009_normalize_melvor_and_browser_runtime_adapters`
- Orchestration task: `task_004_orchestrate_incremental_rewrite_execution_governance_and_validation`

# Validation
- `bash validate.sh`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `python3 -m unittest discover -s tests -p "test_*.py" -v`
- `node --test tests/test_utils.mjs tests/test_export_domain.mjs tests/test_settings_domain.mjs tests/test_eta_domain.mjs tests/test_app_orchestrator.mjs tests/test_browser_runtime.mjs tests/test_melvor_runtime.mjs`
- run the new Melvor-adapter test or smoke-check file added by this slice

# Definition of Done (DoD)
- [x] Scope implemented and acceptance criteria covered.
- [x] Validation commands executed and results captured.
- [x] Linked request/backlog/task docs updated.
- [x] Status is `Done` and progress is `100%`.

# Report
- Extracted `modules/melvorRuntime.mjs` as the explicit adapter for `game`, `ui`, runtime globals, module loading, and patch registration.
- Rewired runtime helper access across collector, export, cloud storage, local storage, ETA, notification, viewer, pages, and panel modules onto the Melvor adapter.
- Rewired loader and patch hotspots in `setup.mjs`, `modules/viewer.mjs`, and `modules/pages.mjs` to use the runtime adapter for module loading and patch registration.
- Added `tests/test_melvor_runtime.mjs` to validate runtime-global access and loader adapter delegation.
- Validation executed:
- `node --test tests/test_utils.mjs tests/test_export_domain.mjs tests/test_settings_domain.mjs tests/test_eta_domain.mjs tests/test_app_orchestrator.mjs tests/test_browser_runtime.mjs tests/test_melvor_runtime.mjs`
- `python3 -m unittest discover -s tests -p "test_*.py" -v`
- `bash validate.sh`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `python3 logics/skills/logics-flow-manager/scripts/workflow_audit.py`
