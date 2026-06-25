# Feature Specification: Basic Pilot Metrics Dashboard

## Feature Name

Basic pilot metrics dashboard.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-25.

## Objective

Add a minimal pilot metrics page so the project owner can inspect whether the MVP is being used, where value appears, and whether critical privacy and safety flows are active.

The feature shall reuse existing database records and avoid adding analytics infrastructure in this slice.

## Problem / Context

The backlog requires pilot readiness metrics such as onboarding completion, first conversation, completed sessions, guided mode usage, memories confirmed or deleted, satisfaction, reuse intent, cost, errors, and safety events.

The app already records users, profiles, sessions, session feedback, usage events, memories, safety events, consent records, and audit events. There is no single place to review these signals.

## User Value

The project owner can quickly understand MVP health before inviting pilot users, without querying the database manually or exposing sensitive content.

## Scope

- Add a protected pilot metrics page.
- Show aggregate counts and simple ratios from existing tables.
- Include metrics for:
  - active users;
  - onboarding completed;
  - users with at least one conversation;
  - completed sessions;
  - free-chat sessions;
  - guided-mode sessions;
  - average satisfaction where feedback exists;
  - reuse intent where feedback exists;
  - confirmed memories;
  - deleted or archived memories;
  - safety events;
  - audit events;
  - recent technical usage events.
- Link the page from `/inicio`.

## Out Of Scope

- Do not add external analytics.
- Do not add tracking scripts.
- Do not add charts in this slice.
- Do not add a new metrics table.
- Do not expose conversation text, memory content, prompts, secrets, or exported JSON.
- Do not implement multi-role admin authorization yet.
- Do not modify AI behavior.

## Functional Requirements

- The metrics page shall require authentication.
- The metrics page shall show aggregate product metrics using existing data.
- The metrics page shall not show private conversation content or memory content.
- The metrics page shall include session feedback averages only when feedback exists.
- The metrics page shall make empty states explicit.
- The metrics queries shall be server-side.
- The metrics shall be Spanish-first.

## Non-Functional Requirements

- The implementation shall remain minimal and readable.
- The page shall be useful for a single-user local MVP and later pilot users.
- Typecheck, lint, and format checks shall remain clean.

## Acceptance Criteria

- `/inicio` links to the pilot metrics page.
- The metrics page loads for an authenticated user.
- The metrics page redirects anonymous visitors to `/login`.
- The page shows counts for users, sessions, memories, safety events, audit events, and usage.
- Feedback metrics handle the case where no feedback exists.
- No sensitive content is displayed.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.

## Error Cases

- If the user is not authenticated, redirect to `/login`.
- If there are no rows for a metric, show zero or a clear empty state.
- If feedback metadata is malformed, ignore that feedback entry rather than crashing.

## Security And Privacy Considerations

This MVP has no role system yet. The page shall be protected by authentication, but it is not a full admin boundary.

The page shall show aggregate operational metrics only. It shall not display message content, memory content, exported data, secrets, or prompt text.

## Data Model Impact

No schema change is planned.

The feature reads existing tables only.

## API Impact

No public API is planned.

Internal query helpers may be added.

## UI/UX Impact

Add a Spanish-first page, likely `/metricas`, with compact sections suitable for scanning.

The page shall feel operational, not like a marketing dashboard.

## Memory Impact

The feature may count memories by status but shall not read or display memory content.

Memory data shall not be used to make psychological inferences.

## AI Behavior Impact

No AI behavior changes are planned.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- Manual browser test:
  - open `/metricas`;
  - verify counts render;
  - verify no sensitive text is displayed;
  - verify `/inicio` link works.

## Implementation Tasks

- [x] Add pilot metrics query helper.
- [x] Add `/metricas` page.
- [x] Add `/inicio` link.
- [x] Run typecheck, lint, and format checks.

## Documentation To Update

Update this feature spec if scope changes.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-25 | Initial draft | Define pilot-readiness metrics slice |
| 2026-06-25 | Marked implemented | Metrics helper, `/metricas` page, `/inicio` link, and checks completed |
