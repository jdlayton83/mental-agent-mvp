# Feature Specification: Basic Windows Dev Server Fallback

## Feature Name

Basic Windows dev server fallback.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-28.

## Objective

Add a local fallback command for starting the Next.js development server in this Windows/Codex environment when `next dev` fails before startup with `spawn EPERM`.

## Problem / Context

The standard `npm run dev` command delegates to `next dev`. In this environment, Next.js 16 forks its internal `start-server` worker during dev startup, and that child-process spawn can fail with `spawn EPERM` before application code runs.

The project already uses local Windows mitigations for build and test commands. A similar fallback is needed for Codex-driven browser smoke testing without changing the official development command.

## User Value

The project owner can keep using the standard Next.js command when it works, while Codex has a safer local fallback for internal PoC smoke checks.

## Scope

- Add a Node.js wrapper that calls Next's installed `startServer` module directly.
- Bootstrap and maintain the dev required server file set from the latest local build when Next's forked dev CLI cannot create it.
- Add `dev:local` as a package script.
- Keep `dev` unchanged.
- Document the fallback in the pilot checklist.
- Run the existing quality gate.

## Out Of Scope

- Do not patch `node_modules`.
- Do not replace the official `dev` script.
- Do not add dependencies.
- Do not start Docker.
- Do not change application behavior.

## Functional Requirements

- `npm run dev:local` shall start the local Next.js dev server without invoking `next dev`.
- `npm run dev:local` shall create and maintain the required `.next/dev` server files from `.next/required-server-files.json` when a build manifest exists.
- The fallback shall use port `3000` by default.
- The fallback shall honor `PORT` when provided.
- The fallback shall run in development mode.
- The standard `npm run dev` script shall remain unchanged.

## Non-Functional Requirements

- The implementation shall use Node.js already available in the project.
- Typecheck, lint, test, quality checks, format check and build shall remain clean.

## Acceptance Criteria

- `package.json` contains `dev:local`.
- `npm run dev` remains unchanged.
- `npm run ci` passes.
- The pilot checklist documents using `npm run dev:local` if `npm run dev` fails with `spawn EPERM` in this environment.

## Error Cases

- If the fallback command fails, the exact error shall be inspected before repeating startup attempts.
- If Next.js changes or removes the internal `startServer` module, this fallback shall be revisited.
- If no `.next/required-server-files.json` exists, run the quality gate or build before relying on `dev:local` for Codex smoke testing.

## Security And Privacy Considerations

The fallback only changes how the local development server is started. It does not read secrets beyond normal application startup and does not change auth, consent, privacy or AI behavior.

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

- `npm run ci`
- Local smoke startup with `npm run dev:local`

## Implementation Tasks

- [x] Add no-fork dev server wrapper.
- [x] Bootstrap and maintain the missing dev required server files from the latest local build output.
- [x] Add `dev:local` script.
- [x] Document the fallback in the pilot checklist.
- [x] Run the unified CI command.
- [x] Smoke-test local startup.

## Documentation To Update

Update `docs/planning/pilot-launch-checklist.md`.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-28 | Initial implemented spec | Provide a local fallback for Next dev `spawn EPERM` |
