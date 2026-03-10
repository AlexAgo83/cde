## item_008_normalize_melvor_and_browser_runtime_adapters - Normalize Melvor and browser runtime adapters
> From version: 3.0.0
> Status: Ready
> Understanding: 93%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The codebase still reads Melvor globals and browser services directly in too many places.
- That keeps runtime dependencies hard to inventory and undermines the gains from domain extraction.
- This item normalizes runtime adapters so side effects have clearer owners and cleaner boundaries.

# Scope
- In:
- define stable adapter boundaries for Melvor runtime and browser services
- reduce scattered direct access to runtime globals and browser APIs
- validate adapter-backed behavior through local tests and CI-backed checks where possible
- Out:
- rewriting all runtime-facing code in one pass
- changing product behavior for its own sake
- domain redesign already covered by earlier items

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: A dedicated adapter-normalization slice is defined for Melvor and browser services.
- AC2: Direct runtime and browser access are reduced while current side effects and visible behavior remain stable.
- AC3: The item is governed through the shared orchestration task with regular `logics` updates and commits.

# AC Traceability
- AC1 -> Scope identifies adapter categories and responsibilities.
- AC2 -> Acceptance criteria preserve behavior while reducing raw runtime access.
- AC3 -> Links and notes tie the item to the umbrella task.

# Links
- Request: `req_009_normalize_melvor_and_browser_runtime_adapters`
- Primary task(s): `task_009_normalize_browser_facing_runtime_adapters`, `task_010_normalize_melvor_runtime_and_loader_adapters`, `task_004_orchestrate_incremental_rewrite_execution_governance_and_validation`

# Priority
- Impact: P2. Adapter normalization is essential once domain and orchestration seams exist.
- Urgency: Medium. It should follow the orchestration slice.

# Notes
- Derived from request `req_009_normalize_melvor_and_browser_runtime_adapters`.
- Source file: `logics/request/req_009_normalize_melvor_and_browser_runtime_adapters.md`.
- Execution order: 5 of 11 rewrite items.
- Dependencies: `item_007_define_application_orchestration_between_domain_and_runtime_adapters`.
- Execution slices:
- browser-facing adapters first
- Melvor runtime and loader adapters second
