# Feature Specification: Basic Commitment Management

## Feature Name

Basic commitment management.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Add a focused commitments page so the user can review, complete, archive, and delete commitments created from session next steps.

## Problem / Context

Commitments can now be created from `/inicio`, but there is no dedicated place to review all commitment statuses or delete commitments individually.

The MVP requires user control over follow-up actions without expanding into full goals, habits, reminders, or notifications.

## User Value

The user can see active and past commitments in one place and remove commitments that should no longer be kept.

## Scope

- Add a protected `/compromisos` page.
- List active, completed, archived, and deleted commitments owned by the current user.
- Show commitment title, source, status, created date and updated date.
- Reuse complete and archive actions.
- Add a soft-delete commitment action.
- Link the page from `/inicio`.
- Record a minimized audit event for successful commitment deletion.

## Out Of Scope

- Do not add due-date editing yet.
- Do not add reminders, notifications, streaks, goals, habits or check-ins.
- Do not add automatic AI commitment extraction.
- Do not add a migration.
- Do not change memory retrieval or prompts.

## Functional Requirements

- The page shall require authentication.
- The page shall only list commitments for the current user.
- The page shall show active, completed, archived and deleted commitments grouped by status.
- The user shall be able to complete active commitments.
- The user shall be able to archive active commitments.
- The user shall be able to delete any non-deleted commitment.
- Deleting a commitment shall set `status = "deleted"` and `deleted_at`.
- Deleted commitments shall not appear in the active commitments list on `/inicio`.

## Non-Functional Requirements

- UI copy shall be Spanish-first and non-pressuring.
- Mutations shall filter by authenticated `user_id`.
- Audit metadata shall not include commitment title or description.
- Typecheck, lint, tests, format check and build shall remain clean.

## Acceptance Criteria

- `/inicio` links to `/compromisos`.
- `/compromisos` renders an empty state when there are no commitments.
- Active commitments can be completed.
- Active commitments can be archived.
- Non-deleted commitments can be deleted.
- Deleted commitments are grouped as deleted.
- Actions do not affect commitments owned by another user.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run test` passes.
- `npm run format:check` passes.
- `npm run build -- --webpack` passes.

## Error Cases

- If the user is not authenticated, redirect to `/login`.
- If a commitment ID is invalid, no data is changed.
- If a commitment belongs to another user, no data is changed.
- If a commitment is already deleted, delete shall be idempotent and shall not restore it.

## Security And Privacy Considerations

Commitments may contain personal plans. All queries and mutations shall filter by the authenticated user ID.

The page may show commitment title to the owning user, but audit events shall never store the title or description.

## Data Model Impact

No schema change is planned. The feature uses the existing `commitments` table.

## API Impact

Adds one internal server action for soft deletion.

## UI/UX Impact

Adds `/compromisos` using the existing simple ledger-list style.

The page shall avoid guilt, streaks, pressure or productivity scoring.

## Memory Impact

No memory behavior change.

## AI Behavior Impact

No AI behavior change.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run format:check`
- `npm run build -- --webpack`

Manual browser test:

- open `/compromisos`;
- complete an active commitment;
- archive an active commitment;
- delete a commitment;
- confirm `/inicio` only shows active, non-deleted commitments.

## Implementation Tasks

- [x] Add commitment management query.
- [x] Add soft-delete commitment action.
- [x] Add `/compromisos` page.
- [x] Add link from `/inicio`.
- [x] Add audit event for commitment deletion.
- [x] Run validation checks.

## Documentation To Update

Update this feature spec if due dates, reminders, goals, habits, automatic extraction or memory integration are added.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-27 | Initial implemented slice | Add focused commitment management without expanding into goals or habits |
