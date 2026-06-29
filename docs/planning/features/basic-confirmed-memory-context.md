# Feature Specification: Basic Confirmed Memory Context

## Feature Name

Basic confirmed memory context.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-29.

## Objective

Use a small number of confirmed user memories in free-chat context so the assistant can provide continuity without adding semantic retrieval, embeddings or new tables.

The feature shall respect memory consent, private mode, user isolation and safety boundaries.

## Problem / Context

The memory system can create, confirm, archive and delete memories. The free-chat context builder currently says memory is enabled but does not receive persistent memories. This means confirmed memories are visible to the user but not useful in conversation yet.

Full pgvector retrieval remains a larger future slice. This feature provides a conservative bridge using only recent confirmed memories that are explicitly available for retrieval.

## User Value

Users who confirm memories can see modest continuity in ordinary conversation without repeating stable preferences or goals.

## Scope

- Add a read helper for recent confirmed retrievable memories.
- Use up to three recent confirmed memories in free-chat AI context.
- Include only general or personal memories in this basic slice.
- Exclude memories in private mode.
- Exclude memories when memory is disabled.
- Keep guided modes unchanged.
- Add deterministic tests for context behavior.

## Out Of Scope

- Do not add embeddings or vector search.
- Do not add semantic ranking.
- Do not add new memory types, tables or migrations.
- Do not use sensitive or highly sensitive memories in prompt context.
- Do not create automatic memories from this slice.
- Do not change memory management actions.
- Do not add provider calls for embeddings.

## Functional Requirements

- The system shall retrieve memories only for the current authenticated user.
- The retrieval query shall require `status = confirmed`.
- The retrieval query shall require `is_available_for_retrieval = true`.
- The retrieval query shall exclude deleted memories.
- The retrieval query shall exclude sensitive and highly sensitive memories in this basic slice.
- The free-chat prompt shall include confirmed memories only when memory is enabled and the active session is not private.
- The prompt shall state that memories must be used only when relevant and must not be used for unsupported psychological inference.
- The prompt shall not claim memory is available when no memories are included.

## Non-Functional Requirements

- The implementation shall remain minimal.
- The helper shall return a small bounded list.
- Typecheck, lint, format check, tests and build shall remain clean.

## Acceptance Criteria

- Confirmed general or personal memories can appear in the free-chat system context.
- Sensitive and highly sensitive memories are excluded from basic context.
- Private mode does not include persistent memories.
- Memory disabled does not include persistent memories.
- Tests cover prompt inclusion and private-mode exclusion.
- `npm run test` passes.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run build -- --webpack` passes.

## Error Cases

- If no eligible memories exist, the prompt shall tell the model not to invent memory.
- If memory is disabled, the prompt shall tell the model not to remember outside the conversation.
- If private mode is active, the prompt shall explicitly avoid persistent memory use.

## Security And Privacy Considerations

All memory retrieval shall filter by `user_id` in the database query.

This slice intentionally excludes sensitive and highly sensitive memories from prompt context to reduce accidental overexposure before semantic retrieval and richer consent controls exist.

Memory shall never weaken safety constraints or be treated as a psychological profile.

## Data Model Impact

No data model change is planned.

## API Impact

No public external API is required.

An internal memory read helper may be added.

## UI/UX Impact

No direct UI change is planned.

Users may notice the assistant can refer cautiously to confirmed memories.

## Memory Impact

Confirmed memories become useful in ordinary free-chat context when memory is enabled. Archived, deleted, rejected, proposed, sensitive and private-mode memories remain unavailable for this basic context.

## AI Behavior Impact

The system prompt shall include a short confirmed-memory section and explicit caution:

- use only when relevant;
- ask for correction if outdated;
- do not infer psychological causes;
- do not weaken safety rules.

## Testing Plan

- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build -- --webpack`

## Implementation Tasks

- [x] Add memory context read helper.
- [x] Extend the free-chat context builder to accept confirmed memories.
- [x] Retrieve eligible memories in free chat when allowed.
- [x] Add deterministic context tests.
- [x] Run tests, typecheck, lint, format check and build.

## Documentation To Update

Update this feature spec if implementation scope changes.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-29 | Initial draft | Add conservative confirmed-memory context |
| 2026-06-29 | Marked implemented after context retrieval, prompt integration, tests and checks passed | Implementation complete |
