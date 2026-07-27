# Feature Specification: Basic Memory Editing

## Feature Name

Basic memory editing.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Let the user correct the title and content of an existing memory from the memory management page.

## Problem / Context

The memory specification says the user shall be able to correct memories. The current `/memoria` page lets the user confirm, reject, archive, and delete memories, but it does not let the user fix an inaccurate or unclear memory.

This slice adds a minimal correction flow without adding version tables, embeddings, bulk actions, or new memory extraction behavior.

## User Value

The user can keep stored memories accurate without deleting and recreating them.

## Scope

- Add a server action to update memory title and content.
- Add an edit form to each non-deleted memory on `/memoria`.
- Update `normalized_content` from the edited content.
- Record a minimized audit event for successful edits.
- Keep retrieval availability and status unchanged.

## Out Of Scope

- Do not add memory versioning tables.
- Do not add embeddings or semantic re-indexing.
- Do not add bulk editing.
- Do not edit memory type, sensitivity, confidence, source, status, or retrieval availability in this slice.
- Do not add AI rewriting of memories.
- Do not add a migration.

## Functional Requirements

- The edit action shall require authentication.
- The edit action shall only modify memories owned by the current user.
- The edit action shall ignore deleted memories.
- The title shall be required and limited to 160 characters.
- The content shall be required and limited to 1000 characters.
- Editing shall update `title`, `content`, `normalized_content`, and `updated_at`.
- Editing shall not confirm, reject, archive, delete, or restore a memory.
- Editing shall not make archived, rejected, or deleted memories available for retrieval.

## Non-Functional Requirements

- UI copy shall be Spanish-first and concise.
- Audit metadata shall not include memory title, content, or normalized content.
- The implementation shall stay server-side and authorization-safe.
- Typecheck, lint, tests, format check and build shall remain clean.

## Acceptance Criteria

- `/memoria` shows an edit form for each non-deleted memory.
- Submitting a valid edit updates the visible title and content.
- Submitting an empty title or content does not modify data.
- Editing a memory does not change its current status.
- Editing a memory does not make archived or rejected memories retrievable.
- Deleted memories cannot be edited.
- Actions do not affect memories owned by another user.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run test` passes.
- `npm run format:check` passes.
- `npm run build -- --webpack` passes.

## Error Cases

- If the user is not authenticated, redirect to `/login`.
- If the memory ID is invalid, no data is changed.
- If the memory belongs to another user, no data is changed.
- If the memory is deleted, no data is changed.
- If normalized content would duplicate another memory from the same session, no data is changed.

## Security And Privacy Considerations

Memories may contain personal information. All edits shall derive the user from the authenticated session and filter by `user_id`.

Audit events shall record only that a memory was edited and which fields were editable, without storing the new or previous content.

## Data Model Impact

No schema change is planned. The feature uses existing `memories` fields.

This slice updates `normalized_content` directly but does not maintain a historical version record.

## API Impact

Adds one internal server action under the memory module.

## UI/UX Impact

Adds compact edit controls on `/memoria`.

The UI shall frame editing as correction and control, not as diagnosis or psychological interpretation.

## Memory Impact

This feature directly changes memory content. It shall not create new memories, infer new facts, or reduce safety constraints.

## AI Behavior Impact

No prompt behavior change is planned.

Confirmed, retrievable memories will use the corrected content in future context retrieval.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run format:check`
- `npm run build -- --webpack`

Manual browser test:

- open `/memoria`;
- edit a proposed memory;
- edit a confirmed memory;
- confirm the status and retrieval state stay unchanged;
- confirm deleted memories do not show edit controls.

## Implementation Tasks

- [x] Add memory edit server action.
- [x] Add edit form on `/memoria`.
- [x] Add minimized audit event.
- [x] Run validation checks.

## Documentation To Update

Update this feature spec if versioning, embeddings, bulk editing, or AI-assisted memory rewriting are added.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-27 | Initial implemented slice | Add basic user correction for memories without adding versioning or embeddings |
