# Feature Specification: Make Decision Guided Mode

## Feature Name

Make decision guided mode.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-19.

## Objective

Implement the first guided mode, "Tomar una decisión", as a structured conversation that helps the user clarify a decision without choosing for them.

The mode shall guide the user through one main question at a time, preserve progress, and close with a concise summary and next step.

## Problem / Context

The MVP needs to validate whether a structured guided experience creates more value than free chat.

The catalog foundation now defines `make_decision` as the only active guided mode. The current app has a free conversation page, safety checks, sessions, messages, credits, usage tracking, summaries, and memory candidates, but no guided mode UI or guided flow controller.

## User Value

Users can work through a real decision with structure, calm pacing, and a visible path from uncertainty to a provisional next step.

## Scope

- Add a Spanish-first guided mode entry point for `make_decision`.
- Show the mode purpose, current stage, and progress.
- Create or reuse a guided session linked to `guided_modes.id`.
- Persist stage progress so the user can leave and continue later.
- Process user messages through the existing safety classifier before normal guided flow.
- Generate assistant responses that follow the guided decision stages.
- Save user and assistant messages in the existing message history.
- Allow the user to exit the guided mode without deleting progress.
- Produce a final summary when the flow reaches completion.

## Out Of Scope

- Do not implement the other five guided modes.
- Do not create goals, habits, consent, audit, embeddings, or prompt version tables.
- Do not add payments or real pricing.
- Do not create a mobile-specific UI.
- Do not bypass the existing safety flow.
- Do not make the agent decide for the user.
- Do not present the product as therapy or clinical care.

## Functional Requirements

- The system shall expose the active `make_decision` mode to authenticated, onboarded users.
- The flow shall include these stages:
  1. define the decision;
  2. identify options;
  3. identify criteria;
  4. review risks;
  5. review consequences;
  6. differentiate fear and evidence;
  7. choose a next step;
  8. summarize.
- The assistant shall ask one main question per turn.
- The assistant shall not choose for the user.
- The assistant shall treat emotional or causal interpretations as hypotheses, not conclusions.
- The system shall preserve current stage and collected answers in session metadata or an equivalent minimal persistence mechanism.
- The system shall keep guided messages linked to the guided session.
- The system shall use the same safety interruption path as free conversation when risk is detected.
- The user shall be able to return to `/inicio` or free conversation without losing the guided session.
- The final stage shall create a concise summary in Spanish.

## Non-Functional Requirements

- The implementation shall remain minimal and reuse existing modules when practical.
- UI copy shall be Spanish-first.
- The flow shall be usable without adding a new dependency.
- TypeScript strictness, linting, and formatting shall remain clean.
- The implementation shall avoid broad abstractions until another guided mode needs them.

## Acceptance Criteria

- An authenticated, onboarded user can open the "Tomar una decisión" guided mode from the app.
- The app creates or resumes an active guided session linked to `make_decision`.
- The page shows progress through the eight stages.
- Each user message advances or reinforces the current stage according to the flow rules.
- The assistant asks one main question at a time.
- Risk signals trigger the safety response instead of the ordinary guided response.
- The user can leave the mode and return without losing progress.
- Completion produces a final Spanish summary.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.

## Error Cases

- If the guided mode is missing or inactive, the user shall see a safe Spanish error state or be returned to `/inicio`.
- If the user has not completed onboarding, the user shall be redirected to `/onboarding`.
- If the AI provider fails, the user message shall remain saved when possible and the UI shall show a recoverable Spanish error.
- If safety risk is detected, the safety protocol shall take precedence over the guided flow.
- If credit reservation fails, the system shall explain the issue without creating an inconsistent turn.

## Security And Privacy Considerations

The guided flow shall not weaken authentication, user isolation, safety checks, output validation, or private mode behavior.

The mode may store structured progress in session metadata. It shall store only what is needed to resume and summarize the guided session.

## Data Model Impact

No new table is planned for the first implementation.

Guided progress may be stored in `sessions.metadata` using a small versioned structure. If this becomes insufficient, a later feature spec may introduce a dedicated progression table.

## API Impact

No public external API is required.

Server actions or internal module functions may be added to start, resume, advance, and exit the guided mode.

## UI/UX Impact

The UI shall provide a focused guided mode page or panel in Spanish.

It shall show stage progress without overwhelming the chat experience.

It shall make exiting clear and non-destructive.

## Memory Impact

This slice shall not automatically create memories.

Any future memory candidates from the final summary shall follow the existing confirmation and safety rules.

## AI Behavior Impact

The assistant prompt shall enforce the decision-mode structure, one main question per turn, cautious hypotheses, non-clinical boundaries, and no decision-making on behalf of the user.

Safety responses shall override guided-mode behavior.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- Manual browser test:
  - open the guided mode;
  - answer several stages;
  - leave and return;
  - complete the flow;
  - test at least one safety-triggering input.

## Implementation Tasks

- [x] Add internal guided mode lookup/start/resume helpers.
- [x] Add a decision-flow module with stage definitions and prompt construction.
- [x] Add a guided decision page or route.
- [x] Add a guided conversation composer/action.
- [x] Persist progress in session metadata.
- [x] Save guided user and assistant messages.
- [x] Add exit/resume behavior.
- [x] Run typecheck, lint, and format checks.

## Documentation To Update

Update this feature spec if implementation scope changes.

No ADR or README update is expected unless the implementation introduces a new architectural decision.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-19 | Initial draft | Prepare first guided mode implementation |
| 2026-06-20 | Approved route `/modos/tomar-decision` and close-on-summary behavior | User approval |
| 2026-06-20 | Marked implemented after route, flow, persistence, safety handling, and checks passed | Implementation complete |
