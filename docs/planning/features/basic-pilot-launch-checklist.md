# Feature Specification: Basic Pilot Launch Checklist

## Feature Name

Basic pilot launch checklist.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-25.

## Objective

Create a practical checklist for deciding whether the MVP is ready for a small local pilot with fictitious or controlled test data.

The checklist shall make remaining operational, safety, privacy, testing, and manual verification work visible before inviting users.

## Problem / Context

The backlog requires a pilot launch checklist before testing the product with users.

The project now has authentication, onboarding, conversation, guided modes, credits, memory controls, privacy controls, audit events, metrics, and safety regression tests. These pieces need a single review gate.

## User Value

The project owner can see what is ready, what needs manual confirmation, and what must not be assumed before a pilot.

## Scope

- Add a pilot readiness checklist under `docs/planning/`.
- Cover environment, database, auth, conversation, guided modes, memory, privacy, safety, audit, metrics, AI provider, secrets, and manual browser testing.
- Keep it practical and Spanish-first.

## Out Of Scope

- Do not claim production readiness.
- Do not add code.
- Do not add migrations.
- Do not change architecture decisions.
- Do not add legal documents.

## Functional Requirements

- The checklist shall distinguish verified items from items requiring manual confirmation.
- The checklist shall include exact commands for local verification where useful.
- The checklist shall include a final go/no-go decision section.
- The checklist shall avoid sensitive data and secrets.

## Non-Functional Requirements

- The document shall be concise enough to use repeatedly.
- The document shall align with existing architecture, safety, privacy, and incident-response specifications.

## Acceptance Criteria

- `docs/planning/pilot-launch-checklist.md` exists.
- The checklist covers the backlog's Phase 8.4 acceptance criteria.
- The checklist does not represent the MVP as production-ready.
- No source code, schema, migrations, package files, ADRs, README, or AGENTS files are modified.

## Error Cases

- If a checklist item cannot be verified locally, it shall be marked as requiring manual review rather than assumed complete.

## Security And Privacy Considerations

The checklist shall remind the owner to confirm that secrets are not committed, logs avoid sensitive content, data export works, account deletion works, and incident-response notes are available.

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

- `npm run format:check`

## Implementation Tasks

- [x] Add the pilot launch checklist document.
- [x] Run format check.

## Documentation To Update

No additional documentation update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-25 | Initial implemented spec | Define and deliver the pilot checklist slice |
