# Feature Specification: Basic Env Access Quality Gate

## Feature Name

Basic env access quality gate.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Add a lightweight local check that fails when application source files access `process.env` outside the centralized validated configuration module.

## Problem / Context

The backlog requires centralized configuration and no scattered `process.env` access. The current code follows this rule, but the unified CI command did not yet protect it automatically.

## User Value

The project owner gets a fast warning if future code bypasses `src/config/env.ts` and weakens environment validation.

## Scope

- Add a local script that scans Git-tracked files under `src/`.
- Allow `process.env` only in `src/config/env.ts`.
- Add a package script for the check.
- Include the check in `npm run ci`.

## Out Of Scope

- Do not change environment variable names.
- Do not change runtime configuration behavior.
- Do not add dependencies.
- Do not scan ignored local files such as `.env`.

## Functional Requirements

- The check shall report each source file that accesses `process.env` outside `src/config/env.ts`.
- The check shall exit with a non-zero status when a violation exists.
- The check shall pass when only the centralized env module accesses `process.env`.

## Non-Functional Requirements

- The implementation shall use Node.js already available in the project.
- Typecheck, lint, test, secret check, format check and build shall remain clean.

## Acceptance Criteria

- `npm run env:check` passes in the current repository state.
- `npm run ci` includes `npm run env:check`.
- No application behavior changes.
- `npm run ci` passes.

## Error Cases

- If a future source file needs new configuration, it shall import `env` from `@/config/env` instead of reading `process.env` directly.

## Security And Privacy Considerations

Centralized environment validation reduces accidental use of missing, placeholder, or malformed secrets and configuration values.

## Data Model Impact

No data model impact.

## API Impact

No API impact.

## UI/UX Impact

No UI impact.

## Memory Impact

No memory behavior impact.

## AI Behavior Impact

No AI behavior impact.

## Testing Plan

- `npm run env:check`
- `npm run ci`

## Implementation Tasks

- [x] Add env access scan script.
- [x] Add `env:check` script.
- [x] Include the check in `npm run ci`.
- [x] Run the unified CI command.

## Documentation To Update

No additional documentation update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-27 | Initial implemented spec | Protect centralized environment access in CI |
