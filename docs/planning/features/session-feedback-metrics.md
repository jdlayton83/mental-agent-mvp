# Feature Specification: Session Feedback Metrics

## Feature Name

Session feedback metrics.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-21.

## Objective

Collect lightweight post-session feedback so the MVP can compare free chat and guided modes without adding heavy analytics infrastructure.

The feature shall capture satisfaction, intent to reuse, and a short optional product-feedback comment after completed sessions while avoiding sensitive content collection.

## Problem / Context

The backlog requires comparing free chat and guided modes by completion, duration, satisfaction, reuse intention, and technical cost.

The app records session type, completion, duration, usage events, credits, summaries, satisfaction, reuse intent, and optional product-feedback comments. This feature keeps that feedback lightweight and separate from sensitive conversation content.

## User Value

The user can quickly indicate whether a session helped, which guides product improvement without asking for long feedback or exposing private details.

## Scope

- Add a lightweight feedback form for recent completed sessions.
- Capture satisfaction on a small numeric scale.
- Capture whether the user would use that type of session again.
- Capture a short optional product-feedback comment.
- Store feedback in `sessions.metadata` under a versioned key.
- Show whether feedback has already been submitted.
- Support both free chat and guided sessions.
- Keep feedback separate from conversation content and memory.

## Out Of Scope

- Do not add a new feedback table yet.
- Do not add external analytics.
- Do not collect payment intent in this slice.
- Do not modify safety, memory, or credit rules.
- Do not add charts or dashboards yet.

## Functional Requirements

- The system shall show a feedback option for completed sessions listed on `/inicio`.
- The user shall be able to choose a satisfaction score from 1 to 5.
- The user shall be able to answer whether they would use the session type again.
- The user shall be able to add a short optional product-feedback comment.
- The system shall store feedback only for sessions owned by the current user.
- The system shall not allow feedback to overwrite another user's data.
- The system shall show a submitted state after feedback is saved.
- The system shall preserve existing session metadata when adding feedback.
- The system shall trim optional feedback comments and store empty comments as `null`.
- If feedback input is invalid or cannot be saved, the home page shall show a short Spanish status message.

## Non-Functional Requirements

- The implementation shall remain minimal and use existing session data.
- The UI copy shall be Spanish-first.
- The feedback shall avoid collecting sensitive content.
- Typecheck, lint, and format checks shall remain clean.

## Acceptance Criteria

- Completed session summaries on `/inicio` show feedback controls when feedback is missing.
- Submitting feedback saves satisfaction and reuse intent to the matching session metadata.
- Submitted feedback is visible on `/inicio`.
- Feedback cannot be submitted for a session belonging to another user.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.
- Invalid feedback redirects to `/inicio` with a Spanish status message.

## Error Cases

- If the user is not authenticated, feedback submission shall redirect to `/login`.
- If the session does not belong to the user, the action shall do nothing and return safely.
- If the session is not completed, the action shall not save feedback.
- If form input is invalid, the UI shall show a Spanish error message.

## Security And Privacy Considerations

Feedback comments shall be optional, short, and framed as product feedback rather than intimate conversation content.

The action shall always filter by `user_id` and session `status = completed`.

## Data Model Impact

No new table is planned.

Feedback shall be stored in `sessions.metadata.feedback` with a versioned structure.

The optional comment shall be stored in the same metadata object as `comment` and shall not be used for memory extraction.

## API Impact

No external API is required.

A server action may be added for submitting feedback.

## UI/UX Impact

The feedback form shall appear near recent session summaries on `/inicio`.

It shall be short enough to answer quickly after a session.

The optional comment field shall ask for brief product feedback without inviting sensitive personal details.

## Memory Impact

No memories shall be created from feedback.

## AI Behavior Impact

No AI behavior changes are planned.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- Manual browser test:
  - complete a guided session;
  - submit feedback from `/inicio`;
  - refresh and confirm submitted state;
  - submit an optional short comment and confirm it is shown as saved feedback;
  - verify invalid input is rejected.

## Implementation Tasks

- [x] Add feedback parsing helpers for session metadata.
- [x] Add a server action to submit feedback.
- [x] Support a short optional feedback comment.
- [x] Select feedback metadata with recent session summaries.
- [x] Render feedback controls on `/inicio`.
- [x] Run typecheck, lint, and format checks.

## Documentation To Update

Update this feature spec if scope changes.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-21 | Initial draft | Prepare Phase 6.3 lightweight comparison metrics |
| 2026-06-21 | Approved 1-5 satisfaction scale and yes/no reuse intent | User approval |
| 2026-06-21 | Marked implemented after metadata storage, `/inicio` controls, and checks passed | Implementation complete |
| 2026-07-27 | Updated current-state wording | Clarify that satisfaction and reuse intent are now collected |
| 2026-07-27 | Added optional short product-feedback comment | Align with backlog feedback requirement while avoiding sensitive content collection |
| 2026-07-27 | Added feedback status messages | Make invalid or unsaved feedback visible to the user |
