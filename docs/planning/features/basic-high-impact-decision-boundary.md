# Feature Specification: Basic High-Impact Decision Boundary

## Feature Name

Basic high-impact decision boundary.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-30.

## Objective

Add a lightweight boundary for medical, legal, financial, labor, and family decisions so the agent can help structure thinking without giving orders, guarantees, or professional advice.

## Problem / Context

The safety and behavior specifications allow the agent to help with decisions, but high-impact decisions require extra caution. The agent should structure options and uncertainty, not decide for the user or replace qualified support.

## User Value

The user can still use the product to think clearly about important decisions while receiving safer, more transparent guidance.

## Scope

- Add a `high_impact_decision` safety category for clear high-impact decision requests.
- Classify these requests as level 1 and non-interrupting.
- Strengthen the conversation context instructions for high-impact topics.
- Replace assistant output that gives directive, guaranteed, or anti-professional advice in high-impact domains.
- Add a Spanish safe response for replacement cases.
- Add deterministic regression tests.

## Out Of Scope

- Do not add legal, financial, medical, employment, or family-law advisory functionality.
- Do not add provider calls.
- Do not add new tables or migrations.
- Do not add country-specific legal, medical, or financial resources.
- Do not block ordinary reflection about important decisions when the assistant remains cautious.

## Functional Requirements

- Clear high-impact decision requests shall be classified as `high_impact_decision`, level `1`, and `shouldInterrupt = false`.
- The normal conversation context shall instruct the model to structure options, express uncertainty, avoid orders or guarantees, and recommend qualified support when relevant.
- Assistant output that directly tells the user what to do in a high-impact domain shall be replaced.
- Assistant output that discourages qualified support in a high-impact domain shall be replaced.
- The replacement response shall keep the product non-clinical and non-professional.

## Non-Functional Requirements

- The implementation shall remain deterministic and local.
- User-facing text shall remain Spanish-first, concise, and practical.
- Typecheck, lint, tests, format check, and build shall remain clean.

## Acceptance Criteria

- The local classifier identifies high-impact decision requests without interrupting ordinary conversation.
- The conversation system instructions include high-impact decision boundaries.
- The output validator replaces unsafe high-impact directive advice.
- `buildSafeResponse` returns a Spanish response that offers structured reflection instead of professional advice.
- `npm run ci` passes.

## Error Cases

- If the message also contains an urgent safety signal, the higher-risk safety category shall take priority.
- If the assistant output contains medication advice or diagnosis, the existing medical categories may take priority over high-impact decision handling.

## Security And Privacy Considerations

No new data is stored. If a generated output is replaced, the existing safety event path records only minimized trigger metadata.

## Data Model Impact

No schema change is planned. The existing `safety_events.category` text field can store `high_impact_decision` if an output replacement event occurs.

## API Impact

No public API change.

## UI/UX Impact

The user should see safer high-impact guidance in conversation without losing the ability to reflect on options.

## Memory Impact

No memory behavior change. High-impact topics shall not weaken memory minimization or safety constraints.

## AI Behavior Impact

The ordinary model receives clearer high-impact decision instructions. Unsafe generated output is replaced by a deterministic safe response.

## Testing Plan

- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build -- --webpack`

## Implementation Tasks

- [x] Add local classifier category and patterns.
- [x] Strengthen conversation context instructions.
- [x] Add assistant-output validator patterns.
- [x] Add safe response and fallback resource.
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
| 2026-07-30 | Initial implemented spec | Add MVP boundary for high-impact decision guidance |
