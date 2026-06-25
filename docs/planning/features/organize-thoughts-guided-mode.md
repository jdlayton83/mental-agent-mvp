# Feature Specification: Organize Thoughts Guided Mode

## Feature Name

Organize thoughts guided mode.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-20.

## Objective

Implement the guided mode "Ordenar mi cabeza" as a structured non-clinical flow for moments when the user feels mentally overloaded, scattered, or unsure where to start.

The mode shall help the user separate facts, worries, tasks, and things outside their control, then close with one priority and one small next step.

## Problem / Context

The first guided mode, "Tomar una decisión", supports clarity around choices. The product also needs a more general mental-assistance mode for everyday cognitive and emotional overload.

The MVP specification already defines `organize_thoughts` as a guided mode with the minimum result "prioridad y siguiente paso". The catalog seed already includes it, but it is inactive and has no UI or flow implementation.

## User Value

Users can unload what is in their head and receive gentle structure without the agent diagnosing, interpreting too early, or turning the interaction into therapy.

## Scope

- Activate `organize_thoughts` in the guided mode catalog seed.
- Add a Spanish-first route for the mode.
- Reuse the current guided-mode pattern from `make_decision`.
- Create or resume a guided session linked to `organize_thoughts`.
- Persist stage progress in `sessions.metadata`.
- Save user and assistant messages in the existing message history.
- Use the existing safety classifier and safe response path.
- Produce a final Spanish summary with one priority and one small next step.

## Out Of Scope

- Do not implement therapy, diagnosis, clinical advice, or crisis intervention outside the existing safety flow.
- Do not infer hidden emotional causes.
- Do not create goals, habits, consent, audit, embeddings, prompt version, or new progression tables.
- Do not implement the other guided modes in this slice.
- Do not add new dependencies.
- Do not run `drizzle-kit generate`.

## Functional Requirements

- The system shall expose `organize_thoughts` to authenticated, onboarded users.
- The flow shall include these stages:
  1. brain dump;
  2. separate facts;
  3. name worries;
  4. identify tasks;
  5. identify what is outside control;
  6. choose one priority;
  7. choose one small next step;
  8. summarize.
- The assistant shall ask one main question per turn.
- The assistant shall avoid premature assumptions about why the user feels overwhelmed.
- The assistant shall distinguish facts from interpretations and worries.
- The assistant shall not present itself as a therapist or substitute for professional care.
- Risk signals shall trigger the safety protocol instead of ordinary guided flow.
- The user shall be able to leave and return without losing progress.

## Non-Functional Requirements

- The implementation shall remain minimal and reuse existing guided-mode patterns.
- UI copy shall be Spanish-first.
- The implementation shall avoid broad abstractions unless they reduce duplication between guided modes.
- Typecheck, lint, and format checks shall remain clean.

## Acceptance Criteria

- An authenticated, onboarded user can open "Ordenar mi cabeza" from the app.
- The app creates or resumes an active guided session linked to `organize_thoughts`.
- The page shows progress through the eight stages.
- User messages advance through the flow.
- The assistant asks one main question at a time.
- Safety responses override ordinary guided behavior.
- Completion produces a final Spanish summary with one priority and one small next step.
- The user can start another "Ordenar mi cabeza" flow after completion.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.

## Error Cases

- If the mode is missing or inactive, the user shall see a safe Spanish error state or return to `/inicio`.
- If the user is not onboarded, the user shall be redirected to `/onboarding`.
- If the AI provider fails, the app shall use a local fallback response and keep progress consistent.
- If credit reservation fails, the app shall explain the problem without creating an inconsistent turn.

## Security And Privacy Considerations

The mode shall not weaken authentication, user isolation, safety checks, output validation, or private mode behavior.

The mode may store structured progress in `sessions.metadata`. It shall store only what is needed to resume and summarize the guided session.

## Data Model Impact

No new table is planned.

The existing `guided_modes` seed shall be updated so `organize_thoughts` is active.

## API Impact

No public external API is required.

Server actions and internal module functions may be added for this guided mode.

## UI/UX Impact

The app shall add a clear entry point for "Ordenar mi cabeza".

The route should be `/modos/ordenar-cabeza`.

## Memory Impact

This slice shall not automatically create memories.

Any future memory candidates from the final summary shall follow existing confirmation and safety rules.

## AI Behavior Impact

The assistant prompt shall enforce careful non-clinical accompaniment, one main question per turn, cautious hypotheses, and no unsupported psychological inference.

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
  - start a new flow after completion;
  - test at least one safety-triggering input.

## Implementation Tasks

- [x] Update the seed so `organize_thoughts` is active.
- [x] Add an organize-thoughts flow module.
- [x] Add server actions for start/resume/restart/advance.
- [x] Add a guided route at `/modos/ordenar-cabeza`.
- [x] Add a composer component.
- [x] Add an entry point from `/inicio`.
- [x] Run typecheck, lint, and format checks.

## Documentation To Update

Update this feature spec if implementation scope changes.

No ADR or README update is expected unless the implementation introduces a new architectural decision.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-20 | Initial draft | Add broader mental-assistance guided mode |
| 2026-06-20 | Approved as primary guided mode on `/inicio` | User approval |
| 2026-06-20 | Marked implemented after route, flow, seed activation, and checks passed | Implementation complete |
