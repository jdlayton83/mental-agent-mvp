# Feature Specification: Basic Minor Safety Routing

## Feature Name

Basic minor safety routing.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-29.

## Objective

Add deterministic local routing for clear minor-age signals so the adults-only MVP does not continue ordinary sensitive conversation when a user appears to be under 18.

## Problem / Context

The MVP and safety specifications state that the product is for adults and is not directed to minors.

The onboarding asks for adult confirmation, but a conversation message can still reveal a minor-age signal. The system should route that signal to a safe boundary response.

## User Value

The product owner gains a basic safety check for pilot testing that keeps the MVP aligned with its adults-only scope.

## Scope

- Add a `minor_safety` safety category to the local classifier.
- Classify clear under-18 or minor self-identification as interrupting level 2.
- Add a Spanish safe response that states the adults-only boundary and encourages trusted adult support for sensitive topics.
- Resolve generic trusted-person resources without static phone numbers.
- Add deterministic regression tests.

## Out Of Scope

- Do not add identity verification.
- Do not collect birth dates.
- Do not add parental-consent flows.
- Do not add sexual-content handling beyond the minor boundary.
- Do not add new tables or migrations.
- Do not call an AI provider in tests.

## Functional Requirements

- Clear minor-age user messages shall interrupt the ordinary conversation flow.
- The safe response shall state that the MVP is for adults.
- The safe response shall avoid continuing intimate, clinical, or high-risk guidance.
- The safe response shall encourage support from a trusted adult or appropriate local help when the topic is sensitive or urgent.
- The implementation shall not invent country-specific phone numbers.

## Non-Functional Requirements

- The implementation shall remain deterministic and local.
- User-facing text shall remain Spanish-first, concise, and non-clinical.
- Typecheck, lint, tests, format check, and build shall remain clean.

## Acceptance Criteria

- The local classifier returns category `minor_safety`, level `2`, and `shouldInterrupt = true` for clear minor-age signals.
- `buildSafeResponse` returns a Spanish adults-only boundary response.
- `resolveSafetyResources` returns generic fallback resources without static phone numbers.
- `npm run ci` passes.

## Error Cases

- If wording is ambiguous, the classifier may avoid interrupting unless the minor signal is explicit.
- If the message also contains immediate risk, the higher-risk category may take priority.

## Security And Privacy Considerations

Safety events shall store minimized trigger summaries through the existing pipeline. The system shall not ask for or store a full birth date.

## Data Model Impact

No schema change is planned. The existing `safety_events.category` text field can store `minor_safety`.

## API Impact

No public API change.

## UI/UX Impact

The user will see a Spanish safe response in conversation when clear minor-age signals are detected.

## Memory Impact

No memory behavior change. Minor-age signals shall not create ordinary memory.

## AI Behavior Impact

The ordinary conversational model is bypassed for detected minor-age input.

## Testing Plan

- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build -- --webpack`

## Implementation Tasks

- [x] Add local classifier category and patterns.
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
| 2026-07-29 | Initial implemented spec | Align conversation safety with adults-only MVP scope |
