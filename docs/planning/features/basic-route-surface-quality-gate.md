# Feature Specification: Basic Route Surface Quality Gate

## Feature Name

Basic route surface quality gate.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Add a lightweight local check that verifies the internal PoC route surface exists under the Next.js App Router.

## Problem / Context

The pilot checklist depends on a stable set of routes for login, onboarding, home, conversation, guided modes, memory, commitments, preferences, privacy, export and metrics. The current repository has these routes, but CI did not yet protect their presence.

The project uses App Router and shall not introduce Pages Router.

## User Value

The project owner gets a fast warning if a future change accidentally removes a critical PoC page or reintroduces Pages Router.

## Scope

- Add a local script that checks required App Router files.
- Check that `pages/` and `src/pages/` do not exist.
- Add a package script for the check.
- Include the check in `npm run ci`.

## Out Of Scope

- Do not browser-test pages in this slice.
- Do not start the dev server.
- Do not connect to the database.
- Do not validate page content or visual layout.
- Do not change application behavior.

## Functional Requirements

- The check shall fail if a required App Router file is missing.
- The check shall fail if Pages Router directories exist.
- The check shall report missing paths without printing environment values or user data.

## Non-Functional Requirements

- The implementation shall use Node.js already available in the project.
- Typecheck, lint, test, quality checks, format check and build shall remain clean.

## Acceptance Criteria

- `npm run routes:check` passes in the current repository state.
- `npm run ci` includes `npm run routes:check`.
- No application behavior changes.
- `npm run ci` passes.

## Error Cases

- If a future route is intentionally renamed or removed, this spec and the pilot checklist shall be updated in the same change.

## Security And Privacy Considerations

The check reads file paths only and does not inspect user data, `.env`, or database contents.

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

- `npm run routes:check`
- `npm run ci`

## Implementation Tasks

- [x] Add route surface scan script.
- [x] Add `routes:check` script.
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
| 2026-07-27 | Initial implemented spec | Protect the internal PoC route surface in CI |
