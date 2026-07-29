# Feature Specification: Basic Violence Safety Routing

## Feature Name

Basic violence safety routing.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-29.

## Objective

Add deterministic local safety routing for violence and abuse risk signals so the PoC does not rely on the conversational model to notice and handle those messages safely.

## Problem / Context

The safety specification requires violence and abuse signals to activate a safety protocol instead of continuing through the ordinary conversational flow.

The current local classifier covers self-harm, medication, clinical boundary, dependency, prompt injection, and ordinary non-risk messages. It does not yet have a deterministic violence category.

## User Value

The project owner can test obvious violence-risk inputs and see a safe Spanish response before inviting pilot users.

## Scope

- Add a `violence` safety category to the local classifier.
- Classify direct violence or harm-to-others signals as interrupting level 3.
- Add output validation for assistant text that encourages or justifies violence.
- Add a Spanish safe response for violence risk.
- Resolve only generic fallback resources, without static telephone numbers.
- Record the route using the existing safety event pipeline.
- Add deterministic regression tests.

## Out Of Scope

- Do not add new tables or migrations.
- Do not add country-specific emergency phone numbers.
- Do not add a human escalation service.
- Do not add detailed forensic, legal, or clinical guidance.
- Do not call an AI provider in tests.
- Do not broaden the product into crisis care or therapy.

## Functional Requirements

- Violence-risk user messages shall interrupt the ordinary conversation flow.
- Violence-risk user messages shall persist a safe assistant response and a safety event.
- Assistant output that encourages, justifies, hides, or instructs violence shall be replaced.
- Safe responses shall prioritize immediate safety, distance from means of harm, and human or emergency help when needed.
- Safe responses shall avoid helping the user conceal, justify, or continue harmful behavior.
- The implementation shall not invent country-specific phone numbers.

## Non-Functional Requirements

- The implementation shall remain deterministic and local.
- Spanish user-facing text shall remain concise and non-clinical.
- Typecheck, lint, tests, format check, and build shall remain clean.

## Acceptance Criteria

- The local classifier returns category `violence`, level `3`, and `shouldInterrupt = true` for direct violence signals.
- The output validator replaces assistant text that encourages violence.
- `buildSafeResponse` returns a Spanish violence response with an immediate-safety boundary.
- `resolveSafetyResources` returns generic fallback resources for violence without static phone numbers.
- `npm run ci` passes.

## Error Cases

- If a violence signal is ambiguous, the classifier may route conservatively to a safety response.
- If localized resources are unavailable, the response shall use generic emergency and trusted-person guidance without inventing details.

## Security And Privacy Considerations

Safety events shall store minimized trigger summaries through the existing pipeline. They shall not duplicate full conversation content.

## Data Model Impact

No schema change is planned. The existing `safety_events.category` text field can store `violence`.

## API Impact

No public API change.

## UI/UX Impact

The user will see a Spanish safe response in conversation when violence-risk signals are detected.

## Memory Impact

No memory behavior change. Violence-related content shall not create ordinary memory.

## AI Behavior Impact

The ordinary conversational model is bypassed for detected violence-risk input. Generated assistant output is also validated and replaced if it violates the policy.

## Testing Plan

- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build -- --webpack`

## Implementation Tasks

- [x] Add local classifier category and patterns.
- [x] Add assistant-output validator patterns.
- [x] Add safe response and fallback resources.
- [x] Add regression tests.
- [x] Run the unified CI command.

## Documentation To Update

This feature spec documents the implemented slice.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-29 | Initial implemented spec | Close deterministic violence safety routing gap |
