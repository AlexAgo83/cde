## task_008_define_application_orchestration_between_domain_and_runtime_adapters - Define application orchestration between domain and runtime adapters
> From version: 3.0.0
> Status: Done
> Understanding: 97%
> Confidence: 98%
> Progress: 100%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog item `item_007_define_application_orchestration_between_domain_and_runtime_adapters`.
- Source file: `logics/backlog/item_007_define_application_orchestration_between_domain_and_runtime_adapters.md`.
- Related request(s): `req_008_define_application_orchestration_between_domain_and_runtime_adapters`.

```mermaid
flowchart LR
    Backlog[Backlog source] --> Step1[Map workflow coordination]
    Step1 --> Step2[Introduce use case orchestration]
    Step2 --> Step3[Rewire feature flows]
    Step3 --> Validation[Validation]
    Validation --> Report[Report and Done]
```

# Plan
- [x] 1. Audit current workflow coordination in `setup.mjs`, `modules.mjs`, and key runtime-facing feature modules to identify where startup, export, settings, and ETA use cases are still implicit.
- [x] 2. Introduce application-orchestration modules or use cases that coordinate domain logic and adapters without owning low-level runtime APIs or direct UI rendering.
- [x] 3. Rewire the main flows onto those orchestrators and add focused validation for startup sequencing and core feature flows.
- [x] FINAL: Update related Logics docs

# AC Traceability
- AC1 -> Step 1 and Step 2. Proof: explicit orchestration responsibilities and modules.
- AC2 -> Step 2 and Step 3. Proof: preserved startup and feature flows with local validation.
- AC3 -> FINAL. Proof: updated `logics` docs and regular commits.

# Links
- Backlog item: `item_007_define_application_orchestration_between_domain_and_runtime_adapters`
- Request(s): `req_008_define_application_orchestration_between_domain_and_runtime_adapters`
- Orchestration task: `task_004_orchestrate_incremental_rewrite_execution_governance_and_validation`

# Validation
- `bash validate.sh`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `python3 -m unittest discover -s tests -p "test_*.py" -v`
- `node --test tests/test_utils.mjs tests/test_export_domain.mjs tests/test_settings_domain.mjs tests/test_eta_domain.mjs tests/test_app_orchestrator.mjs`
- run the new orchestration-focused test file or smoke checks added by this slice

# Definition of Done (DoD)
- [x] Scope implemented and acceptance criteria covered.
- [x] Validation commands executed and results captured.
- [x] Linked request/backlog/task docs updated.
- [x] Status is `Done` and progress is `100%`.

# Report
- Extracted `modules/appOrchestrator.mjs` to own startup collection, auto-export-on-load, and interface-ready orchestration between the module manager and runtime-facing adapters.
- Rewired `setup.mjs` to delegate character-load and interface-ready flows through the orchestrator instead of coordinating those decisions inline.
- Added `tests/test_app_orchestrator.mjs` to validate startup sequencing, collect-data wiring, auto-export fallback behavior, and interface-ready callback order.
- Validation executed:
- `node --test tests/test_utils.mjs tests/test_export_domain.mjs tests/test_settings_domain.mjs tests/test_eta_domain.mjs tests/test_app_orchestrator.mjs`
- `python3 -m unittest discover -s tests -p "test_*.py" -v`
- `bash validate.sh`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `python3 logics/skills/logics-flow-manager/scripts/workflow_audit.py`
