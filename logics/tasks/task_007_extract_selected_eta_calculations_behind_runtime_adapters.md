## task_007_extract_selected_eta_calculations_behind_runtime_adapters - Extract selected ETA calculations behind runtime adapters
> From version: 3.0.0
> Status: Done
> Understanding: 97%
> Confidence: 98%
> Progress: 100%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog item `item_006_extract_selected_eta_calculations_behind_runtime_adapters`.
- Source file: `logics/backlog/item_006_extract_selected_eta_calculations_behind_runtime_adapters.md`.
- Related request(s): `req_007_extract_selected_eta_calculations_behind_runtime_adapters`.

```mermaid
flowchart LR
    Backlog[Backlog source] --> Step1[Select pure ETA rules]
    Step1 --> Step2[Extract ETA calculators]
    Step2 --> Step3[Rewire runtime consumers and add tests]
    Step3 --> Validation[Validation]
    Validation --> Report[Report and Done]
```

# Plan
- [x] 1. Audit `modules/eta.mjs`, `modules/pages.mjs`, `modules/collector.mjs`, and supporting helpers to identify ETA rules that can become pure calculations without taking runtime hooks or UI refresh logic with them.
- [x] 2. Extract those calculations into a dedicated ETA-domain module with normalized inputs and outputs, leaving runtime observation and panel refresh behavior outside the seam.
- [x] 3. Rewire ETA consumers onto the extracted seam and add focused tests for rates, durations, summaries, and preserved ETA outputs.
- [x] FINAL: Update related Logics docs

# AC Traceability
- AC1 -> Step 1 and Step 2. Proof: selected pure ETA calculations extracted into a domain module.
- AC2 -> Step 2 and Step 3. Proof: preserved ETA outputs and local tests.
- AC3 -> FINAL. Proof: updated `logics` docs and regular commits.

# Links
- Backlog item: `item_006_extract_selected_eta_calculations_behind_runtime_adapters`
- Request(s): `req_007_extract_selected_eta_calculations_behind_runtime_adapters`
- Orchestration task: `task_004_orchestrate_incremental_rewrite_execution_governance_and_validation`

# Validation
- `bash validate.sh`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `python3 -m unittest discover -s tests -p "test_*.py" -v`
- `node --test tests/test_utils.mjs`
- run the new ETA-domain test file added by this slice

# Definition of Done (DoD)
- [x] Scope implemented and acceptance criteria covered.
- [x] Validation commands executed and results captured.
- [x] Linked request/backlog/task docs updated.
- [x] Status is `Done` and progress is `100%`.

# Report
- Extracted `modules/etaDomain.mjs` as a pure ETA seam for reusable rate, DPS, duration, combat-summary, and XP-prediction calculations.
- Rewired `modules/eta.mjs` to consume the ETA domain helpers while keeping runtime hooks, page observers, and UI refresh timing outside the seam.
- Added `tests/test_eta_domain.mjs` and extended CI coverage for the new domain module.
- Validation executed:
- `node --test tests/test_utils.mjs tests/test_export_domain.mjs tests/test_settings_domain.mjs tests/test_eta_domain.mjs`
- `python3 -m unittest discover -s tests -p "test_*.py" -v`
- `bash validate.sh`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `python3 logics/skills/logics-flow-manager/scripts/workflow_audit.py`
