# Feature Specification: Guided Journaling Mode

## Feature Name

Guided journaling mode.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-28.

## Objective

Implement the guided mode "Diario guiado" as a structured non-clinical reflection flow that helps the user write about one current situation, notice what matters, and close with a concise synthesis.

The mode shall use minimal interpretation, one main question per turn, and shall not explore trauma, suggest hidden causes, or imply recovered memories.

## Problem / Context

The MVP specification defines `guided_journaling` as one of the six guided modes with the minimum result "síntesis de aprendizajes".

The current app already supports `organize_thoughts`, `make_decision`, and `create_or_review_habit` using the same guided-mode pattern: `sessions.metadata`, saved messages, summaries, credit reservations, safety interruption, and output validation. The seed already includes `guided_journaling` in the guided mode catalog, but it is inactive and has no route or flow implementation.

## User Value

Users can reflect on a situation with gentle structure and finish with a useful synthesis, without needing the agent to interpret them, diagnose them, or lead a therapeutic process.

## Scope

- Activate `guided_journaling` in the guided mode catalog seed.
- Add a Spanish-first route for the mode.
- Reuse the current guided-mode implementation pattern from the existing modes.
- Create or resume a guided session linked to `guided_journaling`.
- Persist stage progress in `sessions.metadata`.
- Save user and assistant messages in the existing message history.
- Use the existing safety classifier, safe response path, and output validator.
- Produce a final Spanish summary with key observations, one learning, and an optional next step or closing phrase.

## Out Of Scope

- Do not implement therapy, trauma processing, exposure, regression, diagnosis, treatment, or clinical journaling protocols.
- Do not suggest hidden causes, repressed memories, or unconscious meanings.
- Do not create automatic memory records from this mode.
- Do not add a dedicated journaling table.
- Do not add reminders, streaks, mood tracking, sentiment analysis, embeddings, or new progression tables.
- Do not implement the remaining guided modes.
- Do not add new dependencies.
- Do not run `drizzle-kit generate`.

## Functional Requirements

- The system shall expose `guided_journaling` to authenticated, onboarded users.
- The flow shall include these stages:
  1. choose one current focus;
  2. describe the situation in the user's own words;
  3. separate observable facts from interpretations;
  4. name what feels important now without diagnosing emotions;
  5. identify one value, need, or priority involved;
  6. identify one learning or observation;
  7. choose an optional next step or closing phrase;
  8. summarize.
- The assistant shall ask one main question per turn.
- The assistant shall use minimal interpretation and shall not claim to know what the user's writing means.
- The assistant shall not infer hidden psychological causes without sufficient context.
- Any hypothesis about emotion, motivation, cause, or pattern shall be cautious and confirmed with the user when material.
- The assistant shall not explore trauma, ask for graphic detail, or suggest recovered memories.
- Risk signals shall trigger the safety protocol instead of ordinary guided flow.
- The user shall be able to leave and return without losing progress.
- The user shall be able to start another journaling flow after completing one.

## Non-Functional Requirements

- The implementation shall remain minimal and reuse existing guided-mode patterns.
- UI copy shall be Spanish-first.
- The implementation shall avoid broad abstractions unless they clearly reduce duplication across guided modes.
- Typecheck, lint, format check, tests, and build shall remain clean.

## Acceptance Criteria

- An authenticated, onboarded user can open "Diario guiado" from the app.
- The app creates or resumes an active guided session linked to `guided_journaling`.
- The page shows progress through the eight stages.
- User messages advance through the flow.
- The assistant asks one main question at a time.
- Safety responses override ordinary guided behavior.
- Completion produces a final Spanish summary with key observations and one learning.
- The user can start another journaling flow after completion.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run test` passes.

## Error Cases

- If the mode is missing or inactive, the user shall see a safe Spanish error state or return to `/inicio`.
- If the user is not onboarded, the user shall be redirected to `/onboarding`.
- If the AI provider fails, the app shall use a local fallback response and keep progress consistent.
- If credit reservation fails, the app shall explain the problem without creating an inconsistent turn.
- If safety risk is detected, the safety protocol shall take precedence over the journaling flow.

## Security And Privacy Considerations

The mode shall not weaken authentication, user isolation, safety checks, output validation, private mode behavior, or credit integrity.

Journaling content may be personal. The mode shall store only the progress needed to resume and summarize the session.

The mode shall not treat journal text as clinical evidence and shall not infer health, trauma, diagnosis, abuse, or treatment needs.

## Data Model Impact

No new table is planned.

The existing `guided_modes` seed shall be updated so `guided_journaling` is active.

Guided progress may be stored in `sessions.metadata` using a small versioned structure.

## API Impact

No public external API is required.

Server actions and internal module functions may be added for this guided mode.

## UI/UX Impact

The app shall add a clear entry point for "Diario guiado".

The route should be `/modos/diario-guiado`.

The page shall keep the same simple guided-mode interaction style used by the existing modes.

## Memory Impact

This slice shall not automatically create memories.

Any future memory candidate from the final summary shall require a separate feature spec and shall follow existing confirmation and safety rules.

## AI Behavior Impact

The assistant prompt shall enforce non-clinical reflective support, one main question per turn, minimal interpretation, cautious hypotheses, and no trauma exploration or recovered-memory framing.

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
  - start a new journaling flow after completion;
  - test at least one safety-triggering input.

## Implementation Tasks

- [x] Update the seed so `guided_journaling` is active.
- [x] Add a guided-journaling flow module.
- [x] Add server actions for start/resume/restart/advance.
- [x] Add a guided route at `/modos/diario-guiado`.
- [x] Add a composer component.
- [x] Add an entry point from `/inicio`.
- [x] Add or update focused tests for the journaling flow where practical.
- [x] Run typecheck, lint, format check, tests, and build.

## Documentation To Update

Update this feature spec if implementation scope changes.

No ADR or README update is expected unless the implementation introduces a new architectural decision.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-28 | Initial draft | Prepare fourth guided mode implementation |
| 2026-06-28 | Marked implemented after route, flow, seed activation, tests, and checks passed | Implementation complete |
