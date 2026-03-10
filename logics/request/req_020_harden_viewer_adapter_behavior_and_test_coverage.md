## req_020_harden_viewer_adapter_behavior_and_test_coverage - Harden viewer adapter behavior and test coverage
> From version: 3.0.1
> Status: Done
> Understanding: 100%
> Confidence: 96%
> Complexity: Low
> Theme: Reliability
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Define a bounded hardening slice around `modules/viewer.mjs`.
- Remove remaining self-referential module lookups and add direct tests for popup, clipboard, download, and Hastebin-sharing behavior.
- Preserve current UI-facing behavior.

# Context
`modules/viewer.mjs` remains a shared adapter used by export, changelog, and notification flows.

The module is behaviorally important because it wraps:
- modal display
- clipboard copy flow
- file sharing flow
- Hastebin sharing flow

It is still lightly covered directly, and some logic still loops back through `mods.getViewer()` even though the adapter itself already owns that behavior.

This request defines a small follow-up slice:
- make viewer dependencies explicit enough for direct testing
- remove self-referential calls
- add direct tests for the critical user-facing branches

# Acceptance criteria
- A dedicated request is defined around `modules/viewer.mjs`.
- The request states that modal behavior, clipboard copy flow, download flow, and Hastebin sharing behavior must remain stable.
- The request requires direct local tests without requiring live in-game execution.
- The request preserves current user-facing behavior.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Backlog
- `item_019_harden_viewer_adapter_behavior_and_test_coverage`

# Outcome
- The viewer adapter is now hardened through `item_019_harden_viewer_adapter_behavior_and_test_coverage`.
- `modules/viewer.mjs` now uses explicit dependencies for runtime-facing behavior and no longer loops back through `mods.getViewer()` for its own share branches.
- Direct tests cover popup creation, clipboard success/error, file download, and Hastebin success/error behavior without requiring live Melvor execution.
