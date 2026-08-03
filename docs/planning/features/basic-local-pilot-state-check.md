# Feature Specification: Basic Local Pilot State Check

## Feature Name

Basic local pilot state check.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-08-03.

## Objective

Add a local verification command that confirms the database and seeded MVP state are ready for internal pilot testing.

The check shall be explicit and repeatable, so the project owner can distinguish between a code problem and a local environment problem.

## Problem / Context

The MVP now depends on a running local PostgreSQL database, applied manual migrations, and an idempotent seed.

Because Codex cannot run Docker commands in this environment and `drizzle-kit generate` is disabled due to the known Windows `spawn EPERM` failure, local readiness needs a safe command that validates the resulting database state without creating or migrating data.

## User Value

The project owner can run one command after starting PostgreSQL, applying migrations, and running the seed to confirm whether the local MVP is ready to test in the browser.

## Scope

- Add a `pilot:check` script.
- Verify that PostgreSQL is reachable using `DATABASE_URL`.
- Verify that pgvector is enabled.
- Verify that required MVP tables exist.
- Verify that critical columns exist.
- Verify that the development user exists and is usable.
- Verify that seeded agent templates and guided modes exist.
- Verify that the development user has onboarding, preferences, a primary agent, and an active wallet with non-negative balances.
- Keep the command local-only and outside CI.

## Out Of Scope

- Do not start Docker.
- Do not apply migrations.
- Do not run the seed.
- Do not call the AI provider.
- Do not perform browser automation.
- Do not verify production readiness.

## Functional Requirements

- `npm run pilot:check` shall fail clearly when PostgreSQL is not reachable.
- `npm run pilot:check` shall fail clearly when required tables or columns are missing.
- `npm run pilot:check` shall fail clearly when seed data required for internal testing is missing.
- The check shall not print secrets, password hashes, raw SQL params, or user message content.
- The check shall not modify the database.

## Non-Functional Requirements

- The check shall use existing project dependencies only.
- The check shall be readable and easy to extend.
- The check shall remain separate from CI because it requires a running local database.

## Acceptance Criteria

- `npm run pilot:check` exists.
- The check reports a safe database connection error when PostgreSQL is stopped.
- The check can validate the local pilot state when PostgreSQL is running, migrations are applied, and seed data exists.
- `npm run ci` remains clean.

## Error Cases

- If `.env` is missing required local values, the check shall fail before database queries.
- If PostgreSQL is stopped, the check shall fail with a connection message.
- If migrations are missing, the check shall report missing tables or columns.
- If the seed has not run, the check shall report missing development user or user state.

## Security And Privacy Considerations

The check shall only report structural readiness and presence of expected records.

It shall not print secrets, password hashes, message content, memory content, or raw query parameters.

## Data Model Impact

No schema change.

The check reads existing tables only.

## API Impact

No API impact.

## UI/UX Impact

No UI change.

## Memory Impact

No memory behavior change.

## AI Behavior Impact

No AI behavior change.

## Testing Plan

- `npm run pilot:check`
- `npm run ci`

## Implementation Tasks

- [x] Add local pilot database state check script.
- [x] Add `pilot:check` package script.
- [x] Keep the check outside CI.
- [x] Document the command in the pilot checklist.
- [x] Run checks.

## Documentation To Update

- `docs/planning/pilot-launch-checklist.md`

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-08-03 | Initial implementation | Add repeatable local pilot readiness check |
