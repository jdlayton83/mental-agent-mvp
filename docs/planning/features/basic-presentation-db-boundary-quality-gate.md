# Feature Specification: Basic Presentation DB Boundary Quality Gate

## Feature Name

Basic presentation DB boundary quality gate.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Add a lightweight local check that fails when presentation files import database internals directly.

## Problem / Context

ADR-0001 defines a modular monolith and states that business logic shall not be implemented directly in React components, route handlers, or server actions. The current app routes and components use module-level helpers instead of importing Drizzle or `@/db` directly, but the unified CI command did not yet protect that boundary.

## User Value

The project owner gets a fast warning if future UI work starts bypassing domain modules and querying the database from presentation files.

## Scope

- Add a local script that scans Git-tracked files under `src/app` and `src/components`.
- Disallow direct imports from `@/db` and `@/db/schema`.
- Disallow direct imports from `drizzle-orm`.
- Add a package script for the check.
- Include the check in `npm run ci`.

## Out Of Scope

- Do not refactor existing modules.
- Do not forbid database imports inside `src/modules` or `src/db`.
- Do not attempt to detect all forms of business logic automatically.
- Do not change application behavior.

## Functional Requirements

- The check shall report each presentation file that imports database internals directly.
- The check shall exit with a non-zero status when a violation exists.
- The check shall pass when app routes and components access persistence only through module helpers.

## Non-Functional Requirements

- The implementation shall use Node.js already available in the project.
- Typecheck, lint, test, secret check, env check, AI boundary check, DB journal check, privacy check, format check and build shall remain clean.

## Acceptance Criteria

- `npm run presentation:check` passes in the current repository state.
- `npm run ci` includes `npm run presentation:check`.
- No application behavior changes.
- `npm run ci` passes.

## Error Cases

- If future UI code needs persisted data, it shall call a module-level read model, query helper, server action, or route handler instead of importing database internals directly.

## Security And Privacy Considerations

Keeping database access behind modules reduces the risk of inconsistent authorization, missing `user_id` filters, and accidental exposure of sensitive records.

## Data Model Impact

No data model impact.

## API Impact

No API impact.

## UI/UX Impact

No UI impact.

## Memory Impact

No memory behavior impact.

## AI Behavior Impact

No AI behavior impact.

## Testing Plan

- `npm run presentation:check`
- `npm run ci`

## Implementation Tasks

- [x] Add presentation DB boundary scan script.
- [x] Add `presentation:check` script.
- [x] Include the check in `npm run ci`.
- [x] Run the unified CI command.

## Documentation To Update

No additional documentation update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-27 | Initial implemented spec | Protect presentation/database separation in CI |
