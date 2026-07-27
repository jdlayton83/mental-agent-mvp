# Feature Specification: Basic Commitments Foundation

## Feature Name

Basic commitments foundation.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Add the minimal database foundation for user commitments so the MVP can later turn confirmed next steps into trackable actions without building the full goals or habits system yet.

## Problem / Context

The MVP and memory specifications require próximos pasos, commitments, goals and habits. The app already stores session summaries with `next_steps`, but there is no dedicated entity for confirmed commitments.

This slice added only the `commitments` table and Drizzle schema. Runtime creation and management are covered by later commitment feature specs.

## User Value

The project gains a safe, explicit place to store confirmed next actions later, instead of mixing commitments into memories, feedback, or free-form session metadata.

## Scope

- Add a minimal `commitments` Drizzle schema.
- Add and register a manual migration for the table.
- Include ownership, origin, status, confirmation, due/completion/archive/delete timestamps, metadata and useful indexes.
- Export the schema from `src/db/schema/index.ts`.

## Out Of Scope

- Do not implement a commitments page yet.
- Do not create commitments automatically from conversations or guided modes yet.
- Do not add goals, habits, habit check-ins, reminders or notifications.
- Do not modify AI prompts.
- Do not run `drizzle-kit generate`.
- Do not apply the migration from Codex.

## Functional Requirements

- Each commitment shall belong to one user.
- A commitment may reference the originating agent and session.
- A commitment shall have title, optional description, source, status and confirmation state.
- A commitment may have `due_at`, `completed_at`, `archived_at` and `deleted_at`.
- The table shall support filtering by user and status.
- The table shall support listing upcoming commitments by user and due date.

## Non-Functional Requirements

- The schema shall follow existing PostgreSQL, Drizzle and naming conventions.
- The migration shall be manual and registered in Drizzle's journal.
- Typecheck, lint, tests, format check and build shall remain clean.

## Acceptance Criteria

- `src/db/schema/commitments.ts` exists.
- `src/db/schema/index.ts` exports the commitments schema.
- `src/db/migrations/0014_create_commitments.sql` exists.
- `src/db/migrations/meta/_journal.json` contains the matching sequential entry.
- No runtime page or action depends on the table before migration application.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run test` passes.
- `npm run format:check` passes.
- `npm run build -- --webpack` passes.

## Error Cases

- If the manual migration is not applied yet, no existing app route shall query `commitments`.
- If a future commitment belongs to another user, future actions shall filter by authenticated `user_id`.

## Security And Privacy Considerations

Commitments may contain personal plans. Every future query or action shall filter by `user_id` and shall not expose commitments across users.

Commitments shall not be used to infer psychological causes or weaken safety rules.

## Data Model Impact

Adds the `commitments` table.

No existing table is changed.

## API Impact

No runtime API or server action is added in this slice.

## UI/UX Impact

No UI change in this slice.

## Memory Impact

Commitments are separate from memories. Future memory retrieval may reference confirmed active commitments only when useful and safe.

## AI Behavior Impact

No AI behavior change in this slice.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run format:check`
- `npm run build -- --webpack`

Manual follow-up after approval:

```powershell
node --env-file=.env .\node_modules\drizzle-kit\bin.cjs migrate
```

## Implementation Tasks

- [x] Add commitments schema.
- [x] Export commitments schema.
- [x] Add manual migration.
- [x] Register migration in Drizzle journal.
- [x] Run validation checks.

## Documentation To Update

Runtime commitment creation and management are documented in separate feature specs.

Update this feature spec if the database foundation itself changes.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-27 | Initial implemented foundation | Add minimal commitment entity without taking on full goals or habits scope |
| 2026-07-27 | Clarified runtime follow-up wording | Runtime commitment features are now documented separately |
