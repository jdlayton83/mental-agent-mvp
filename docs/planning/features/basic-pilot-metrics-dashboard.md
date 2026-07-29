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
  - total and average simulated credits for completed sessions;
  - free-chat sessions;
  - guided-mode sessions;
  - average satisfaction where feedback exists;
  - reuse intent where feedback exists;
  - number of feedback entries with an optional product comment;
  - confirmed memories;
  - deleted or archived memories;
  - commitments by status;
  - safety events by level and category;
  - audit events;
  - usage events by status;
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
- The metrics page shall include total and average simulated credits for completed sessions.
- The metrics page shall include technical usage counts by status.
- The metrics page shall include safety event counts by risk level and category.
- The metrics page shall make empty states explicit.
- The metrics queries shall be server-side.
- The metrics shall be Spanish-first.
- Audit action labels shall stay readable in Spanish as new audited MVP actions are added.

## Non-Functional Requirements

- The implementation shall remain minimal and readable.
- The page shall be useful for a single-user local MVP and later pilot users.
- Typecheck, lint, and format checks shall remain clean.

## Acceptance Criteria

- `/inicio` links to the pilot metrics page.
- The metrics page loads for an authenticated user.
- The metrics page redirects anonymous visitors to `/login`.
- The page shows counts for users, sessions, memories, commitments, safety events, audit events, and usage.
- The page shows safety event category counts without displaying trigger summaries or message content.
- The page shows usage status counts so provider errors and safety replacements are visible.
- The page shows total and average simulated session credits.
- Feedback metrics handle the case where no feedback exists.
- Feedback comment metrics show counts only and never display comment text.
- No sensitive content is displayed.
- Implemented audit actions use Spanish labels.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.

## Error Cases

- If the user is not authenticated, redirect to `/login`.
- If there are no rows for a metric, show zero or a clear empty state.
- If feedback metadata is malformed, ignore that feedback entry rather than crashing.

## Security And Privacy Considerations

This MVP has no role system yet. The page shall be protected by authentication, but it is not a full admin boundary.

The page shall show aggregate operational metrics only. It shall not display message content, memory content, commitment content, feedback comment text, exported data, secrets, or prompt text.

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
- [x] Add aggregate simulated-credit metrics for completed sessions.
- [x] Add usage status counts.
- [x] Add Spanish labels for known technical usage operation types.
- [x] Add Spanish labels for implemented audit actions.
- [x] Count feedback entries with optional product comments without displaying comment text.
- [x] Count commitments by status without displaying commitment content.
- [x] Count safety events by category without displaying trigger summaries or message content.
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
| 2026-07-27 | Added feedback comment count | Track optional product feedback volume without exposing comment text |
| 2026-07-27 | Added commitment status counts | Track confirmed-next-action foundation without exposing content |
| 2026-07-27 | Added labels for newer audit actions | Keep audit metrics readable after memory, commitment, and preference controls |
| 2026-07-27 | Added aggregate session credit metrics | Support pilot cost review without exposing session content |
| 2026-07-27 | Added usage status counts | Surface technical failures and replacements without exposing logs |
| 2026-07-29 | Added safety category counts | Make guardrail activation visible without exposing sensitive content |
