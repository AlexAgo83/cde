## item_012_formalize_shared_contracts_and_strengthen_type_checked_data_models - Formalize shared contracts and strengthen type checked data models
> From version: 3.0.0
> Status: Ready
> Understanding: 92%
> Confidence: 94%
> Progress: 0%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- Once the architecture becomes more layered, implicit data shapes become a stronger source of regression risk.
- The current `@ts-check` posture helps, but major contracts are still too informal for a mature layered architecture.
- This item hardens the shared contracts that the migrated code paths will depend on.

# Scope
- In:
- formalize important shared contracts for export, ETA, settings, collector, and storage data
- strengthen type-checked models without forcing a full TypeScript rewrite
- validate both behavior and structural expectations through local checks and CI
- Out:
- migrating every file to TypeScript
- redesigning product behavior by itself
- replacing earlier architecture slices

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: Shared contracts are defined for the highest-value cross-layer data shapes.
- AC2: Structural expectations become stronger while current runtime behavior remains unchanged.
- AC3: The item remains coordinated through the shared orchestration task and regular `logics` updates.

# AC Traceability
- AC1 -> Scope defines the targeted contract families and the strengthening goal.
- AC2 -> Acceptance criteria preserve behavior while improving model safety.
- AC3 -> Links and notes tie the item to the umbrella task.

# Links
- Request: `req_013_formalize_shared_contracts_and_strengthen_type_checked_data_models`
- Primary task(s): `task_017_formalize_export_and_settings_contracts`, `task_018_formalize_eta_collector_and_storage_contracts`, `task_004_orchestrate_incremental_rewrite_execution_governance_and_validation`

# Priority
- Impact: P3. Contract hardening becomes most valuable after the major architecture slices are real.
- Urgency: Medium-low. It should follow the seam and convergence work.

# Notes
- Derived from request `req_013_formalize_shared_contracts_and_strengthen_type_checked_data_models`.
- Source file: `logics/request/req_013_formalize_shared_contracts_and_strengthen_type_checked_data_models.md`.
- Execution order: 9 of 11 rewrite items.
- Dependencies: `item_004` through `item_011` materially in place.
- Execution slices:
- export and settings contracts first
- ETA, collector, and storage contracts second
