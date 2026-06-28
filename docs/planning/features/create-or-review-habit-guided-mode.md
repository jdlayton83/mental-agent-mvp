# Feature Specification: Create Or Review Habit Guided Mode

## Feature Name

Create or review habit guided mode.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-25.

## Objective

Implement the guided mode "Crear o revisar un hábito" as a structured non-clinical flow that helps the user design or adjust one realistic habit with a minimal action and a review point.

The mode shall avoid guilt, streak pressure, perfectionism, diagnosis, or therapeutic framing.

## Problem / Context

The MVP specification defines `create_or_review_habit` as one of the six guided modes with the minimum result "acción mínima y revisión".

The current app already supports two guided modes, `organize_thoughts` and `make_decision`, using `sessions.metadata`, saved messages, summaries, credit reservations, safety interruption, and output validation. The seed already includes `create_or_review_habit` in the guided mode catalog, but it is inactive and has no route or flow implementation.

## User Value

Users can turn a desired change into a small practical habit, or adjust an existing habit that is not working, without feeling judged or pushed into unrealistic consistency.

## Scope

- Activate `create_or_review_habit` in the guided mode catalog seed.
- Add a Spanish-first route for the mode.
- Reuse the current guided-mode implementation pattern from the existing modes.
- Create or resume a guided session linked to `create_or_review_habit`.
- Persist stage progress in `sessions.metadata`.
- Save user and assistant messages in the existing message history.
- Use the existing safety classifier, safe response path, and output validator.
- Produce a final Spanish summary with one minimal habit action, likely context, expected barrier, and review date or review moment.

## Out Of Scope

- Do not create a dedicated habits table in this slice.
- Do not create reminders, notifications, streaks, calendars, goals, embeddings, or new progression tables.
- Do not create automatic memory records from this mode.
- Do not implement the remaining guided modes.
- Do not add new dependencies.
- Do not run `drizzle-kit generate`.
- Do not present the mode as therapy, treatment, addiction care, or clinical behavior change.

## Functional Requirements

- The system shall expose `create_or_review_habit` to authenticated, onboarded users.
- The flow shall include these stages:
  1. choose whether the user wants to create a habit or review an existing one;
  2. name the desired outcome;
  3. define the smallest realistic action;
  4. choose the context or trigger;
  5. identify one likely barrier;
  6. define an adjustment for difficult days;
  7. choose a review moment;
  8. summarize.
- The assistant shall ask one main question per turn.
- The assistant shall not frame habit difficulty as weakness, lack of willpower, or failure.
- The assistant shall not use streaks, shame, urgency, or dependency-forming language.
- The assistant shall not infer hidden psychological causes for habit difficulty without sufficient context.
- Any hypothesis about motivation, avoidance, emotion, or cause shall be cautious and confirmed with the user when material.
- Risk signals shall trigger the safety protocol instead of ordinary guided flow.
- The user shall be able to leave and return without losing progress.
- The user shall be able to start another habit flow after completing one.

## Non-Functional Requirements

- The implementation shall remain minimal and reuse existing guided-mode patterns.
- UI copy shall be Spanish-first.
- The implementation shall avoid broad abstractions unless they clearly reduce duplication across guided modes.
- Typecheck, lint, format check, tests, and build shall remain clean.

## Acceptance Criteria

- An authenticated, onboarded user can open "Crear o revisar un hábito" from the app.
- The app creates or resumes an active guided session linked to `create_or_review_habit`.
- The page shows progress through the eight stages.
- User messages advance through the flow.
- The assistant asks one main question at a time.
- Safety responses override ordinary guided behavior.
- Completion produces a final Spanish summary with a minimal action and review moment.
- The user can start another habit flow after completion.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run test` passes.

## Error Cases

- If the mode is missing or inactive, the user shall see a safe Spanish error state or return to `/inicio`.
- If the user is not onboarded, the user shall be redirected to `/onboarding`.
- If the AI provider fails, the app shall use a local fallback response and keep progress consistent.
- If credit reservation fails, the app shall explain the problem without creating an inconsistent turn.
- If safety risk is detected, the safety protocol shall take precedence over the habit flow.

## Security And Privacy Considerations

The mode shall not weaken authentication, user isolation, safety checks, output validation, private mode behavior, or credit integrity.

Habit content may be personal. The mode shall store only the progress needed to resume and summarize the session.

The mode shall not treat habit difficulty as clinical evidence and shall not infer health, addiction, trauma, diagnosis, or treatment needs.

## Data Model Impact

No new table is planned.

The existing `guided_modes` seed shall be updated so `create_or_review_habit` is active.

Guided progress may be stored in `sessions.metadata` using a small versioned structure.

## API Impact

No public external API is required.

Server actions and internal module functions may be added for this guided mode.

## UI/UX Impact

The app shall add a clear entry point for "Crear o revisar un hábito".

The route should be `/modos/habito`.

The page shall keep the same simple guided-mode interaction style used by the existing modes.

## Memory Impact

This slice shall not automatically create memories or habits.

Any future memory or habit candidate from the final summary shall require a separate feature spec and shall follow existing confirmation and safety rules.

## AI Behavior Impact

The assistant prompt shall enforce non-clinical habit support, one main question per turn, cautious hypotheses, no unsupported psychological inference, and no guilt-based habit framing.

Safety responses shall override guided-mode behavior.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run test`
- Manual browser test:
  - open the guided mode;
  - answer several stages;
  - leave and return;
  - complete the flow;
  - start a new habit flow after completion;
  - test at least one safety-triggering input.

## Implementation Tasks

- [x] Update the seed so `create_or_review_habit` is active.
- [x] Add a create-or-review-habit flow module.
- [x] Add server actions for start/resume/restart/advance.
- [x] Add a guided route at `/modos/habito`.
- [x] Add a composer component.
- [x] Add an entry point from `/inicio`.
- [x] Add or update focused tests for the habit flow where practical.
- [x] Run typecheck, lint, format check, tests, and build.

## Documentation To Update

Update this feature spec if implementation scope changes.

No ADR or README update is expected unless the implementation introduces a new architectural decision.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-25 | Initial draft | Prepare third guided mode implementation |
| 2026-06-25 | Marked implemented after route, flow, seed activation, tests, and checks passed | Implementation complete |
