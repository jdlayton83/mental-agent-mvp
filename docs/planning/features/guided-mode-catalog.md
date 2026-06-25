# Feature Specification: Guided Mode Catalog Foundation

## Feature Name

Guided mode catalog foundation.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-19.

## Objective

Create the technical foundation for guided modes by adding a versioned catalog of available guided modes.

This enables the product to introduce the first guided mode, "Tomar una decision", without hard-coding mode configuration in the interface.

## Problem / Context

The MVP specification defines guided modes as a core validation area. The backlog requires a `guided_modes` table before implementing the first guided flow.

The current database schema already includes `sessions.guided_mode_id`, but there is no `guided_modes` table, Drizzle schema, repository helper, or seed data for the catalog.

## User Value

Users will later be able to choose structured experiences, starting with decision support, while the system keeps mode configuration explicit, auditable, and changeable.

## Scope

- Add the `guided_modes` database table.
- Add a Drizzle schema file for `guided_modes`.
- Export the schema from `src/db/schema/index.ts`.
- Add the relationship from `sessions.guided_mode_id` to `guided_modes.id`.
- Seed the MVP guided mode catalog idempotently.
- Add a small read helper for active guided modes if needed by the next UI step.
- Create and register the migration manually because `drizzle-kit generate` fails in this Windows environment.

## Out Of Scope

- Do not implement the full "Tomar una decision" flow yet.
- Do not create a guided-mode UI yet.
- Do not create new session progression tables yet.
- Do not create goals, habits, consent, audit, embeddings, or prompt version tables.
- Do not run `drizzle-kit generate`.
- Do not apply the migration until the user approves and runs the database command manually if Docker access is required.

## Functional Requirements

- The system shall define a `guided_modes` table with UUID primary keys.
- The system shall store a unique mode code.
- The system shall store Spanish-first user-facing name and description.
- The system shall store `session_type`, base credit cost, included user messages, prompt version reference, flow definition, active status, sort order, and timestamps.
- The seed shall create or update the MVP guided modes without duplicates.
- The catalog shall include at least `make_decision` as active.
- The catalog shall seed all six MVP mode definitions.
- Only `make_decision` shall be active until the remaining flows are implemented.
- Sessions shall be able to reference a guided mode through `guided_mode_id`.

## Non-Functional Requirements

- The change shall remain minimal and compatible with the current monolithic modular architecture.
- The migration shall be deterministic and reviewable.
- The implementation shall preserve TypeScript strictness and existing formatting rules.
- Spanish-first product text shall be used for seeded user-facing mode names and descriptions.

## Acceptance Criteria

- `src/db/schema/guided-modes.ts` exists and defines the `guided_modes` table.
- `src/db/schema/index.ts` exports the guided mode schema.
- `src/db/schema/sessions.ts` references `guided_modes.id` for `guidedModeId`.
- A new manual migration creates `guided_modes` and adds the foreign key from `sessions.guided_mode_id`.
- The migration is registered in `src/db/migrations/meta/_journal.json`.
- `src/db/seed.ts` seeds the catalog idempotently.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.

## Error Cases

- If a guided mode code already exists, the seed shall update the existing row instead of creating a duplicate.
- If a session references an unknown guided mode after migration, the database shall reject it.
- If the migration cannot be applied because existing data violates the foreign key, the work shall stop for review.

## Security And Privacy Considerations

The catalog does not store user data.

Mode configuration shall not weaken safety rules. All guided modes shall use the same safety classifier, safe response flow, output validation, and audit behavior as free conversation.

## Data Model Impact

This feature requires one new table: `guided_modes`.

It also requires a foreign key from `sessions.guided_mode_id` to `guided_modes.id`.

## API Impact

No public API is required in this slice.

A server-side read helper may be added for active mode lookup if needed by the next implementation step.

## UI/UX Impact

No UI changes are included in this slice.

Seeded names and descriptions shall be Spanish-first so a later UI can display them directly.

## Memory Impact

No memory records are created or updated.

The catalog shall not change memory extraction, confirmation, retrieval, or deletion rules.

## AI Behavior Impact

No prompt behavior changes are included in this slice.

The future guided decision flow shall still follow the agent behavior and safety guardrail specifications.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- Manual review of migration SQL and journal entry before applying migration.

## Implementation Tasks

- [x] Create `src/db/schema/guided-modes.ts`.
- [x] Export guided mode schema from `src/db/schema/index.ts`.
- [x] Add the session relation and foreign key reference.
- [x] Create the next manual SQL migration.
- [x] Register the migration in the Drizzle journal.
- [x] Update `src/db/seed.ts` with idempotent guided mode seeds.
- [x] Run typecheck, lint, and format checks.

## Documentation To Update

No ADR or README update is expected because this implements existing approved architecture.

Update this feature spec if the scope changes.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-19 | Initial draft | Prepare guided mode catalog foundation |
| 2026-06-19 | Approved with all six modes seeded and only `make_decision` active | User approval |
| 2026-06-19 | Marked implemented after migration and seed completed successfully | Manual database confirmation |
