# Feature Specification: Basic Account Data Deletion

## Feature Name

Basic account data deletion.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-22.

## Objective

Implement a basic local MVP deletion flow that lets the authenticated user delete their account data from the application database.

The feature shall prioritize user control, isolation, and clear communication while avoiding silent partial deletion.

## Problem / Context

The backlog requires account and data deletion, including conversations, sessions, memories, history, session revocation, and clear information about retained technical data.

The current app has user-owned data across users, profiles, preferences, agents, conversations, messages, sessions, session summaries, memories, credits, usage, safety events, consent records, and feedback stored in session metadata. There is no `audit_events` table yet, no embeddings table yet, and no external provider deletion workflow.

## User Value

The user can remove their local MVP data and stop account access without relying on manual database work.

## Scope

- Add a deletion control on `/privacidad`.
- Require an explicit confirmation phrase before deletion.
- Delete or anonymize current user-owned local data in a safe order.
- Revoke the active account by marking the user deleted and incrementing `session_version`.
- Remove conversation content, memories, summaries, sessions, credits, usage, consent records, profile, preferences, and agents where technically possible.
- Keep the operation scoped to the current authenticated user.
- Explain that backups and external provider deletion are outside this local MVP flow.

## Out Of Scope

- Do not add `audit_events` in this slice.
- Do not implement provider-side deletion requests.
- Do not implement backup suppression lists.
- Do not implement admin deletion tools.
- Do not implement partial per-conversation deletion in this slice.
- Do not add a new migration unless the implementation proves it is required.

## Functional Requirements

- The user shall access deletion from `/privacidad`.
- The user shall type a confirmation phrase before deletion.
- The deletion action shall require authentication.
- The deletion action shall filter all operations by current `user_id`.
- The deletion action shall run inside a database transaction where practical.
- The deletion action shall remove or neutralize data in dependency-safe order.
- The user account shall be marked inactive/deleted and `session_version` shall be incremented to revoke sessions.
- After deletion, the user shall be signed out or redirected to `/login`.
- The UI shall explain that this deletes local MVP data and may not affect backups or external providers.

## Non-Functional Requirements

- The implementation shall be conservative and explicit.
- The deletion path shall not delete other users' data.
- The action shall not log conversation content.
- Typecheck, lint, and format checks shall remain clean.

## Acceptance Criteria

- `/privacidad` exposes an account deletion section.
- Deletion cannot run without the exact confirmation phrase.
- Deletion cannot run for an unauthenticated user.
- Deletion removes current user-owned records from implemented user-content tables where allowed by foreign keys.
- The user account is disabled and session version increments.
- Existing sessions are revoked after deletion.
- The user is redirected away from private pages after deletion.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.

## Error Cases

- If confirmation text is wrong, no data shall be changed.
- If the user is not authenticated, redirect to `/login`.
- If the transaction fails, the app shall not report deletion as complete.
- If database constraints prevent deletion of a category, the implementation shall stop for review rather than silently skipping it.

## Security And Privacy Considerations

This is a destructive privacy operation.

The action shall never accept a user ID from the client. It shall always derive the user ID from the authenticated session.

The action shall not expose deleted content in logs or error messages.

Safety and financial-style ledger data may require future retention/anonymization rules before production. For the local MVP, the behavior shall be clearly documented in the UI.

## Data Model Impact

No new table is planned for the first implementation.

If foreign key constraints make safe deletion impossible, a follow-up spec may introduce an audit or deletion-request table.

## API Impact

No external API is required.

A server action may be added for account deletion.

## UI/UX Impact

Add a danger-zone section to `/privacidad`.

The copy shall be Spanish-first, direct, and calm.

## Memory Impact

Memories shall be deleted or made unavailable as part of account data deletion.

Embeddings are not implemented yet; future embedding deletion shall be added when embeddings exist.

## AI Behavior Impact

No AI behavior changes are planned.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- Manual browser test with development data:
  - export data first;
  - attempt deletion with wrong confirmation;
  - attempt deletion with correct confirmation;
  - verify private pages redirect to login;
  - verify login no longer works for the deleted account.

## Implementation Tasks

- [x] Inspect foreign key dependencies for implemented tables.
- [x] Add deletion helper/action.
- [x] Add danger-zone UI on `/privacidad`.
- [x] Ensure session revocation through `session_version`.
- [x] Run typecheck, lint, and format checks.

## Documentation To Update

Update this feature spec if implementation scope changes.

No ADR or README update is expected unless deletion requires a new architectural decision.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-22 | Initial draft | Start Phase 7.3 basic local deletion flow |
| 2026-06-22 | Approved with recommendation to test on a throwaway user instead of `dev@example.local` | User approval |
| 2026-06-22 | Marked implemented after current-user deletion action, UI, session revocation, and checks passed | Implementation complete |
