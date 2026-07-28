# Feature Specification: Basic Schema Index Quality Gate

## Feature Name

Basic schema index quality gate.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-28.

## Objective

Add a lightweight local check that verifies every schema file under `src/db/schema/` is exported from `src/db/schema/index.ts`.

## Problem / Context

The project uses Drizzle schema modules split by domain table. New schema files must be exported from the schema index so Drizzle config, database helpers, seeds and application modules can consume the full schema consistently.

The current schema index is complete, but CI did not yet protect future additions.

## User Value

The project owner gets a fast warning if a future table schema is created but forgotten in the schema entry point.

## Scope

- Add a local script that scans `src/db/schema/`.
- Require every `.ts` schema file except `index.ts` to be re-exported from `src/db/schema/index.ts`.
- Add a package script for the check.
- Include the check in `npm run ci`.
- Update the pilot launch checklist.

## Out Of Scope

- Do not change database schema.
- Do not create migrations.
- Do not run Drizzle generation.
- Do not inspect database contents.
- Do not add dependencies.

## Functional Requirements

- The check shall fail if any schema file is missing from `src/db/schema/index.ts`.
- The check shall report missing file names only.
- The check shall pass when all schema files are exported.

## Non-Functional Requirements

- The implementation shall use Node.js already available in the project.
- Typecheck, lint, test, quality checks, format check and build shall remain clean.

## Acceptance Criteria

- `npm run schema:check` passes in the current repository state.
- `npm run ci` includes `npm run schema:check`.
- No application behavior changes.
- `npm run ci` passes.

## Error Cases

- If a schema file is intentionally private and should not be exported, this spec and the check shall be updated in the same change.

## Security And Privacy Considerations

The check reads source file names only. It does not inspect `.env`, local databases or user data.

## Data Model Impact

No data model impact.

## API Impact

No API behavior change.

## UI/UX Impact

No UI behavior change.

## Memory Impact

No memory behavior impact.

## AI Behavior Impact

No AI behavior impact.

## Testing Plan

- `npm run schema:check`
- `npm run ci`

## Implementation Tasks

- [x] Add schema index scan script.
- [x] Add `schema:check` script.
- [x] Include the check in `npm run ci`.
- [x] Update the pilot launch checklist.
- [x] Run the unified CI command.

## Documentation To Update

Update `docs/planning/pilot-launch-checklist.md`.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-28 | Initial implemented spec | Protect Drizzle schema entry point completeness |
