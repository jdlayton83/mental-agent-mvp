# Feature Specification: Basic Private Mode

## Feature Name

Basic private mode.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-22.

## Objective

Add a basic private mode for free conversation sessions so the user can start a session that avoids memory creation and can remove conversation history when closed.

The feature shall make the behavior clear before the user starts or continues the session.

## Problem / Context

The backlog requires a basic private mode. The database already has `user_preferences.private_mode_default` and `sessions.private_mode`, and memory candidate creation already receives the session private-mode flag.

The current UI does not let the user start a private session, and new free-chat sessions always use the default non-private behavior.

## User Value

The user can talk through something without creating memory candidates or keeping ordinary conversation history after closing the session.

## Scope

- Add a clear private-mode entry point for free conversation.
- Create new free-chat sessions with `sessions.private_mode = true` when requested.
- Show private-mode status in the conversation UI.
- Prevent memory candidate creation for private sessions.
- On closing a private session, soft-delete and redact its messages and conversation content while preserving minimal technical session evidence.
- Keep existing safety events and technical usage minimal and non-content-based.

## Out Of Scope

- Do not implement private mode for guided modes in this slice.
- Do not add embeddings.
- Do not add goals or habits behavior.
- Do not add new database tables.
- Do not change consent records.
- Do not delete backups or provider-side data in this slice.

## Functional Requirements

- The user shall be able to start a private free-chat session from `/inicio` or `/conversacion`.
- The conversation page shall display whether the current session is private.
- The first private message shall create a free-chat session with `private_mode = true`.
- Private sessions shall not create memory candidates when closed.
- Closing a private session shall soft-delete and redact its messages and conversation title/content.
- Closing a private session shall still settle reserved credits where applicable.
- Safety responses shall still work in private mode.
- Private mode shall not weaken authentication, authorization, or safety rules.

## Non-Functional Requirements

- The UI copy shall be Spanish-first and concise.
- The implementation shall remain minimal and reuse existing session fields.
- Typecheck, lint, and format checks shall remain clean.

## Acceptance Criteria

- `/inicio` or `/conversacion` exposes a private conversation entry point.
- Private sessions are stored with `private_mode = true`.
- The conversation page shows private mode status.
- Closing a private session does not create memory candidates.
- Closing a private session soft-deletes and redacts its messages from normal conversation history.
- Non-private sessions continue to behave as before.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.

## Error Cases

- If the user is not authenticated, private-mode actions redirect to `/login`.
- If no primary agent exists, the user redirects to `/onboarding`.
- If a non-private active session exists, the app shall not silently convert it to private.
- If a private active session exists, the app shall resume it rather than creating duplicates.

## Security And Privacy Considerations

Private mode is not anonymity. It reduces local persistence and memory extraction in the MVP.

The UI shall state that safety and technical records may still be kept minimally.

The action shall always derive the user from the session and filter by user ID.

## Data Model Impact

No schema change is planned.

The feature uses existing `sessions.private_mode`.

## API Impact

Server actions may be added to start a private conversation and close private sessions.

## UI/UX Impact

Add a Spanish-first private-mode control and status indicator.

The copy shall explain the behavior before use.

## Memory Impact

Private mode shall not create memory candidates or embeddings.

Existing memories shall not be retrieved or modified by private mode in this slice.

## AI Behavior Impact

The assistant may receive a private-mode instruction indicating that the session should avoid proposing persistent memory.

Safety behavior shall remain unchanged.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- Manual browser test:
  - start a private conversation;
  - send a message;
  - close the session;
  - verify no memory candidates were created;
  - verify private messages are not visible in normal history;
  - verify normal conversation still works.

## Implementation Tasks

- [x] Add private-session start action.
- [x] Update free-chat session creation to support `private_mode`.
- [x] Show private status on `/conversacion`.
- [x] Add private entry point on `/inicio` or `/conversacion`.
- [x] Redact or remove private messages when closing private sessions.
- [x] Run typecheck, lint, and format checks.

## Documentation To Update

Update this feature spec if scope changes.

No ADR or README update is expected.

## Open Questions

- Resolved: closing a private session soft-deletes messages with `deleted_at` and redacts message content.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-22 | Initial draft | Start Phase 7.4 basic private mode |
| 2026-06-25 | Marked implemented and resolved deletion behavior | Private mode implemented with soft deletion and content redaction |
