## task_014_extract_collector_aggregation_behind_collection_adapters - Extract collector aggregation behind collection adapters
> From version: 3.0.0
> Status: Ready
> Understanding: 91%
> Confidence: 93%
> Progress: 0%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog item `item_010_isolate_collector_logic_behind_runtime_collection_adapters`.
- Source file: `logics/backlog/item_010_isolate_collector_logic_behind_runtime_collection_adapters.md`.
- Related request(s): `req_011_isolate_collector_logic_behind_runtime_collection_adapters`.

```mermaid
flowchart LR
    Backlog[Backlog source] --> Step1[Select aggregation rules]
    Step1 --> Step2[Extract collector aggregation]
    Step2 --> Step3[Rewire consumers and validate fixtures]
    Step3 --> Validation[Validation]
    Validation --> Report[Report and Done]
```

# Plan
- [ ] 1. Use the boundaries and fixtures from the preceding collector task to select the aggregation rules that can move behind collection adapters without changing export coverage.
- [ ] 2. Extract collector aggregation logic into a cleaner seam while leaving raw runtime collection access behind explicit adapters.
- [ ] 3. Rewire collector consumers onto the seam and validate the preserved output through fixtures or equivalent controlled checks.
- [ ] FINAL: Update related Logics docs

# AC Traceability
- AC1 -> Step 1 and Step 2. Proof: collector aggregation is separated from runtime collection access.
- AC2 -> Step 2 and Step 3. Proof: preserved export coverage and fixture-based validation.
- AC3 -> FINAL. Proof: updated `logics` docs and regular commits.

# Links
- Backlog item: `item_010_isolate_collector_logic_behind_runtime_collection_adapters`
- Request(s): `req_011_isolate_collector_logic_behind_runtime_collection_adapters`
- Orchestration task: `task_004_orchestrate_incremental_rewrite_execution_governance_and_validation`

# Validation
- `bash validate.sh`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `python3 -m unittest discover -s tests -p "test_*.py" -v`
- `node --test tests/test_utils.mjs`
- run the new collector-aggregation test file added by this slice

# Definition of Done (DoD)
- [ ] Scope implemented and acceptance criteria covered.
- [ ] Validation commands executed and results captured.
- [ ] Linked request/backlog/task docs updated.
- [ ] Status is `Done` and progress is `100%`.

# Report
- This task depends on the fixture and boundary work from `task_013_define_collector_adapter_fixtures_and_boundaries`.
