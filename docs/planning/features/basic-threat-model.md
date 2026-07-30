# Feature Specification: Basic Threat Model

## Feature Name

Basic threat model.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-30.

## Objective

Create an initial threat model for the local MVP so pilot readiness can be reviewed against explicit assets, trust boundaries, threats, mitigations and residual risks.

The document shall support controlled local testing. It shall not claim production readiness or replace a later DPIA, legal review, penetration test or cloud security review.

## Problem / Context

The MVP specification requires an initial threat model before tests with known people. `security-architecture.md` also states that the threat model shall be versioned, but no dedicated threat-model document existed yet.

## User Value

The project owner can decide whether to continue with fictitious or controlled pilot data while knowing which risks are already mitigated, which risks remain, and which controls must exist before real or broader data is used.

## Scope

- Add a dedicated threat model under `docs/architecture/`.
- Cover the current local MVP architecture and pilot scope.
- Document key assets, actors, trust boundaries, threats, mitigations and residual risks.
- Link the threat model from the security architecture and root architecture index.
- Add the threat model to the pilot checklist.

## Out Of Scope

- Do not implement code.
- Do not add migrations or schema changes.
- Do not perform penetration testing.
- Do not claim beta, production or legal readiness.
- Do not add cloud-specific controls before a cloud deployment exists.

## Functional Requirements

- The threat model shall be Spanish-first.
- The threat model shall distinguish current controls from residual risks.
- The threat model shall explicitly cover authentication, authorization, data isolation, secrets, local database, AI provider use, prompt injection, memory, privacy export/deletion, logs, supply chain and local operation.
- The pilot checklist shall include a manual verification item for the threat model.

## Non-Functional Requirements

- The document shall be concise enough to review repeatedly before a pilot.
- The document shall align with `security-architecture.md`, `privacy-and-compliance.md`, `incident-response.md`, `safety-guardrails.md` and `mvp.md`.
- Existing ADRs shall not be modified.

## Acceptance Criteria

- `docs/architecture/threat-model.md` exists.
- The root README structure lists `docs/architecture/threat-model.md`.
- `docs/architecture/security-architecture.md` references the dedicated threat model.
- `docs/planning/pilot-launch-checklist.md` includes the initial threat model as a pilot readiness check.
- `npm run format:check` passes.
- `npm run ci` passes.

## Error Cases

- If a risk is not fully mitigated in the current MVP, it shall be documented as residual risk instead of silently treated as solved.
- If a future feature changes data, AI, provider, memory, authentication, authorization or deployment boundaries, this threat model shall be updated.

## Security And Privacy Considerations

This is a security and privacy planning document. It shall avoid secrets, real user data, exploit instructions, emergency telephone numbers and operational credentials.

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
- `npm run ci`

## Implementation Tasks

- [x] Add the initial threat model.
- [x] Link it from security architecture.
- [x] Update the root architecture index.
- [x] Update the pilot checklist.
- [x] Run checks.

## Documentation To Update

- `docs/architecture/threat-model.md`
- `docs/architecture/security-architecture.md`
- `docs/planning/pilot-launch-checklist.md`
- `README.md`

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-30 | Initial implemented threat model | Satisfy pilot-readiness gate and version current residual risks |
