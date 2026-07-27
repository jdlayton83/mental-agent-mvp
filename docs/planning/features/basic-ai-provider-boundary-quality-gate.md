# Feature Specification: Basic AI Provider Boundary Quality Gate

## Feature Name

Basic AI provider boundary quality gate.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Add a lightweight local check that fails when application source files import the OpenAI SDK outside the approved provider adapter directory.

## Problem / Context

ADR-0001 and the LLM provider abstraction specify that OpenAI is the first provider but shall remain behind the project AI gateway and provider adapter. The current code follows that boundary, but the unified CI command did not yet protect it automatically.

## User Value

The project owner gets a fast warning if future code couples domain, UI, route handlers, or server actions directly to the OpenAI SDK.

## Scope

- Add a local script that scans Git-tracked files under `src/`.
- Allow OpenAI SDK imports only under `src/modules/ai/providers/openai/`.
- Add a package script for the check.
- Include the check in `npm run ci`.

## Out Of Scope

- Do not change AI runtime behavior.
- Do not add or remove AI providers.
- Do not change prompts.
- Do not add dependencies.

## Functional Requirements

- The check shall report each source file that imports the OpenAI SDK outside the approved adapter directory.
- The check shall exit with a non-zero status when a violation exists.
- The check shall pass when only the OpenAI provider adapter imports OpenAI SDK modules.

## Non-Functional Requirements

- The implementation shall use Node.js already available in the project.
- Typecheck, lint, test, secret check, env check, format check and build shall remain clean.

## Acceptance Criteria

- `npm run ai:check` passes in the current repository state.
- `npm run ci` includes `npm run ai:check`.
- No application behavior changes.
- `npm run ci` passes.

## Error Cases

- If future code needs an AI operation, it shall call the project AI gateway or add an adapter method instead of importing the provider SDK directly.

## Security And Privacy Considerations

Provider isolation reduces the risk of sending unvetted context, secrets, or sensitive data through ad hoc SDK calls.

## Data Model Impact

No data model impact.

## API Impact

No API impact.

## UI/UX Impact

No UI impact.

## Memory Impact

No memory behavior impact.

## AI Behavior Impact

No prompt or model behavior change is planned.

## Testing Plan

- `npm run ai:check`
- `npm run ci`

## Implementation Tasks

- [x] Add AI provider boundary scan script.
- [x] Add `ai:check` script.
- [x] Include the check in `npm run ci`.
- [x] Run the unified CI command.

## Documentation To Update

No additional documentation update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-27 | Initial implemented spec | Protect the AI provider boundary in CI |
