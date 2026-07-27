# Feature Specification: Basic Commitment Capture

## Feature Name

Basic commitment capture.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Let the user turn an existing session next step into a confirmed commitment and manage its basic status from the home page.

## Problem / Context

The app already stores `next_steps` in session summaries and now has a `commitments` table. Without a minimal capture flow, next steps remain visible but are not trackable.

This slice adds user-confirmed commitment capture without building full goals, habits, reminders or automatic AI extraction.

## User Value

The user can keep a small list of concrete next actions after a session and mark them completed or archived later.

## Scope

- Add a server action to create a commitment from a session summary next step.
- Verify that the session summary and next step belong to the authenticated user before insertion.
- Avoid duplicate active commitments for the same user, session and title.
- Add a small recent active commitments list on `/inicio`.
- Add actions to complete or archive a commitment.
- Record minimized audit events for successful create, complete and archive actions.

## Out Of Scope

- Do not create commitments automatically.
- Do not add due-date editing yet.
- Dedicated commitment management is covered by `basic-commitment-management.md`.
- Do not add goals, habits, reminders, notifications or check-ins.
- Do not modify AI prompts or memory retrieval.
- Do not add a migration.

## Functional Requirements

- The user shall be able to save a visible session next step as a commitment.
- The create action shall require authentication.
- The create action shall verify the session summary belongs to the current user.
- The create action shall verify the requested text exists in that summary's `next_steps`.
- The create action shall store the commitment as confirmed by the user.
- Creating the same active commitment from the same session shall be idempotent.
- The home page shall show recent active commitments for the current user.
- The user shall be able to mark an active commitment as completed.
- The user shall be able to archive an active commitment.

## Non-Functional Requirements

- The implementation shall stay server-side and Spanish-first.
- Queries and mutations shall filter by authenticated `user_id`.
- No commitment content shall be written into audit metadata.
- Typecheck, lint, tests, format check and build shall remain clean.

## Acceptance Criteria

- `/inicio` shows a commitment-save action next to session next steps.
- Saving a next step creates one active, confirmed commitment.
- Repeating the same save does not create duplicate active commitments.
- `/inicio` shows recent active commitments.
- Completing a commitment changes its status to `completed`.
- Archiving a commitment changes its status to `archived`.
- Actions do not affect commitments owned by another user.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run test` passes.
- `npm run format:check` passes.
- `npm run build -- --webpack` passes.

## Error Cases

- If the user is not authenticated, actions redirect to `/login`.
- If a session summary ID is invalid, no data is changed.
- If the next step text is not part of that summary, no data is changed.
- If a commitment ID is invalid or owned by another user, no data is changed.

## Security And Privacy Considerations

Commitments can include personal plans. All actions shall derive the user from the authenticated session and filter by `user_id`.

Audit events shall store entity IDs, status changes and source metadata only, not commitment text.

## Data Model Impact

No schema change is planned. The feature uses the existing `commitments` table.

## API Impact

Adds internal server actions under the commitments module.

## UI/UX Impact

Adds a compact commitments section on `/inicio` and a small action next to session next steps.

The page shall avoid pressure, streak language or guilt.

## Memory Impact

No memory behavior change. Commitments are not memories in this slice.

## AI Behavior Impact

No AI behavior change.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run format:check`
- `npm run build -- --webpack`

Manual browser test:

- close a session with a next step;
- save the next step as a commitment from `/inicio`;
- refresh and confirm it appears in active commitments;
- mark it completed;
- create another and archive it.

## Implementation Tasks

- [x] Add commitment query helper.
- [x] Add create, complete and archive server actions.
- [x] Add `/inicio` UI for active commitments.
- [x] Add save action beside next steps.
- [x] Add audit events for successful commitment changes.
- [x] Run validation checks.

## Documentation To Update

Update this feature spec if the capture flow changes. Dedicated management, due dates, automatic extraction, memory integration and goals/habits integration shall remain documented in their own feature specs.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-27 | Initial implemented slice | Turn visible next steps into user-confirmed commitments without expanding into goals or habits |
| 2026-07-27 | Clarified management-page ownership | Dedicated commitment management now has its own feature spec |
