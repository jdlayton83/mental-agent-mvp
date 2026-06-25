# Feature Specification: Basic Demo Data Seed

## Feature Name

Basic demo data seed.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-25.

## Objective

Extend the development seed with safe fictitious demo data so the MVP can be tested without manually creating conversations, sessions, memories, usage, safety, audit, and feedback records.

The seed shall remain idempotent and suitable only for local development or controlled pilot preparation.

## Problem / Context

The current seed creates the development user, agent templates, guided mode catalog, system setting, wallet, and initial credit transaction.

The pilot checklist and metrics dashboard are more useful when there is representative non-sensitive demo data. The backlog also calls for fictitious demo data and scenarios before pilot validation.

## User Value

The project owner can open `/inicio`, `/memoria`, `/metricas`, and `/privacidad` and see realistic MVP states without manually generating each one.

## Scope

- Extend `src/db/seed.ts` with demo data for the development user.
- Ensure the development user has completed onboarding.
- Ensure the development user has one primary agent.
- Seed one completed free-chat conversation and session with non-sensitive messages.
- Seed one completed guided-mode session summary.
- Seed one confirmed memory and one proposed memory.
- Seed one session feedback record.
- Seed one usage event.
- Seed one safety event with minimized non-content trigger summary.
- Seed one audit event.
- Keep all demo records idempotent.

## Out Of Scope

- Do not create real user data.
- Do not add new tables.
- Do not add migrations.
- Do not add embeddings.
- Do not create goals or habits.
- Do not seed graphic, clinical, or highly sensitive conversation content.
- Do not modify docs outside this feature spec unless required by checks.

## Functional Requirements

- Running `npm run db:seed` multiple times shall not create duplicate demo records.
- Demo data shall belong only to the development user configured by environment variables.
- Demo data shall use fictitious, low-sensitivity Spanish content.
- Demo sessions shall be completed, so `/inicio` can show summaries and feedback state.
- Demo memories shall be visible in `/memoria`.
- Demo metrics shall appear in `/metricas`.
- Demo audit and safety records shall not include full conversation content.

## Non-Functional Requirements

- The seed shall remain readable and maintainable.
- The seed shall not require an AI provider call.
- The seed shall work with the existing `db:seed` command.
- Typecheck, lint, format check, and tests shall remain clean.

## Acceptance Criteria

- `npm run db:seed` completes successfully when the database is available.
- Re-running `npm run db:seed` does not create duplicate demo rows.
- `/inicio` has representative recent activity after seeding.
- `/memoria` shows at least one proposed and one confirmed memory.
- `/metricas` shows non-zero counts for sessions, memory, audit, and usage.
- `npm run test` passes.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.

## Error Cases

- If the database is unavailable, the seed shall fail clearly.
- If the development user cannot be created, the seed shall stop.
- If required catalog records are missing, the seed shall create or update them before demo rows.

## Security And Privacy Considerations

All demo content shall be fictitious and low sensitivity.

Demo safety events shall contain category, level, policy, action, and a minimized trigger summary only.

No secrets, API keys, real personal data, clinical diagnoses, or therapy claims shall be included.

## Data Model Impact

No schema change is planned.

The seed writes existing tables only.

## API Impact

No API impact.

## UI/UX Impact

The existing UI will show richer demo states after seeding.

No UI change is planned.

## Memory Impact

The seed creates demonstration memory records only. They shall be clearly fictitious and low sensitivity.

## AI Behavior Impact

No AI behavior change is planned.

The seed shall not call AI providers.

## Testing Plan

- `npm run db:seed`
- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- Manual browser test:
  - open `/inicio`;
  - open `/memoria`;
  - open `/metricas`.

## Implementation Tasks

- [x] Add primary agent seed for development user.
- [x] Mark development onboarding as completed.
- [x] Add demo free-chat conversation, session, messages, and summary.
- [x] Add demo guided session and summary.
- [x] Add demo memories.
- [x] Add demo feedback metadata.
- [x] Add demo usage, safety, and audit events.
- [x] Run checks.

## Documentation To Update

Update this feature spec if scope changes.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-25 | Initial draft | Define development demo seed slice |
| 2026-06-25 | Marked implemented | Demo data seed implemented and verified |
