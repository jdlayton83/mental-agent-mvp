# Feature Specification: Basic Session History

## Feature Name

Basic session history.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-29.

## Objective

Add a simple authenticated history page where the user can review recent conversations and guided sessions using existing database records.

The page shall make continuity visible without exposing unnecessary message content or adding new storage.

## Problem / Context

The MVP specification requires visible conversation and session history. The current home page shows recent summaries and usage, but there is no focused history page for the user to scan recent free-chat and guided-mode sessions.

## User Value

Users can see what they have used recently, distinguish free chat from guided modes, and find whether a session is active or completed without relying only on the home dashboard.

## Scope

- Add a protected Spanish-first route at `/historial`.
- Read existing `sessions`, `conversations`, `guided_modes` and `session_summaries` data for the authenticated user.
- Show recent session title, type, guided mode when present, status, privacy flag, last activity, credits and summary when available.
- Add an entry point from `/inicio`.
- Keep the implementation read-only.

## Out Of Scope

- Do not add search, filters, pagination or export.
- Do not show raw message content.
- Do not add conversation resume actions in this slice.
- Do not create, update or delete sessions.
- Do not add tables, migrations or seed data.
- Do not change the chat or guided-mode flows.

## Functional Requirements

- The page shall require authentication.
- If onboarding is incomplete, the user shall be redirected to `/onboarding`.
- The page shall list up to 25 recent sessions for the current user.
- The list shall include free chat and guided-mode sessions.
- Deleted conversations shall not be shown.
- The page shall show an empty state if no sessions exist.
- The page shall use Spanish labels.

## Non-Functional Requirements

- The query shall be scoped by `user_id`.
- The page shall not expose `password_hash`, secrets, raw prompts, API keys or raw message content.
- The implementation shall remain minimal and avoid new abstractions.
- Typecheck, lint, format check and build shall remain clean.

## Acceptance Criteria

- An authenticated, onboarded user can open `/historial`.
- Anonymous users are redirected to `/login`.
- Users without completed onboarding are redirected to `/onboarding`.
- Recent sessions are displayed with title, type, status, last activity and summary when available.
- Raw message content is not displayed.
- `/inicio` links to `/historial`.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run build -- --webpack` passes.

## Error Cases

- If no sessions exist, the page shall show a calm empty state.
- If a session has no title, the page shall show a safe fallback title.
- If a session has no summary yet, the page shall say that the summary is not available yet.

## Security And Privacy Considerations

The history query shall only return records for the current authenticated user.

The page shall show metadata and summaries, not raw message content. This reduces accidental exposure on a dashboard-like surface while still providing continuity.

## Data Model Impact

No data model change is planned.

## API Impact

No public external API is required.

An internal read model may be added under `src/modules/sessions/`.

## UI/UX Impact

Add a focused `/historial` page and a link from `/inicio`.

The page shall reuse the existing simple panel and list styles.

## Memory Impact

No memory behavior changes.

## AI Behavior Impact

No AI behavior changes.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build -- --webpack`
- Manual browser test:
  - open `/historial` after login;
  - confirm sessions appear;
  - confirm raw messages are not shown;
  - confirm anonymous access redirects to `/login`.

## Implementation Tasks

- [x] Add a session history read model.
- [x] Add `/historial`.
- [x] Add link from `/inicio`.
- [x] Run typecheck, lint, format check and build.

## Documentation To Update

Update this feature spec if implementation scope changes.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-29 | Initial draft | Add focused session history page |
| 2026-06-29 | Marked implemented after read model, route, link and checks passed | Implementation complete |
