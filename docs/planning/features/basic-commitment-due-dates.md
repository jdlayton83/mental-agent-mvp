# Feature Specification: Basic Commitment Due Dates

## Feature Name

Basic commitment due dates.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Let the user add, update, or clear a simple target date for an existing commitment.

## Problem / Context

The commitments table already includes `due_at`, and commitments can be created, completed, archived, deleted, and reviewed. The user still lacks a small way to mark when a commitment is intended to be revisited.

This slice adds a date-only target cue without expanding into reminders, notifications, goals, habits, calendars, or productivity scoring.

## User Value

The user can keep commitments slightly more organized while retaining full control and avoiding pressure.

## Scope

- Add a server action to update the target date for a non-deleted commitment.
- Allow clearing the target date.
- Show the target date on `/inicio` for active commitments.
- Show and edit the target date on `/compromisos`.
- Record a minimized audit event for successful target-date updates.

## Out Of Scope

- Do not add reminders, notifications, calendar sync, recurring commitments, streaks, goals, habits or check-ins.
- Do not add automatic AI due-date extraction.
- Do not add a migration.
- Do not change prompts or memory retrieval.

## Functional Requirements

- The update action shall require authentication.
- The update action shall only modify commitments owned by the current user.
- The update action shall ignore deleted commitments.
- The user shall be able to set a valid date in `YYYY-MM-DD` format.
- The user shall be able to clear an existing target date.
- The home page shall show the target date for active commitments when present.
- The commitments page shall show the current target date or a no-date state.

## Non-Functional Requirements

- UI copy shall be Spanish-first and non-pressuring.
- The target date shall be treated as a planning cue, not as a promise, alarm, or clinical intervention.
- Audit metadata shall not include commitment title, description, or the exact target date.
- Typecheck, lint, tests, format check and build shall remain clean.

## Acceptance Criteria

- `/compromisos` lets the user save a target date for a non-deleted commitment.
- `/compromisos` lets the user clear a target date by submitting an empty date field.
- `/inicio` displays the target date for active commitments.
- Invalid dates do not modify data.
- Actions do not affect commitments owned by another user.
- Deleted commitments cannot have their target date changed.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run test` passes.
- `npm run format:check` passes.
- `npm run build -- --webpack` passes.

## Error Cases

- If the user is not authenticated, redirect to `/login`.
- If the commitment ID is invalid, no data is changed.
- If the date is invalid, no data is changed.
- If the commitment belongs to another user, no data is changed.
- If the commitment is deleted, no data is changed.

## Security And Privacy Considerations

Commitment target dates may reveal personal planning patterns. All mutations shall derive the user from the authenticated session and filter by `user_id`.

Audit events shall record only that a target date is present or absent after the update, not the date itself.

## Data Model Impact

No schema change is planned. The feature uses the existing nullable `commitments.due_at` column.

For the MVP, date-only values are stored as a midday UTC timestamp to avoid turning the feature into a timezone-aware reminder system.

## API Impact

Adds one internal server action under the commitments module.

## UI/UX Impact

Adds a compact date field on `/compromisos` and a target-date display on `/inicio`.

The UI shall avoid guilt, urgency, streaks, or productivity scoring.

## Memory Impact

No memory behavior change. Commitment dates are not memories in this slice.

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
- set a target date for an active commitment;
- refresh and confirm the date remains visible;
- clear the date and confirm the no-date state;
- confirm `/inicio` displays the target date for active commitments.

## Implementation Tasks

- [x] Add target-date update action.
- [x] Add target-date display on `/inicio`.
- [x] Add target-date display and edit form on `/compromisos`.
- [x] Add minimized audit event for target-date updates.
- [x] Run validation checks.

## Documentation To Update

Update this feature spec if reminders, recurring commitments, calendar sync, goals, habits, automatic extraction or memory integration are added.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-27 | Initial implemented slice | Add user-controlled target dates without adding reminders or productivity pressure |
