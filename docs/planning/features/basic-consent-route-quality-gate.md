# Feature Specification: Basic Consent Route Quality Gate

## Feature Name

Basic consent route quality gate.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Add a lightweight local check that verifies normal private product pages keep the required-consent gate while consent-resolution pages remain reachable.

## Problem / Context

The consent feature requires terms and privacy consent before normal MVP use. It also requires login, onboarding, privacy controls and data export to remain reachable so a user can resolve missing consent or control their data.

The current implementation follows this rule, but CI did not yet protect it from accidental route edits.

## User Value

The project owner gets a fast warning if a future change removes required-consent gating from a normal product route or accidentally blocks the pages needed to resolve consent.

## Scope

- Add a local script that checks normal private product pages.
- Require `requireRequiredConsents(user.id)` on normal product pages.
- Verify login, onboarding, privacy controls and data export do not call the required-consent gate.
- Add a package script for the check.
- Include the check in `npm run ci`.
- Update the pilot launch checklist.

## Out Of Scope

- Do not change consent behavior.
- Do not add new consent types.
- Do not browser-test redirects in this slice.
- Do not start the dev server.
- Do not connect to the database.

## Functional Requirements

- The check shall fail if a required normal product route file is missing.
- The check shall fail if a normal product route does not import the required-consent helper.
- The check shall fail if a normal product route does not call `requireRequiredConsents(user.id)`.
- The check shall fail if a consent-exempt route calls `requireRequiredConsents`.
- The check shall report file paths only and shall not inspect `.env` or user data.

## Non-Functional Requirements

- The implementation shall use Node.js already available in the project.
- Typecheck, lint, test, quality checks, format check and build shall remain clean.

## Acceptance Criteria

- `npm run consent-routes:check` passes in the current repository state.
- `npm run ci` includes `npm run consent-routes:check`.
- No application behavior changes.
- `npm run ci` passes.

## Error Cases

- If a future normal product route intentionally becomes consent-exempt, this spec and the check shall be updated in the same change.
- If a future consent-resolution route becomes normal product surface, it shall be added to the gated route list in the same change.

## Security And Privacy Considerations

The check protects the minimum consent boundary without reading local secrets, user data, or database records.

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

- `npm run consent-routes:check`
- `npm run ci`

## Implementation Tasks

- [x] Add consent route scan script.
- [x] Add `consent-routes:check` script.
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
| 2026-07-27 | Initial implemented spec | Protect required-consent routing in CI |
