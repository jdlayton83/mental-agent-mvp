# Feature Specification: Basic Reality-Distress Safety Routing

## Feature Name

Basic reality-distress safety routing.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-29.

## Objective

Add deterministic local safety routing for messages that suggest distress around being watched, followed, controlled, or otherwise losing confidence in what is real.

## Problem / Context

The safety specification requires the agent not to confirm unverifiable beliefs and to focus on safety, impact, and appropriate support.

The local classifier does not yet route these signals before ordinary conversation. That creates a risk that a generated response could validate an unsupported belief.

## User Value

The user receives a careful, non-diagnostic Spanish response that does not ridicule them, does not confirm the belief as fact, and offers a safer next step.

## Scope

- Add a `reality_distress` safety category to the local classifier.
- Classify clear reality-distress signals as interrupting level 2.
- Replace assistant output that confirms unverifiable surveillance, persecution, mind-reading, or hidden-control claims as facts.
- Add a Spanish safe response that distinguishes experience from verified facts.
- Resolve only generic fallback resources, without static telephone numbers.
- Add deterministic regression tests.

## Out Of Scope

- Do not diagnose psychosis, paranoia, delusion, or any disorder.
- Do not add clinical assessment flows.
- Do not add country-specific phone numbers.
- Do not add new tables or migrations.
- Do not call an AI provider in tests.

## Functional Requirements

- Reality-distress user messages shall interrupt the ordinary conversation flow.
- The safe response shall not confirm or deny unverifiable beliefs as facts.
- The safe response shall focus on immediate safety, grounding in observable facts, and support from a trusted person or qualified professional when distress is intense.
- Assistant output that validates unverifiable beliefs as facts shall be replaced.
- The implementation shall not invent country-specific phone numbers.

## Non-Functional Requirements

- The implementation shall remain deterministic and local.
- User-facing text shall remain Spanish-first, respectful, concise, and non-clinical.
- Typecheck, lint, tests, format check, and build shall remain clean.

## Acceptance Criteria

- The local classifier returns category `reality_distress`, level `2`, and `shouldInterrupt = true` for direct reality-distress signals.
- The output validator replaces assistant text that confirms unsupported surveillance or persecution claims.
- `buildSafeResponse` returns a Spanish response that avoids validating the belief as fact.
- `resolveSafetyResources` returns generic fallback resources without static phone numbers.
- `npm run ci` passes.

## Error Cases

- If wording is ambiguous, the classifier may route conservatively when the message includes distress or safety concern.
- If localized resources are unavailable, the response shall use generic support guidance without inventing details.

## Security And Privacy Considerations

Safety events shall store minimized trigger summaries through the existing pipeline. They shall not duplicate full conversation content.

## Data Model Impact

No schema change is planned. The existing `safety_events.category` text field can store `reality_distress`.

## API Impact

No public API change.

## UI/UX Impact

The user will see a Spanish safe response in conversation when reality-distress signals are detected.

## Memory Impact

No memory behavior change. Reality-distress content shall not create ordinary memory.

## AI Behavior Impact

The ordinary conversational model is bypassed for detected reality-distress input. Generated assistant output is also validated and replaced if it violates the policy.

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
| 2026-07-29 | Initial implemented spec | Close deterministic reality-distress safety routing gap |
