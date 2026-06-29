# Feature Specification: Prepare Difficult Conversation Guided Mode

## Feature Name

Prepare difficult conversation guided mode.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-28.

## Objective

Implement the guided mode "Preparar una conversación difícil" as a structured non-clinical flow that helps the user clarify what they want to say, separate facts from interpretations, define a respectful message, and choose simple boundaries or next steps.

The mode shall support clarity and self-expression without teaching manipulation, coercion, blame, revenge, or unsafe confrontation.

## Problem / Context

The MVP specification defines `prepare_difficult_conversation` as one of the six guided modes with the minimum result "guion y plan de conversación".

The current app already supports `organize_thoughts`, `make_decision`, `create_or_review_habit`, and `guided_journaling` using the same guided-mode pattern: `sessions.metadata`, saved messages, summaries, credit reservations, safety interruption, and output validation. The seed already includes `prepare_difficult_conversation` in the guided mode catalog, but it is inactive and has no route or flow implementation.

## User Value

Users can prepare for a sensitive conversation with more clarity, less reactivity, and a short message they can adapt, without the agent deciding for them or escalating conflict.

## Scope

- Activate `prepare_difficult_conversation` in the guided mode catalog seed.
- Add a Spanish-first route for the mode.
- Reuse the current guided-mode implementation pattern from the existing modes.
- Create or resume a guided session linked to `prepare_difficult_conversation`.
- Persist stage progress in `sessions.metadata`.
- Save user and assistant messages in the existing message history.
- Use the existing safety classifier, safe response path, and output validator.
- Produce a final Spanish summary with conversation objective, facts, message draft, boundary, and preparation plan.

## Out Of Scope

- Do not implement mediation, legal advice, HR advice, therapy, abuse counseling, crisis intervention, or safety planning beyond the existing safety flow.
- Do not teach manipulation, coercion, guilt, pressure tactics, threats, deception, or revenge.
- Do not script messages designed to control another person.
- Do not decide whether the user should have the conversation.
- Do not create automatic memory records from this mode.
- Do not add a dedicated conversation-preparation table.
- Do not add reminders, calendar events, embeddings, or new progression tables.
- Do not implement the remaining guided modes.
- Do not add new dependencies.
- Do not run `drizzle-kit generate`.

## Functional Requirements

- The system shall expose `prepare_difficult_conversation` to authenticated, onboarded users.
- The flow shall include these stages:
  1. identify who the conversation is with and the broad topic;
  2. define the user's objective;
  3. separate facts from interpretations;
  4. name the user's main concern or sensitivity;
  5. draft the core message in respectful first-person language;
  6. define one boundary or request;
  7. prepare for likely responses without controlling the other person;
  8. summarize.
- The assistant shall ask one main question per turn.
- The assistant shall not assert what the other person thinks, feels, intends, or will do without evidence.
- The assistant shall not encourage confrontation where there are risk signals.
- The assistant shall not produce manipulative, threatening, coercive, deceptive, or retaliatory scripts.
- If violence, abuse, coercive control, self-harm, stalking, or immediate danger is detected, the safety protocol shall override the ordinary guided flow.
- Any hypothesis about emotion, intention, cause, or relationship pattern shall be cautious and confirmed with the user when material.
- The user shall be able to leave and return without losing progress.
- The user shall be able to start another conversation-preparation flow after completing one.

## Non-Functional Requirements

- The implementation shall remain minimal and reuse existing guided-mode patterns.
- UI copy shall be Spanish-first.
- The implementation shall avoid broad abstractions unless they clearly reduce duplication across guided modes.
- Typecheck, lint, format check, tests, and build shall remain clean.

## Acceptance Criteria

- An authenticated, onboarded user can open "Preparar una conversación difícil" from the app.
- The app creates or resumes an active guided session linked to `prepare_difficult_conversation`.
- The page shows progress through the eight stages.
- User messages advance through the flow.
- The assistant asks one main question at a time.
- Safety responses override ordinary guided behavior.
- Completion produces a final Spanish summary with a respectful message draft and one boundary or request.
- The user can start another conversation-preparation flow after completion.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run test` passes.

## Error Cases

- If the mode is missing or inactive, the user shall see a safe Spanish error state or return to `/inicio`.
- If the user is not onboarded, the user shall be redirected to `/onboarding`.
- If the AI provider fails, the app shall use a local fallback response and keep progress consistent.
- If credit reservation fails, the app shall explain the problem without creating an inconsistent turn.
- If safety risk is detected, the safety protocol shall take precedence over the conversation-preparation flow.

## Security And Privacy Considerations

The mode shall not weaken authentication, user isolation, safety checks, output validation, private mode behavior, or credit integrity.

Conversation-preparation content may involve other people. The mode shall store only the progress needed to resume and summarize the session.

The mode shall not confirm accusations, diagnose third parties, infer intent as fact, or encourage unsafe contact.

## Data Model Impact

No new table is planned.

The existing `guided_modes` seed shall be updated so `prepare_difficult_conversation` is active.

Guided progress may be stored in `sessions.metadata` using a small versioned structure.

## API Impact

No public external API is required.

Server actions and internal module functions may be added for this guided mode.

## UI/UX Impact

The app shall add a clear entry point for "Preparar una conversación difícil".

The route should be `/modos/conversacion-dificil`.

The page shall keep the same simple guided-mode interaction style used by the existing modes.

## Memory Impact

This slice shall not automatically create memories.

Any future memory candidate from the final summary shall require a separate feature spec and shall follow existing confirmation and safety rules, especially because third-party information may be involved.

## AI Behavior Impact

The assistant prompt shall enforce non-clinical communication support, one main question per turn, respectful first-person language, cautious hypotheses, no unsupported inference about third parties, and no manipulation or coercion.

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
  - start a new conversation-preparation flow after completion;
  - test at least one safety-triggering input.

## Implementation Tasks

- [x] Update the seed so `prepare_difficult_conversation` is active.
- [x] Add a prepare-difficult-conversation flow module.
- [x] Add server actions for start/resume/restart/advance.
- [x] Add a guided route at `/modos/conversacion-dificil`.
- [x] Add a composer component.
- [x] Add an entry point from `/inicio`.
- [x] Add or update focused tests for the flow where practical.
- [x] Run typecheck, lint, format check, tests, and build.

## Documentation To Update

Update this feature spec if implementation scope changes.

No ADR or README update is expected unless the implementation introduces a new architectural decision.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-28 | Initial draft | Prepare fifth guided mode implementation |
| 2026-06-28 | Marked implemented after route, flow, seed activation, tests, and checks passed | Implementation complete |
