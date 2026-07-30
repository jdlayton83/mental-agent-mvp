# Feature Specification: Basic AI Rate Limit

## Feature Name

Basic AI rate limit.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-30.

## Objective

Add a small local rate guard around AI text generation so the MVP has basic protection against accidental rapid-fire provider calls, loops and local cost spikes during controlled pilot preparation.

This is a local PoC control. It is not a production-grade distributed rate limiter.

## Problem / Context

The MVP, credit, LLM provider and security architecture specifications require rate limiting, cost boundaries and protection against loops. The current app records usage and simulates credits, but the AI gateway did not yet have a central rate guard before provider calls.

## User Value

The user receives a safe temporary message or local guided fallback if requests are sent too quickly, while the project owner gets a basic guard against runaway local testing.

## Scope

- Add an in-memory rate limiter for AI text generation.
- Apply it centrally in `generateText`.
- Use the authenticated user ID as the rate-limit key in free chat and guided modes.
- Return a safe Spanish fallback without calling the provider when the local limit is exceeded.
- Add deterministic regression tests for the limiter.
- Document the local-only nature of the control.

## Out Of Scope

- Do not add Redis, queues or external infrastructure.
- Do not add a database table.
- Do not add migrations.
- Do not implement production distributed rate limiting.
- Do not change credit charging rules.
- Do not block safety responses.

## Functional Requirements

- The AI gateway shall check the local rate limit before calling the configured text provider.
- The limit shall be per `rateLimitKey` when provided.
- If the limit is exceeded, the gateway shall return a normalized error result without invoking the provider.
- The user-facing fallback shall be Spanish-first and non-alarming.
- Free chat and guided modes shall pass the current user ID as `rateLimitKey`.

## Non-Functional Requirements

- The limiter shall be deterministic and testable without timers.
- The limiter shall avoid storing message content.
- The limiter shall be process-local and documented as such.
- `npm run ci` shall pass.

## Acceptance Criteria

- Rapid calls with the same key exceed the configured local window.
- A call after the window resets is allowed.
- Different keys do not share the same counter.
- `generateText` can return a local rate-limit result before provider selection.
- Free chat and guided modes provide a user-scoped key.
- `npm run ci` passes.

## Error Cases

- If no key is provided, the gateway shall use a conservative shared fallback key.
- If a request is rate limited, no provider payload, prompt or message content shall be logged.

## Security And Privacy Considerations

The limiter stores only a key, count and window timestamp in memory. It shall not store user messages, prompts, secrets or provider responses.

This does not replace production controls such as distributed rate limiting, provider budget alerts, IP throttling or abuse monitoring.

## Data Model Impact

No data model impact.

## API Impact

The internal `AIGenerateTextInput` contract adds an optional `rateLimitKey`.

## UI/UX Impact

Free chat may show a short Spanish cooldown message when the local guard is hit. Guided modes may fall back to their existing local guided response path.

## Memory Impact

No memory behavior impact.

## AI Behavior Impact

The gateway may avoid a provider call during local rate limiting. Safety routing remains outside this limiter and shall still run before ordinary AI generation.

## Testing Plan

- `npm run test`
- `npm run ci`

## Implementation Tasks

- [x] Add a pure AI rate-limit helper.
- [x] Apply it in the AI gateway.
- [x] Pass user-scoped keys from free chat and guided modes.
- [x] Add regression tests.
- [x] Update relevant architecture/spec docs.
- [x] Run checks.

## Documentation To Update

- `docs/architecture/llm-provider-abstraction.md`
- `docs/specs/credit-system.md`
- `docs/architecture/threat-model.md`

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-30 | Initial implemented local rate guard | Reduce loop and local cost risk before controlled pilot testing |
