## item_007_define_application_orchestration_between_domain_and_runtime_adapters - Define application orchestration between domain and runtime adapters
> From version: 3.0.0
> Status: Ready
> Understanding: 93%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Even after domain seams are introduced, workflow coordination can remain scattered across setup and feature modules.
- That would limit the value of the rewrite by preserving implicit lifecycle and flow decisions.
- This item defines the application-orchestration layer that coordinates domain logic and adapters explicitly.

# Scope
- In:
- define use-case level orchestration for startup and major feature flows
- move coordination responsibilities out of scattered runtime-facing modules
- validate key orchestrated flows through local tests and CI-backed checks where possible
- Out:
- redesigning domain rules already owned by earlier items
- rewriting every module at once
- visual UI redesign

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: A dedicated orchestration slice is defined around explicit use cases and workflow coordination.
- AC2: Startup, export, settings, and ETA flows remain stable while coordination responsibilities move to a clearer layer.
- AC3: The item is sequenced through the shared orchestration task with regular `logics` updates and commits.

# AC Traceability
- AC1 -> Scope defines orchestration ownership distinctly from domain or adapter work.
- AC2 -> Acceptance criteria preserve behavior while relocating coordination responsibilities.
- AC3 -> Links and notes connect the item to the umbrella execution task.

# Links
- Request: `req_008_define_application_orchestration_between_domain_and_runtime_adapters`
- Primary task(s): `task_008_define_application_orchestration_between_domain_and_runtime_adapters`, `task_004_orchestrate_incremental_rewrite_execution_governance_and_validation`

# Priority
- Impact: P2. This item makes the earlier seams work together coherently.
- Urgency: Medium. It should follow the first three domain seams.

# Notes
- Derived from request `req_008_define_application_orchestration_between_domain_and_runtime_adapters`.
- Source file: `logics/request/req_008_define_application_orchestration_between_domain_and_runtime_adapters.md`.
- Execution order: 4 of 11 rewrite items.
- Dependencies: `item_004_extract_export_domain_logic_behind_runtime_adapters`, `item_005_extract_settings_domain_logic_behind_storage_adapters`, `item_006_extract_selected_eta_calculations_behind_runtime_adapters`.
