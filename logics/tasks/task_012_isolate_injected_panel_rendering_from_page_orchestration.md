## task_012_isolate_injected_panel_rendering_from_page_orchestration - Isolate injected panel rendering from page orchestration
> From version: 3.0.0
> Status: Ready
> Understanding: 92%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Derived from backlog item `item_009_establish_a_ui_rendering_boundary_for_injected_views_and_panels`.
- Source file: `logics/backlog/item_009_establish_a_ui_rendering_boundary_for_injected_views_and_panels.md`.
- Related request(s): `req_010_establish_a_ui_rendering_boundary_for_injected_views_and_panels`.

```mermaid
flowchart LR
    Backlog[Backlog source] --> Step1[Map injected panel responsibilities]
    Step1 --> Step2[Separate rendering from page orchestration]
    Step2 --> Step3[Rewire pages module]
    Step3 --> Validation[Validation]
    Validation --> Report[Report and Done]
```

# Plan
- [ ] 1. Audit `modules/pages.mjs` and related render paths to distinguish panel rendering and update code from observers, hooks, and page orchestration.
- [ ] 2. Separate injected panel rendering from page orchestration while preserving current panel behavior.
- [ ] 3. Rewire page integration onto the new boundary and add focused checks for rendering and page lifecycle behavior.
- [ ] FINAL: Update related Logics docs

# AC Traceability
- AC1 -> Step 1 and Step 2. Proof: clearer injected-panel rendering boundary.
- AC2 -> Step 2 and Step 3. Proof: preserved panel behavior and focused validation.
- AC3 -> FINAL. Proof: updated `logics` docs and regular commits.

# Links
- Backlog item: `item_009_establish_a_ui_rendering_boundary_for_injected_views_and_panels`
- Request(s): `req_010_establish_a_ui_rendering_boundary_for_injected_views_and_panels`
- Orchestration task: `task_004_orchestrate_incremental_rewrite_execution_governance_and_validation`

# Validation
- `bash validate.sh`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `python3 -m unittest discover -s tests -p "test_*.py" -v`
- `node --test tests/test_utils.mjs`
- run the new panel-boundary test or smoke-check file added by this slice

# Definition of Done (DoD)
- [ ] Scope implemented and acceptance criteria covered.
- [ ] Validation commands executed and results captured.
- [ ] Linked request/backlog/task docs updated.
- [ ] Status is `Done` and progress is `100%`.

# Report
- Scope of this task:
- injected page panels
- page lifecycle orchestration
- observer and hook interactions that should stay outside rendering
