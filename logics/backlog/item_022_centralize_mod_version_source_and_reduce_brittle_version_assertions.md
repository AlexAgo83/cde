## item_022_centralize_mod_version_source_and_reduce_brittle_version_assertions - Centralize mod version source and reduce brittle version assertions
> From version: 3.0.17
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Low
> Theme: Reliability
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
- The mod version currently has multiple maintenance touchpoints even though it is conceptually a single release value.
- A version bump forces edits in runtime code, build/release parsing, and several test fixtures that only repeat the current string.
- This adds avoidable churn and creates low-signal failures during routine releases.

# Scope
- In:
- introduce a dedicated version source module for runtime consumption
- align build and release-gate tooling on that same source
- replace repeated version literals in Node tests with imports from the version module
- Out:
- redesigning the semantic versioning scheme itself
- changing export meta structure or API shape beyond reading the version from a different source
- broad refactors unrelated to version ownership

```mermaid
flowchart LR
    Req[Request source] --> Problem[Problem to solve]
    Problem --> Scope[Scoped delivery]
    Scope --> AC[Acceptance criteria]
    AC --> Tasks[Implementation task s]
```

# Acceptance criteria
- AC1: The repository exposes one dedicated runtime version source that is used by `setup.mjs`.
- AC2: `build.sh` and `scripts/release_gate.py` derive the release version from that same source.
- AC3: Version-sensitive Node tests import the shared version constant instead of hardcoding the current release string.
- AC4: The slice is validated with targeted runtime tests, release-gate tests, and a build.

# AC Traceability
- AC1 -> Scope item 1 and task implementation. Proof: `modules/version.mjs` and `setup.mjs`.
- AC2 -> Scope item 2 and validation. Proof: `build.sh`, `scripts/release_gate.py`, and `tests/test_release_gate.py`.
- AC3 -> Scope item 3. Proof: updated Node tests importing the shared constant.
- AC4 -> Validation section and task report. Proof: executed Node/Python/build commands.

# Links
- Request: `req_023_centralize_mod_version_source_and_reduce_brittle_version_assertions`
- Primary task(s): `task_027_centralize_mod_version_source_and_reduce_brittle_version_assertions`

# Priority
- Impact: P3. This is maintenance hardening, not a user-facing feature, but it directly improves release ergonomics.
- Urgency: Medium. It should be done before more version bumps accumulate additional duplication.

# Notes
- Derived from request `req_023_centralize_mod_version_source_and_reduce_brittle_version_assertions`.
- Source file: `logics/request/req_023_centralize_mod_version_source_and_reduce_brittle_version_assertions.md`.
