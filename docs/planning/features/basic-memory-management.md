# Feature Specification: Basic Memory Management

## Feature Name

Basic memory management.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-25.

## Objective

Add a minimal user-facing memory management surface so the user can review, confirm, reject, archive, and delete memories created by the MVP.

The feature shall improve user control without adding embeddings, advanced retrieval, memory versioning, or new database tables in this slice.

## Problem / Context

The current app can create proposed memories from closed sessions and show recent proposed or confirmed memories on `/inicio`.

The user can confirm or reject proposed memories, but cannot inspect full memory content, archive confirmed memories, delete memories individually, or see a focused memory management page. This leaves the MVP short of the memory-control requirements in the backlog and memory specification.

## User Value

The user can understand what the assistant may remember and can remove or disable memories without deleting the whole account.

## Scope

- Add a dedicated memory management page.
- List proposed, confirmed, archived, rejected, and deleted memories in a simple way.
- Show memory title, content, type, sensitivity, confidence, status, and dates.
- Keep existing confirm and reject actions.
- Add archive and delete actions for memories owned by the current user.
- Soft-delete memories by setting `status = "deleted"`, `is_available_for_retrieval = false`, and `deleted_at`.
- Keep deleted and archived memories unavailable for retrieval.

## Out Of Scope

- Do not add embeddings.
- Do not add semantic retrieval.
- Do not add memory versioning tables.
- Do not add goals, habits, commitments, or reminders.
- Do not add bulk deletion.
- Do not change account deletion.
- Do not create a new database table or migration in this slice.
- Do not modify AI prompts unless needed to prevent use of deleted or archived memories.

## Functional Requirements

- The user shall be able to open a memory management page from `/inicio`.
- The page shall require authentication.
- The page shall only show memories owned by the current user.
- The page shall show proposed, confirmed, archived, rejected, and deleted memories.
- The user shall be able to confirm proposed memories.
- The user shall be able to reject proposed memories.
- The user shall be able to archive confirmed memories.
- The user shall be able to delete any non-deleted memory.
- Deleting a memory shall make it unavailable for retrieval immediately.
- Archiving a memory shall make it unavailable for retrieval immediately.
- Deleted memories shall not appear in the recent-memory sections on `/inicio`.

## Non-Functional Requirements

- UI copy shall be Spanish-first and concise.
- The implementation shall reuse the existing `memories` table.
- The implementation shall remain server-side and authorization-safe.
- Typecheck, lint, and format checks shall remain clean.

## Acceptance Criteria

- `/inicio` links to the memory management page.
- The memory management page renders an empty state when there are no memories.
- Proposed memories can still be confirmed or rejected.
- Confirmed memories can be archived.
- Non-deleted memories can be deleted.
- Archive and delete actions filter by current user ID.
- Archived and deleted memories have `is_available_for_retrieval = false`.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.

## Error Cases

- If the user is not authenticated, the page and actions redirect to `/login`.
- If a memory ID is invalid, the action shall not modify data.
- If the memory belongs to another user, the action shall not modify data.
- If a memory is already deleted, delete shall be idempotent and shall not restore it.

## Security And Privacy Considerations

All actions shall derive the user from the authenticated session and filter by `user_id`.

Memory deletion in this slice is a soft deletion in the application database. It prevents normal display and retrieval, but it does not claim to purge backups or provider-side data.

The feature shall not expose memories across users and shall not log memory content unnecessarily.

## Data Model Impact

No schema change is planned.

The feature uses existing fields in `memories`: `status`, `archived_at`, `deleted_at`, `is_available_for_retrieval`, `is_confirmed_by_user`, and `updated_at`.

## API Impact

Server actions may be added for archive and delete.

No public API route is planned.

## UI/UX Impact

Add a Spanish-first memory page, likely `/memoria`, with grouped sections and simple action buttons.

The page shall avoid clinical language and shall describe memories as user-controlled notes the product may use for continuity.

## Memory Impact

This feature directly updates memory state.

Archived and deleted memories shall not be available for retrieval. Memory state shall not be used to make unsupported psychological inferences or weaken safety constraints.

## AI Behavior Impact

No new AI behavior is planned.

If future retrieval is added, it shall respect `status`, `deleted_at`, and `is_available_for_retrieval`.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- Manual browser test:
  - open `/memoria`;
  - confirm a proposed memory;
  - archive a confirmed memory;
  - delete a memory;
  - verify `/inicio` no longer shows archived or deleted memories as confirmed.

## Implementation Tasks

- [x] Add memory listing query.
- [x] Add archive memory action.
- [x] Add delete memory action.
- [x] Add `/memoria` page.
- [x] Add link from `/inicio`.
- [x] Run typecheck, lint, and format checks.

## Documentation To Update

Update this feature spec if scope changes.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-25 | Initial draft | Define basic memory-control slice |
| 2026-06-25 | Marked implemented | Memory management page and actions completed |
