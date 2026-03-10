## item_020_harden_page_runtime_lifecycle_and_panel_worker_boundaries - Harden page runtime lifecycle and panel worker boundaries
> From version: 3.0.1
> Status: In progress
> Understanding: 96%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Reliability
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The remaining runtime-heavy hotspot is the page lifecycle around injected ETA panels.
- `modules/pages.mjs` still concentrates observer registration, worker refresh flow, page matching, and visibility decisions.
- `pages/combatPanel.mjs` and `pages/nonCombatPanel.mjs` still carry DOM-facing refresh logic that is difficult to validate when lifecycle boundaries stay implicit.

# Scope
- In:
- harden `modules/pages.mjs`, `pages/combatPanel.mjs`, and `pages/nonCombatPanel.mjs`
- clarify observer, worker refresh, panel visibility, and notification/control-panel boundaries
- add direct local validation for runtime lifecycle behavior
- preserve current ETA panel behavior
- Out:
- redesigning ETA formulas
- changing export schema behavior
- cosmetic redesign of panel markup

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: Page lifecycle responsibilities are clarified only as needed to reduce observer, worker, and visibility fragility.
- AC2: Targeted local validation covers panel refresh, page matching, and visibility behavior without requiring live Melvor execution.
- AC3: Current ETA panel behavior remains unchanged from a user perspective.

# AC Traceability
- AC1 -> Scope defines a bounded lifecycle hardening slice.
- AC2 -> Acceptance criteria require direct local validation.
- AC3 -> Scope preserves current ETA panel behavior.

# Links
- Request: `req_021_harden_page_runtime_lifecycle_and_panel_worker_boundaries`
- Primary task(s): `task_025_harden_page_runtime_lifecycle_and_panel_worker_boundaries`

# Priority
- Impact: P2. This is the biggest remaining runtime hotspot after the adapter and release-gate work.
- Urgency: Medium. It should land before a final in-game validation pass.

# Notes
- Derived from request `req_021_harden_page_runtime_lifecycle_and_panel_worker_boundaries`.
- Source file: `logics/request/req_021_harden_page_runtime_lifecycle_and_panel_worker_boundaries.md`.
- Outcome:
- None yet.
