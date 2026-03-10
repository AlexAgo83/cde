## item_009_establish_a_ui_rendering_boundary_for_injected_views_and_panels - Establish a UI rendering boundary for injected views and panels
> From version: 3.0.0
> Status: Ready
> Understanding: 92%
> Confidence: 94%
> Progress: 0%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- UI rendering, event wiring, and business-triggering logic are still mixed across modals, panels, and injected views.
- That coupling makes UI evolution harder and tends to pull logic back into rendering modules.
- This item establishes a clearer UI boundary so rendering stays distinct from orchestration and domain rules.

# Scope
- In:
- separate rendering and event-binding concerns from business decisions
- keep injected panel and modal behavior stable while clarifying UI ownership
- validate migrated UI boundaries through focused local and CI-backed checks where feasible
- Out:
- visual redesign
- replacing the entire injection mechanism
- collector or ETA redesign unrelated to UI boundary clarification

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: A dedicated UI-boundary slice is defined for modals and injected panels.
- AC2: Current modal, changelog, diff, and panel behavior remain stable while rendering responsibilities become clearer.
- AC3: The item stays coordinated through the shared orchestration task and regular `logics` updates.

# AC Traceability
- AC1 -> Scope defines the UI boundary and target modules.
- AC2 -> Acceptance criteria preserve behavior while reducing logic inside rendering modules.
- AC3 -> Links and notes keep execution tied to the umbrella task.

# Links
- Request: `req_010_establish_a_ui_rendering_boundary_for_injected_views_and_panels`
- Primary task(s): `task_011_separate_modal_rendering_from_viewer_actions`, `task_012_isolate_injected_panel_rendering_from_page_orchestration`, `task_004_orchestrate_incremental_rewrite_execution_governance_and_validation`

# Priority
- Impact: P2. UI boundaries become valuable once adapters and orchestration are clearer.
- Urgency: Medium. It should follow orchestration and adapter normalization.

# Notes
- Derived from request `req_010_establish_a_ui_rendering_boundary_for_injected_views_and_panels`.
- Source file: `logics/request/req_010_establish_a_ui_rendering_boundary_for_injected_views_and_panels.md`.
- Execution order: 6 of 11 rewrite items.
- Dependencies: `item_007_define_application_orchestration_between_domain_and_runtime_adapters`, `item_008_normalize_melvor_and_browser_runtime_adapters`.
- Execution slices:
- modal rendering and viewer actions first
- injected panels and page orchestration second
