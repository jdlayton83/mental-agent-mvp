# Feature Specification: Basic Server Action Export Quality Gate

## Feature Name

Basic server action export quality gate.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Add a lightweight local check that prevents invalid runtime exports from files marked with `"use server"`.

## Problem / Context

Next.js App Router requires files marked with `"use server"` to export only async server functions. This project has already hit build errors when constants or plain helper functions were exported from server-action files.

The current implementation has moved shared constants and flow helpers into non-server files. CI should protect this boundary.

## User Value

The project owner gets a fast local failure before a browser or production build hits the Next.js server-action export error.

## Scope

- Add a local script that scans Git-tracked files under `src/`.
- Detect files whose first directive is `"use server"`.
- Allow exported async functions.
- Allow erased TypeScript type and interface exports.
- Reject exported runtime constants, classes, re-exports and plain functions from server-action files.
- Add a package script for the check.
- Include the check in `npm run ci`.
- Update the pilot launch checklist.

## Out Of Scope

- Do not change server-action behavior.
- Do not move existing helpers in this slice unless the check finds a violation.
- Do not add dependencies.
- Do not start the dev server.

## Functional Requirements

- The check shall fail if a `"use server"` file exports a runtime value other than an async function.
- The check shall print the file and line number for each violation.
- The check shall pass when server-action files export only async functions plus erased TypeScript types or interfaces.
- The check shall skip missing files from Git-tracked input to tolerate local renames during development.

## Non-Functional Requirements

- The implementation shall use Node.js already available in the project.
- Typecheck, lint, test, quality checks, format check and build shall remain clean.

## Acceptance Criteria

- `npm run server-actions:check` passes in the current repository state.
- `npm run ci` includes `npm run server-actions:check`.
- No application behavior changes.
- `npm run ci` passes.

## Error Cases

- If a server-action file needs a shared constant or helper, that runtime export shall be moved to a non-server module.
- If Next.js changes the server-action export rules, this spec and check shall be updated together.

## Security And Privacy Considerations

The check reads source files only. It does not inspect `.env`, database records or user data.

## Data Model Impact

No data model impact.

## API Impact

No API behavior change.

## UI/UX Impact

No UI behavior change.

## Memory Impact

No memory behavior impact.

## AI Behavior Impact

No AI behavior impact.

## Testing Plan

- `npm run server-actions:check`
- `npm run ci`

## Implementation Tasks

- [x] Add server-action export scan script.
- [x] Add `server-actions:check` script.
- [x] Include the check in `npm run ci`.
- [x] Update the pilot launch checklist.
- [x] Run the unified CI command.

## Documentation To Update

Update `docs/planning/pilot-launch-checklist.md`.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-27 | Initial implemented spec | Prevent recurring Next.js server-action export build errors |
