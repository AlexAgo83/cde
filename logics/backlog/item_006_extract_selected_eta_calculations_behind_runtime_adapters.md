## item_006_extract_selected_eta_calculations_behind_runtime_adapters - Extract selected ETA calculations behind runtime adapters
> From version: 3.0.0
> Status: Ready
> Understanding: 93%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- ETA logic still mixes reusable calculations with runtime observation and UI refresh behavior.
- That coupling makes ETA changes riskier and harder to validate outside the game.
- This item isolates only the ETA calculations that can safely become a pure seam.

# Scope
- In:
- extract selected pure ETA calculations and helpers
- keep runtime hooks, observers, and UI refresh behavior outside the domain layer
- validate the extracted calculations through local tests and CI
- Out:
- rewriting the full ETA pipeline in one pass
- redesigning ETA UI panels
- changing collector coverage

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: Selected pure ETA calculations are isolated as a dedicated migration slice without rewriting the full ETA system.
- AC2: Current ETA outputs remain stable while extracted calculations become testable outside the live runtime.
- AC3: The slice stays coordinated through the shared orchestration task and regular `logics` updates.

# AC Traceability
- AC1 -> Scope defines which ETA responsibilities move and which remain adapter-facing.
- AC2 -> Acceptance criteria preserve visible ETA behavior while improving validation.
- AC3 -> Links and notes tie delivery to the orchestration task.

# Links
- Request: `req_007_extract_selected_eta_calculations_behind_runtime_adapters`
- Primary task(s): `task_007_extract_selected_eta_calculations_behind_runtime_adapters`, `task_004_orchestrate_incremental_rewrite_execution_governance_and_validation`

# Priority
- Impact: P1. ETA is a high-value seam but carries more runtime risk than export or settings.
- Urgency: Medium-high. It should start after export and preferably after settings.

# Notes
- Derived from request `req_007_extract_selected_eta_calculations_behind_runtime_adapters`.
- Source file: `logics/request/req_007_extract_selected_eta_calculations_behind_runtime_adapters.md`.
- Execution order: 3 of 11 rewrite items.
- Dependencies: `item_004_extract_export_domain_logic_behind_runtime_adapters`, preferably `item_005_extract_settings_domain_logic_behind_storage_adapters`.
