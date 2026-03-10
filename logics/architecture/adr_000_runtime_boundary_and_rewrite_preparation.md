## adr_000_runtime_boundary_and_rewrite_preparation - Runtime boundary and rewrite preparation
> Date: 2026-03-10
> Status: Proposed

# Context
The project now has initial stabilization work and a lightweight validation path, but the mod architecture is still tightly coupled to the live Melvor runtime.

Current coupling points include:
- direct reads from `game`
- direct UI integration through `ui` and `Swal`
- direct browser services usage such as `Notification` and `localStorage`
- lifecycle assumptions spread across `setup.mjs`, `modules.mjs`, and page/view modules
- a global service-locator style module manager used as the main dependency carrier

That architecture is acceptable for the current codebase, but it is not the long-term target for a cleaner rewrite.
The rewrite should not start immediately. It should begin only after stabilization and validation work are sufficiently mature.

# Decision
When the project is ready for a broader rewrite, the target architecture should be based on explicit runtime boundaries and progressive extraction of pure domain logic.

The preferred target structure is:
- `runtime adapters`
  - Melvor runtime adapter for `game`, loader hooks, storage, and patch APIs
  - browser adapter for clipboard, notifications, and downloads
- `domain logic`
  - export assembly
  - diff and history rules
  - ETA calculations
  - settings interpretation
- `application orchestration`
  - use cases coordinating runtime adapters and domain logic
- `ui rendering`
  - export modal
  - changelog modal
  - panel rendering and page injection

The rewrite preparation rules are:
- preserve current user-visible behavior by default
- extract pure logic before replacing runtime-facing modules
- introduce contracts for export payloads, ETA payloads, and settings values before reorganizing large modules
- keep packaging validation and automated tests green during each migration slice
- migrate one seam at a time instead of replacing the entire mod surface in one step

The first migration candidates should be:
- export bootstrap, diff, and changelog history logic
- reusable ETA calculations that do not require direct DOM or runtime patch hooks
- manifest and packaging validation utilities
- settings normalization and interpretation helpers

# Alternatives considered
- Full immediate rewrite of the mod from scratch.
  This was rejected because it would rebuild uncertainty before runtime behavior and validation seams are stable enough.
- Leave the current architecture unchanged and only add features.
  This was rejected because the existing coupling would keep maintenance cost and regression risk too high over time.

# Consequences
- The project now has an explicit architecture target instead of a vague future rewrite intention.
- Rewrite work should be evaluated against this runtime-boundary model rather than against cosmetic cleanup alone.
- Future architecture tasks should reference this ADR when deciding whether a change belongs in domain logic, an adapter, or the UI layer.
- This ADR does not authorize an immediate full rewrite; it defines the target and sequencing rules for when rewrite work becomes justified.
