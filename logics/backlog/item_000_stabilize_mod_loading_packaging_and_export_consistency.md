## item_000_stabilize_mod_loading_packaging_and_export_consistency - Stabilize mod loading, packaging, and export consistency
> From version: 2.1.227
> Status: In progress
> Understanding: 93%
> Confidence: 96%
> Progress: 85%
> Complexity: Medium
> Theme: Reliability
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The mod has immediate reliability risks around packaging coherence, async startup ordering, export cache bootstrap, and misleading storage/UI behavior.
- These issues can lead to broken or partial startup, empty export views despite persisted data, and settings that do not match actual runtime behavior.
- This item is the first delivery priority because it removes current production-facing fragility before broader refactors or test initiatives.

# Scope
- In:
- Fix `manifest.json` so declared modules/resources match files that actually exist and runtime-loaded modules.
- Make module and submodule initialization deterministic enough that `onInterfaceReady` cannot consume unloaded viewer or page modules.
- Correct export bootstrap behavior so the persisted export can be displayed before a new session export is generated.
- Align storage/UI behavior for the reviewed misleading settings and invalid export modal display handling.
- Add a lightweight validation path for packaging/startup/export bootstrap assumptions.
- Out:
- ETA feature redesign
- New collectors or export schema expansion
- Large architectural refactor beyond the stabilization needed to close the reviewed issues

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: `manifest.json` references only existing files required by the mod and includes runtime-loaded modules needed for startup.
- AC2: Startup and submodule loading are synchronized so viewer/pages consumers cannot observe unloaded modules during interface initialization.
- AC3: Opening the export UI before generating a new export in the current session loads the last persisted export instead of an empty object.
- AC4: The reviewed misleading storage/UI behaviors are corrected, including valid diff-button visibility handling and a consistent treatment of `USE_LZSTRING`.
- AC5: A minimal validation path is documented or added for packaging coherence, startup assumptions, and persisted export bootstrap behavior.

# AC Traceability
- AC1 -> `manifest.json` and startup-loaded file list are aligned. Proof: file diff and validation notes.
- AC2 -> `setup.mjs` / `modules.mjs` initialization order is safe. Proof: code change and verification notes.
- AC3 -> `modules/export.mjs` loads persisted export state correctly. Proof: code change and verification notes.
- AC4 -> settings/UI behavior matches implementation. Proof: code change and verification notes.
- AC5 -> lightweight validation command or checklist exists. Proof: documented validation path.

# Links
- Request: `req_001_stabilize_mod_loading_and_export_consistency`
- Primary task(s): `task_000_stabilize_mod_loading_packaging_and_export_consistency`

# Priority
- Impact: P0. Directly affects runtime reliability, export correctness, and trust in current settings behavior.
- Urgency: Immediate. This item should land before testability work, documentation cleanup, or rewrite preparation.

# Notes
- Derived from request `req_001_stabilize_mod_loading_and_export_consistency`.
- Source file: `logics/request/req_001_stabilize_mod_loading_and_export_consistency.md`.
- Recommended execution order: 1 of 4.
- Dependencies: none.
- This item is expected to unblock `item_002_improve_testability_testing_and_ci_hardening` and materially de-risk `item_001_align_documentation_and_secondary_api_consistency`.
- Remaining blocker before closure: verify startup and export behavior inside the real Melvor runtime.
