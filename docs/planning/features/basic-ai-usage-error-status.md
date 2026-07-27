# Feature Specification: Basic AI Usage Error Status

## Feature Name

Basic AI usage error status.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Record provider failures in technical usage events with a distinct status across free chat and guided modes.

The change shall preserve safe user-facing fallback behavior while making pilot metrics more accurate.

## Problem / Context

The AI gateway can return a normalized result with `finishReason: "error"` when the OpenAI provider fails. Conversation and guided-mode persistence used the safety status to decide the usage event status, which could store a provider failure as `completed`.

The architecture and credit specifications require usage, latency, cost, and errors to be reconstructable without exposing sensitive content.

## User Value

The project owner can tell the difference between successful AI replies, safety replacements, truncated replies, and provider failures when reviewing `/metricas` or exported technical usage.

## Scope

- Add a small usage status helper.
- Use it when persisting free-chat and guided-mode usage events.
- Preserve `replaced` for safety output replacements.
- Record provider errors as `failed`.
- Record length-limited responses as `truncated`.
- Preserve measured provider latency when a provider call fails.
- Add deterministic tests for the status mapping.

## Out Of Scope

- Do not change database schema.
- Do not add migrations.
- Do not expose provider error details to the user.
- Do not change credit charging rules.
- Do not change guided-mode progress, fallback copy, safety routing, or credit rules.

## Functional Requirements

- If the assistant output is replaced by safety validation, the usage event status shall be `replaced`.
- If the AI finish reason is `error` and safety did not replace the output, the usage event status shall be `failed`.
- If the AI finish reason is `length`, the usage event status shall be `truncated`.
- Otherwise, the usage event status shall be `completed`.
- Provider failure responses shall preserve the elapsed provider-call duration as technical latency.

## Non-Functional Requirements

- The mapping shall be deterministic and independently testable.
- The implementation shall not log provider payloads or secrets.
- Typecheck, lint, test, format check, and build shall remain clean.

## Acceptance Criteria

- A free-chat provider error is not stored as `completed`.
- A guided-mode provider error handled by local fallback is not stored as `completed`.
- A provider error records non-placeholder latency when the failing call consumed time.
- Safety replacements still take precedence over provider finish reason.
- `npm run ci` passes.

## Error Cases

- Missing finish reason shall fall back to `completed` unless safety replacement applies.

## Security And Privacy Considerations

The status records only technical outcome categories. It shall not store raw provider errors, prompts, secrets, message content, or provider payloads.

## Data Model Impact

No data model impact.

## API Impact

No API impact.

## UI/UX Impact

Existing usage views shall show the known technical statuses with short Spanish labels.

## Memory Impact

No memory behavior impact.

## AI Behavior Impact

No AI behavior change is planned.

## Testing Plan

- `npm run test`
- `npm run ci`

## Implementation Tasks

- [x] Add usage status helper.
- [x] Use the helper for free-chat usage persistence.
- [x] Use the helper for guided-mode usage persistence.
- [x] Add regression tests for failed, replaced, truncated and default completed statuses.
- [x] Add Spanish labels for the new technical statuses in existing usage views.
- [x] Preserve provider-call latency for failed OpenAI calls.
- [x] Run the unified CI command.

## Documentation To Update

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-27 | Initial implemented spec | Prevent provider errors from being counted as completed usage |
| 2026-07-27 | Preserved latency for failed provider calls | Keep failure metrics technically useful without exposing provider errors |
