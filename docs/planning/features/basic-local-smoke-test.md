# Feature Specification: Basic Local Smoke Test

## Feature Name

Basic local smoke test.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-08-03.

## Objective

Add a repeatable local smoke test command that verifies the MVP can be reached through the running Next.js server, authenticates with the seeded development user, and renders the main protected routes without framework error shells.

## Problem / Context

Manual browser testing found a `/metricas` runtime failure that did not appear in static build or unit tests.

Because Codex does not always have a controllable browser surface available, the project needs a local HTTP smoke test that exercises the real server, Auth.js credentials flow, cookies, protected-route redirects, and the main page render paths.

## User Value

The project owner can run one command during local testing to catch obvious server, auth, route, and rendering regressions before manual visual review.

## Scope

- Add a `smoke:local` package script.
- Verify that `/login` and `/` respond.
- Verify that the login form uses a native `post` fallback so credentials are not placed in the URL before hydration.
- Verify that anonymous protected routes redirect to `/login`.
- Verify that a bad password is rejected.
- Verify that the seeded development user can authenticate.
- Verify that main authenticated routes return `200`.
- Verify that rendered pages do not contain a Next.js error shell, build error, runtime error, or server-action export error.
- Verify that `/metricas` renders its title and does not expose selected sensitive demo snippets.
- Verify that `/privacidad/exportar` returns JSON and does not expose password hash markers.
- Add a `ready:local` package script that chains local database readiness, smoke testing, and the no-build quality gate.
- Keep the smoke test outside CI because it requires a running local server and database.

## Out Of Scope

- Do not start Docker.
- Do not start the Next.js server automatically.
- Do not mutate product data.
- Do not click browser UI.
- Do not call the AI provider.
- Do not replace manual visual testing.
- Do not claim production readiness.

## Functional Requirements

- `npm run smoke:local` shall fail clearly when the local Next.js server is unreachable.
- `npm run smoke:local` shall fail clearly when authentication does not work.
- `npm run smoke:local` shall fail clearly when a main route returns an unexpected status.
- `npm run smoke:local` shall fail clearly when a main route renders a Next.js error shell.
- The command shall not print secrets, passwords, cookies, exported JSON, message bodies, or full page bodies.
- The login form shall not fall back to a native `GET` submission that exposes credentials in query parameters.
- `npm run ready:local` shall run `pilot:check`, `smoke:local`, and `quality:check` as a single local acceptance gate that does not invalidate the running dev server assets.

## Non-Functional Requirements

- The command shall use built-in Node fetch and existing project dependencies only.
- The command shall be readable and easy to extend.
- The command shall remain separate from CI because it depends on local runtime state.

## Acceptance Criteria

- `npm run smoke:local` exists.
- The command passes when the database is ready, the seed has run, and the local Next.js server is running.
- The command checks anonymous redirects, bad-password rejection, seeded-user login, authenticated routes, and `/metricas` privacy smoke checks.
- The command checks that the login form has a native `post` fallback.
- The command checks that the data export route does not expose password hash markers.
- `npm run ready:local` exists and passes when the database and local app server are running.
- `npm run ready:local` shall not run the production build while the local dev server is active.
- `npm run ci` remains clean.

## Error Cases

- If `.env` is missing seeded-user credentials, the command shall fail before making auth requests.
- If the app server is stopped, the command shall report that the local server is unreachable.
- If the database or migrations are not ready, affected routes shall fail the smoke test.
- If any route renders a framework error shell, the command shall fail.

## Security And Privacy Considerations

The command shall not log credentials, cookies, response bodies, exported JSON, message content, memory content, or raw database data.

The `/metricas` check shall include a narrow privacy smoke assertion that selected seeded conversation snippets and password hash markers are absent from the metrics page.

## Data Model Impact

No schema change.

The command does not write to the database.

## API Impact

No public API impact.

The command uses existing Auth.js endpoints and App Router pages.

## UI/UX Impact

No UI change.

## Memory Impact

No memory behavior change.

## AI Behavior Impact

No AI behavior change.

## Testing Plan

- `npm run smoke:local`
- `npm run ready:local`
- `npm run pilot:check`
- `npm run ci`

## Implementation Tasks

- [x] Add local smoke test script.
- [x] Add `smoke:local` package script.
- [x] Add `ready:local` package script.
- [x] Document the command in the pilot checklist.
- [x] Keep the command outside CI.
- [x] Run checks.

## Documentation To Update

- `docs/planning/pilot-launch-checklist.md`

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-08-03 | Initial implementation | Add repeatable local route/auth smoke test |
| 2026-08-03 | Added `ready:local` and export privacy smoke checks | Provide a single local acceptance gate before pilot review |
| 2026-08-03 | Added login POST fallback check | Prevent credentials from appearing in the URL when the form submits before hydration |
| 2026-08-03 | Moved `ready:local` to the no-build quality gate | Avoid invalidating dev-server assets while the app is running |
