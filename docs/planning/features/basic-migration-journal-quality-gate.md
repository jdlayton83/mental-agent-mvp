# Feature Specification: Basic Migration Journal Quality Gate

## Feature Name

Basic migration journal quality gate.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Add a lightweight local check that verifies manual SQL migrations are sequential and registered in Drizzle's migration journal.

## Problem / Context

This Windows environment shall not use `drizzle-kit generate` because it repeatedly fails with `spawn EPERM`. The project therefore relies on safe manual migrations registered in `src/db/migrations/meta/_journal.json`.

The repository already follows this pattern, but the unified CI command did not yet verify the migration file list against the journal.

## User Value

The project owner gets a fast warning if a future manual migration is created without the matching journal entry, or if journal numbering drifts from the SQL files.

## Scope

- Add a local script that checks SQL files in `src/db/migrations/`.
- Check that migration filenames use the numeric Drizzle tag prefix.
- Check that migration numbers are contiguous from `0000`.
- Check that journal entries use contiguous `idx` values.
- Check that journal tags match SQL filenames exactly.
- Add a package script for the check.
- Include the check in `npm run ci`.

## Out Of Scope

- Do not apply migrations.
- Do not run `drizzle-kit generate`.
- Do not connect to the database.
- Do not validate SQL syntax against PostgreSQL.
- Do not require snapshot files for manually created migrations.

## Functional Requirements

- The check shall fail if a tracked SQL migration is missing from the journal.
- The check shall fail if the journal references a SQL migration file that does not exist.
- The check shall fail if migration file prefixes or journal indexes are not sequential.
- The check shall print file or tag names, but not database credentials or SQL contents.

## Non-Functional Requirements

- The implementation shall use Node.js already available in the project.
- Typecheck, lint, test, secret check, env check, AI boundary check, format check and build shall remain clean.

## Acceptance Criteria

- `npm run db:check` passes in the current repository state.
- `npm run ci` includes `npm run db:check`.
- No database connection is required.
- No application behavior changes.
- `npm run ci` passes.

## Error Cases

- If a future migration is added manually, the author shall also register it in `src/db/migrations/meta/_journal.json` before CI can pass.

## Security And Privacy Considerations

The check is local and does not read `.env` or connect to the database. It shall not print SQL contents.

## Data Model Impact

No schema change is planned.

## API Impact

No API impact.

## UI/UX Impact

No UI impact.

## Memory Impact

No memory behavior impact.

## AI Behavior Impact

No AI behavior impact.

## Testing Plan

- `npm run db:check`
- `npm run ci`

## Implementation Tasks

- [x] Add migration journal scan script.
- [x] Add `db:check` script.
- [x] Include the check in `npm run ci`.
- [x] Run the unified CI command.

## Documentation To Update

No additional documentation update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-27 | Initial implemented spec | Protect manual Drizzle migration registration in CI |
