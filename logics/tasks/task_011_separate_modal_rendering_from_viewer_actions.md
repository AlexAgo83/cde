## task_011_separate_modal_rendering_from_viewer_actions - Separate modal rendering from viewer actions
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
    Backlog[Backlog source] --> Step1[Map modal rendering and actions]
    Step1 --> Step2[Separate view code from actions]
    Step2 --> Step3[Rewire viewer interactions]
    Step3 --> Validation[Validation]
    Validation --> Report[Report and Done]
```

# Plan
- [ ] 1. Audit `views/exportView.mjs`, `views/changelogView.mjs`, and `modules/viewer.mjs` to identify rendering responsibilities versus action and flow responsibilities.
- [ ] 2. Separate modal rendering logic from viewer-triggered actions while preserving current modal behavior.
- [ ] 3. Rewire modal interactions onto the cleaner boundary and add focused checks for modal rendering and action dispatch.
- [ ] FINAL: Update related Logics docs

# AC Traceability
- AC1 -> Step 1 and Step 2. Proof: clearer modal boundary between rendering and actions.
- AC2 -> Step 2 and Step 3. Proof: preserved modal behavior and focused validation.
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
- run the new modal-boundary test or smoke-check file added by this slice

# Definition of Done (DoD)
- [ ] Scope implemented and acceptance criteria covered.
- [ ] Validation commands executed and results captured.
- [ ] Linked request/backlog/task docs updated.
- [ ] Status is `Done` and progress is `100%`.

# Report
- Scope of this task:
- export modal
- changelog modal
- viewer-triggered actions that currently leak into rendering modules
