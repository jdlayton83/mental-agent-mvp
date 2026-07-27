# Feature Specification: Basic Security Headers

## Feature Name

Basic security headers.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Add a minimal set of safe browser security headers for the local internal PoC and protect them with a static quality check.

## Problem / Context

The security architecture requires browser-layer controls such as MIME sniffing protection, referrer policy, permissions policy, framing protection, CSP and HSTS.

For the local PoC, CSP and HSTS need more deployment-specific design because strict CSP can break Next.js development assets and HSTS is inappropriate for plain `http://localhost:3000`. The safe immediate slice is to add non-disruptive headers that improve the browser boundary now.

## User Value

The project owner gets a slightly safer local app surface without making local testing harder.

## Scope

- Add global Next.js headers for:
  - `X-Content-Type-Options`;
  - `X-Frame-Options`;
  - `Referrer-Policy`;
  - `Permissions-Policy`.
- Add a local script that verifies those headers remain configured.
- Add a package script for the check.
- Include the check in `npm run ci`.
- Update the pilot launch checklist.

## Out Of Scope

- Do not add CSP in this slice.
- Do not add HSTS for localhost.
- Do not change auth, consent, database, memory, AI or route behavior.
- Do not add dependencies.

## Functional Requirements

- The app shall send `X-Content-Type-Options: nosniff`.
- The app shall send `X-Frame-Options: DENY`.
- The app shall send `Referrer-Policy: strict-origin-when-cross-origin`.
- The app shall send a `Permissions-Policy` that disables camera, microphone, geolocation, payment and USB access.
- The static check shall fail if any required header key is missing from `next.config.ts`.

## Non-Functional Requirements

- The headers shall be configured through Next.js.
- The implementation shall not interfere with local development on `http://localhost:3000`.
- Typecheck, lint, test, quality checks, format check and build shall remain clean.

## Acceptance Criteria

- `next.config.ts` defines the four required local PoC security headers.
- `npm run security-headers:check` passes.
- `npm run ci` includes `npm run security-headers:check`.
- `npm run ci` passes.

## Error Cases

- If a future deployment adds CSP or HSTS, this spec shall be updated instead of silently adding stricter browser policy.
- If a future Next.js config refactor moves header definitions elsewhere, the static check shall be updated in the same change.

## Security And Privacy Considerations

These headers reduce common browser exposure without reading secrets, user data, memory or provider payloads.

## Data Model Impact

No data model impact.

## API Impact

No route contract change.

## UI/UX Impact

No UI behavior change is expected.

## Memory Impact

No memory behavior impact.

## AI Behavior Impact

No AI behavior impact.

## Testing Plan

- `npm run security-headers:check`
- `npm run ci`

## Implementation Tasks

- [x] Add local PoC security headers in Next.js config.
- [x] Add security header scan script.
- [x] Add `security-headers:check` script.
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
| 2026-07-27 | Initial implemented spec | Add safe local browser security headers |
