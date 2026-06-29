# Feature Specification: Personal Development Guided Mode

## Feature Name

Personal development guided mode.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-29.

## Objective

Implement the guided mode "Desarrollo personal" as a structured non-clinical flow that helps the user review values, priorities, strengths, goals and current progress, then choose a realistic focus and small action plan.

The mode shall support reflection and agency without therapy, diagnosis, pseudoscience, personality typing, transformation promises or pressure to optimize the user's life.

## Problem / Context

The MVP specification defines `personal_development` as one of the six guided modes with the minimum result "foco y plan de acción".

The current app already supports the other five guided modes using the same pattern: `sessions.metadata`, saved messages, summaries, credit reservations, safety interruption and output validation. The seed already includes `personal_development` in the guided mode catalog, but it is inactive and has no route or flow implementation.

## User Value

Users can step back from daily noise, identify what matters now, recognize usable strengths or resources, and choose one small next action without the agent pretending to know hidden causes or promising personal transformation.

## Scope

- Activate `personal_development` in the guided mode catalog seed.
- Add a Spanish-first route for the mode.
- Reuse the current guided-mode implementation pattern from the existing modes.
- Create or resume a guided session linked to `personal_development`.
- Persist stage progress in `sessions.metadata`.
- Save user and assistant messages in the existing message history.
- Use the existing safety classifier, safe response path and output validator.
- Produce a final Spanish summary with values or priorities, strengths or resources, current progress, obstacle or constraint, focus and small action plan.

## Out Of Scope

- Do not implement therapy, diagnosis, treatment, clinical care, life coaching certification claims or mental health assessment.
- Do not use pseudoscience, personality typing, manifestation claims or transformation promises.
- Do not decide the user's values, purpose, identity or life direction.
- Do not create automatic memory records from this mode.
- Do not add goals, habits, reminders, calendar events, embeddings or new progression tables.
- Do not implement a new guided-mode framework.
- Do not add new dependencies.
- Do not run `drizzle-kit generate`.

## Functional Requirements

- The system shall expose `personal_development` to authenticated, onboarded users.
- The flow shall include these stages:
  1. choose the area or theme the user wants to review;
  2. explain why it matters now;
  3. identify one value, priority or criterion the user wants to protect;
  4. identify one strength, resource or support already available;
  5. review concrete signs of current progress;
  6. name one obstacle or constraint without blame;
  7. choose one focus and one small action for the next few days;
  8. summarize.
- The assistant shall ask one main question per turn.
- The assistant shall express hypotheses cautiously and confirm material interpretations with the user.
- The assistant shall not infer hidden psychological causes, identity traits or life purpose without sufficient context.
- The assistant shall not promise transformation, self-actualization, healing or guaranteed outcomes.
- If clinical, self-harm, dependency, coercion or other risk signals are detected, the safety protocol shall override the ordinary guided flow.
- The user shall be able to leave and return without losing progress.
- The user shall be able to start another personal-development flow after completing one.

## Non-Functional Requirements

- The implementation shall remain minimal and reuse existing guided-mode patterns.
- UI copy shall be Spanish-first.
- The implementation shall avoid broad abstractions unless they clearly reduce duplication across guided modes.
- Typecheck, lint, format check, tests and build shall remain clean.

## Acceptance Criteria

- An authenticated, onboarded user can open "Desarrollo personal" from the app.
- The app creates or resumes an active guided session linked to `personal_development`.
- The page shows progress through the eight stages.
- User messages advance through the flow.
- The assistant asks one main question at a time.
- Safety responses override ordinary guided behavior.
- Completion produces a final Spanish summary with focus and a small action plan.
- The user can start another personal-development flow after completion.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run test` passes.

## Error Cases

- If the mode is missing or inactive, the user shall see a safe Spanish error state or return to `/inicio`.
- If the user is not onboarded, the user shall be redirected to `/onboarding`.
- If the AI provider fails, the app shall use a local fallback response and keep progress consistent.
- If credit reservation fails, the app shall explain the problem without creating an inconsistent turn.
- If safety risk is detected, the safety protocol shall take precedence over the personal-development flow.

## Security And Privacy Considerations

The mode shall not weaken authentication, user isolation, safety checks, output validation, private mode behavior or credit integrity.

Personal-development content may include values, identity, goals or sensitive personal context. The mode shall store only the progress needed to resume and summarize the session.

The mode shall not make unsupported psychological inferences, generate dependency or pressure the user toward a particular life direction.

## Data Model Impact

No new table is planned.

The existing `guided_modes` seed shall be updated so `personal_development` is active.

Guided progress may be stored in `sessions.metadata` using a small versioned structure.

## API Impact

No public external API is required.

Server actions and internal module functions may be added for this guided mode.

## UI/UX Impact

The app shall add a clear entry point for "Desarrollo personal".

The route should be `/modos/desarrollo-personal`.

The page shall keep the same simple guided-mode interaction style used by the existing modes.

## Memory Impact

This slice shall not automatically create memories.

Any future memory candidate from the final summary shall require a separate feature spec and shall follow existing confirmation and safety rules, especially because values, goals and identity statements can be personal or sensitive.

## AI Behavior Impact

The assistant prompt shall enforce non-clinical personal development, one main question per turn, cautious hypotheses, no unsupported psychological inference, no pseudoscience and no transformation promises.

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
  - start a new personal-development flow after completion;
  - test at least one safety-triggering input.

## Implementation Tasks

- [x] Update the seed so `personal_development` is active.
- [x] Add a personal-development flow module.
- [x] Add server actions for start/resume/restart/advance.
- [x] Add a guided route at `/modos/desarrollo-personal`.
- [x] Add a composer component.
- [x] Add an entry point from `/inicio`.
- [x] Add or update focused tests for the flow where practical.
- [x] Run typecheck, lint, format check, tests and build.

## Documentation To Update

Update this feature spec if implementation scope changes.

No ADR or README update is expected unless the implementation introduces a new architectural decision.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-29 | Initial draft | Prepare sixth guided mode implementation |
| 2026-06-29 | Marked implemented after route, flow, seed activation, tests and checks passed | Implementation complete |
