# Feature Specification: Basic Secret Scan Quality Gate

## Feature Name

Basic secret scan quality gate.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Add a lightweight local check that fails when tracked files contain clear secret-like values.

The check shall support the pilot launch checklist and the unified CI command without adding external services or dependencies.

## Problem / Context

The pilot checklist requires confirming that secrets are not committed. The repository has a CI command, but no automated local check for common provider keys or private key blocks.

## User Value

The project owner gets a fast warning before pushing accidental real credentials to GitHub.

The unified CI command shall also remain runnable in the local Windows environment used for this MVP. If Next.js worker spawning fails with `spawn EPERM`, the build configuration shall prefer explicit quality checks and an in-process webpack build over repeating the failing worker spawn.

## Scope

- Add a local script that scans only Git-tracked files.
- Detect clear API-key or private-key patterns.
- Do not print the secret value in command output.
- Add a package script for the check.
- Include the check in `npm run ci`.
- Document the check in the pilot launch checklist.

## Out Of Scope

- Do not add third-party scanners.
- Do not scan ignored local files such as `.env`.
- Do not implement a full DLP system.
- Do not block harmless environment variable names or placeholder values.
- Do not modify runtime application behavior.

## Functional Requirements

- The package script shall pass the tracked file list from Git to the Node.js scanner.
- The check shall skip binary files.
- The check shall report file path, line number, and finding type.
- The check shall exit with a non-zero status when a finding exists.
- The check shall avoid echoing the matched secret value.

## Non-Functional Requirements

- The implementation shall use Node.js already available in the project.
- The implementation shall not add dependencies.
- Typecheck, lint, test, format check, and build shall remain clean.

## Acceptance Criteria

- `npm run secrets:check` passes when no clear secret-like tracked value exists.
- `npm run ci` includes `npm run secrets:check`.
- The pilot launch checklist references the check.
- `npm run ci` passes.
- `next.config.ts` disables the webpack build worker when needed so the local Windows CI command can complete without the known worker `spawn EPERM`.
- `next.config.ts` may skip Next's internal TypeScript build worker only because `npm run ci` runs `npm run typecheck` before `next build -- --webpack`.
- `next.config.ts` limits static generation workers and enables worker threads to avoid child-process `spawn EPERM` during page-data collection in the local Windows gate.

## Error Cases

- If Git is unavailable, the script may fail clearly instead of silently passing.
- If a secret-like value is found, the command shall identify where to inspect without printing the secret.

## Security And Privacy Considerations

The script reduces accidental leakage risk, but it is not a substitute for manual review, secret rotation, or GitHub secret scanning.

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

- `npm run secrets:check`
- `npm run ci`

## Implementation Tasks

- [x] Add secret scan script.
- [x] Add `secrets:check` script.
- [x] Include the check in `npm run ci`.
- [x] Update the pilot launch checklist.
- [x] Disable the Next.js webpack build worker for the local Windows quality gate.
- [x] Keep TypeScript enforcement in `npm run typecheck` instead of Next's internal build worker.
- [x] Limit Next.js page-data worker spawning for the local Windows quality gate.
- [x] Run the unified CI command.

## Documentation To Update

Update `docs/planning/pilot-launch-checklist.md`.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-27 | Initial implemented spec | Add lightweight tracked-file secret check to the quality gate |
| 2026-07-27 | Disabled the Next.js webpack build worker for local CI | Avoid Windows `spawn EPERM` during `next build -- --webpack` |
| 2026-07-27 | Moved TypeScript enforcement to the explicit CI typecheck step | Avoid duplicate Next build worker `spawn EPERM` while preserving the quality gate |
| 2026-07-27 | Limited page-data build workers and enabled worker threads | Avoid child-process `spawn EPERM` during static page-data collection |
