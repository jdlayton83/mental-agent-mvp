# Feature Specification: Basic Auth Route Quality Gate

## Feature Name

Basic auth route quality gate.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Add a lightweight local check that verifies required private PoC routes use the centralized session helper and redirect unauthenticated users to `/login`.

## Problem / Context

The MVP contains private pages for onboarding, home, conversation, history, memory, commitments, preferences, metrics, privacy controls, export and guided modes. These routes read user-specific data and shall not be exposed to anonymous visitors.

The existing implementation protects these routes, but CI did not yet provide a focused static check for accidental route-auth regression.

## User Value

The project owner gets a fast warning if a future edit removes the basic authentication guard from a private route.

## Scope

- Add a local script that checks required private App Router files.
- Require the centralized `@/modules/auth/session` helper.
- Require `getCurrentUser` in each protected route file.
- Require an unauthenticated redirect to `/login`.
- Add a package script for the check.
- Include the check in `npm run ci`.
- Update the pilot launch checklist.

## Out Of Scope

- Do not implement role-based authorization.
- Do not browser-test redirects in this slice.
- Do not start the dev server.
- Do not connect to the database.
- Do not change authentication behavior.

## Functional Requirements

- The check shall fail if a required protected route file is missing.
- The check shall fail if a protected route does not import the centralized auth session module.
- The check shall fail if a protected route does not call `getCurrentUser`.
- The check shall fail if a protected route does not contain an unauthenticated redirect to `/login`.
- The check shall report file paths only and shall not inspect `.env` or user data.

## Non-Functional Requirements

- The implementation shall use Node.js already available in the project.
- Typecheck, lint, test, quality checks, format check and build shall remain clean.

## Acceptance Criteria

- `npm run auth-routes:check` passes in the current repository state.
- `npm run ci` includes `npm run auth-routes:check`.
- No application behavior changes.
- `npm run ci` passes.

## Error Cases

- If a future private route intentionally uses a different auth helper, this spec and the check shall be updated in the same change.
- If a future route becomes public by design, it shall be removed from the protected route list in the same change.

## Security And Privacy Considerations

The check protects against accidental exposure of user-specific pages by requiring the existing server-side session boundary.

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

- `npm run auth-routes:check`
- `npm run ci`

## Implementation Tasks

- [x] Add protected route auth scan script.
- [x] Add `auth-routes:check` script.
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
| 2026-07-27 | Initial implemented spec | Protect private PoC routes against auth guard regressions |
