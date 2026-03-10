## task_017_formalize_export_and_settings_contracts - Formalize export and settings contracts
> From version: 3.0.0
> Status: In progress
> Understanding: 96%
> Confidence: 97%
> Progress: 90%
> Complexity: Medium
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog item `item_012_formalize_shared_contracts_and_strengthen_type_checked_data_models`.
- Source file: `logics/backlog/item_012_formalize_shared_contracts_and_strengthen_type_checked_data_models.md`.
- Related request(s): `req_013_formalize_shared_contracts_and_strengthen_type_checked_data_models`.

```mermaid
flowchart LR
    Backlog[Backlog source] --> Step1[Identify export and settings contracts]
    Step1 --> Step2[Formalize shared models]
    Step2 --> Step3[Apply contracts and validate]
    Step3 --> Validation[Validation]
    Validation --> Report[Report and Done]
```

# Plan
- [x] 1. Identify the highest-value shared contract shapes for export payloads, export history or diff records, and settings definitions or normalized values.
- [x] 2. Formalize those contracts using type-checked models compatible with the current codebase.
- [x] 3. Apply the contracts to key modules and tests, then add structural validation alongside existing behavior checks.
- [x] FINAL: Update related Logics docs

# AC Traceability
- AC1 -> Step 1 and Step 2. Proof: explicit export and settings contracts.
- AC2 -> Step 2 and Step 3. Proof: stronger structural expectations without behavior changes.
- AC3 -> FINAL. Proof: updated `logics` docs and regular commits.

# Links
- Backlog item: `item_012_formalize_shared_contracts_and_strengthen_type_checked_data_models`
- Request(s): `req_013_formalize_shared_contracts_and_strengthen_type_checked_data_models`
- Orchestration task: `task_004_orchestrate_incremental_rewrite_execution_governance_and_validation`

# Validation
- `bash validate.sh`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `python3 -m unittest discover -s tests -p "test_*.py" -v`
- `node --test tests/test_utils.mjs tests/test_export_domain.mjs tests/test_settings_domain.mjs tests/test_eta_domain.mjs tests/test_app_orchestrator.mjs tests/test_browser_runtime.mjs tests/test_melvor_runtime.mjs tests/test_viewer_actions.mjs tests/test_panel_renderer.mjs tests/test_collector_adapter.mjs tests/test_collector_domain.mjs tests/test_composition_root.mjs tests/test_contracts.mjs`

# Definition of Done (DoD)
- [x] Scope implemented and acceptance criteria covered.
- [x] Validation commands executed and results captured.
- [x] Linked request/backlog/task docs updated.
- [ ] Status is `Done` and progress is `100%`.

# Report
- Contract families in scope:
- export payloads
- export diff or history records
- settings definitions and normalized values
- Added `modules/contracts.mjs` to formalize shared contracts for settings references, persisted setting entries, export meta payloads, and changes-history maps under the current `@ts-check` model.
- Applied the contracts in `modules/settingsDomain.mjs` and `modules/exportDomain.mjs` so invalid settings references and malformed persisted history maps are filtered out through explicit validators.
- Added `tests/test_contracts.mjs` and extended settings-domain coverage to validate both behavioral and structural expectations for the new contracts.
- Validation executed:
- `node --test tests/test_utils.mjs tests/test_export_domain.mjs tests/test_settings_domain.mjs tests/test_eta_domain.mjs tests/test_app_orchestrator.mjs tests/test_browser_runtime.mjs tests/test_melvor_runtime.mjs tests/test_viewer_actions.mjs tests/test_panel_renderer.mjs tests/test_collector_adapter.mjs tests/test_collector_domain.mjs tests/test_composition_root.mjs tests/test_contracts.mjs`
- `python3 -m unittest discover -s tests -p "test_*.py" -v`
- `bash validate.sh`
