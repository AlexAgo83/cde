## item_001_align_documentation_and_secondary_api_consistency - Align documentation and secondary API consistency
> From version: 2.1.227
> Status: Done
> Understanding: 95%
> Confidence: 96%
> Progress: 100%
> Complexity: Low
> Theme: Documentation
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The public surface of the project still contains lower-severity inconsistencies between documentation, settings labels, and actual code behavior.
- These mismatches make the mod harder to trust and maintain because users and future contributors cannot easily tell which features are truly shipped versus partially implemented or described imprecisely.
- This item is intentionally secondary to stabilization work and should clean up the public surface after the runtime-critical issues are addressed.

# Scope
- In:
- Clarify the meaning and behavior of `EXPORT_COMPRESS` across code, settings labels, and user-facing documentation.
- Correct or remove the latent utility bug around mastery progress percentage if the helper remains part of the shared API surface.
- Align `README.md` and adjacent wording with the feature set actually implemented in the repository.
- Clean up secondary wording drift without expanding product scope.
- Out:
- Implementing major new export features just to satisfy outdated documentation
- UI redesign
- Large runtime or lifecycle refactors already covered by the stabilization and testability items

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: `EXPORT_COMPRESS` is described and implemented consistently, with no ambiguity between compact JSON output and actual compression behavior.
- AC2: `getMasteryProgressPercent()` is either corrected or removed if it is intentionally unused.
- AC3: `README.md` reflects the feature set actually shipped by the repository, or non-shipped capabilities are explicitly tracked elsewhere instead of being presented as available now.
- AC4: The cleanup remains limited to consistency and correctness, without turning into a feature expansion item.

# AC Traceability
- AC1 -> settings wording and behavior align. Proof: file diff and verification notes.
- AC2 -> latent shared utility bug is resolved. Proof: code diff and verification notes.
- AC3 -> repository documentation matches implementation. Proof: README diff and verification notes.
- AC4 -> scope remains bounded to consistency work. Proof: review of changed files.

# Links
- Request: `req_002_align_documentation_and_secondary_api_consistency`
- Primary task(s): `task_002_align_documentation_and_secondary_api_consistency`

# Priority
- Impact: P2. Improves correctness, trust, and maintainability of the public surface, but does not address the most immediate runtime risk.
- Urgency: After `item_000_stabilize_mod_loading_packaging_and_export_consistency`; can overlap partially with late testability work if needed.

# Notes
- Derived from request `req_002_align_documentation_and_secondary_api_consistency`.
- Source file: `logics/request/req_002_align_documentation_and_secondary_api_consistency.md`.
- Recommended execution order: 3 of 4.
- Preferred dependency: `item_000_stabilize_mod_loading_packaging_and_export_consistency`.
- This item supports later architecture work by reducing drift between intended and shipped behavior.
