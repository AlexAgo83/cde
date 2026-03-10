## task_013_define_collector_adapter_fixtures_and_boundaries - Define collector adapter fixtures and boundaries
> From version: 3.0.0
> Status: Ready
> Understanding: 91%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog item `item_010_isolate_collector_logic_behind_runtime_collection_adapters`.
- Source file: `logics/backlog/item_010_isolate_collector_logic_behind_runtime_collection_adapters.md`.
- Related request(s): `req_011_isolate_collector_logic_behind_runtime_collection_adapters`.

```mermaid
flowchart LR
    Backlog[Backlog source] --> Step1[Map collector inputs and outputs]
    Step1 --> Step2[Define boundaries and fixtures]
    Step2 --> Step3[Add fixture driven validation]
    Step3 --> Validation[Validation]
    Validation --> Report[Report and Done]
```

# Plan
- [ ] 1. Audit `modules/collector.mjs` and its consumers to map runtime inputs, aggregation outputs, and the first viable collection adapter boundaries.
- [ ] 2. Define collector fixtures and adapter contracts that allow later extraction without changing current export coverage.
- [ ] 3. Add fixture-driven tests or equivalent validation that exercise the new boundaries and document how they support the later extraction task.
- [ ] FINAL: Update related Logics docs

# AC Traceability
- AC1 -> Step 1 and Step 2. Proof: explicit collector boundaries and fixtures.
- AC2 -> Step 2 and Step 3. Proof: preserved data coverage assumptions and fixture-driven validation.
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
- run the new collector-fixture test file added by this slice

# Definition of Done (DoD)
- [ ] Scope implemented and acceptance criteria covered.
- [ ] Validation commands executed and results captured.
- [ ] Linked request/backlog/task docs updated.
- [ ] Status is `Done` and progress is `100%`.

# Report
- Purpose of this task:
- make collector extraction possible later
- avoid mixing boundary definition and full aggregation migration in one step
