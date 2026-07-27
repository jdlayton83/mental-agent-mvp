# Feature Specification: Basic Dependency Version Pinning

## Feature Name

Basic dependency version pinning.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Pin floating `latest` package ranges to the exact versions already resolved in `package-lock.json`.

## Problem / Context

The MVP depends on a known working Next.js, React, TypeScript and ESLint toolchain. Several direct dependencies still used `latest`, which could make a future install resolve a different stack without an intentional upgrade decision.

## User Value

The project owner gets more reproducible installs and CI behavior while keeping the currently validated dependency set.

## Scope

- Replace direct `latest` ranges in `package.json` with the exact versions already installed.
- Keep existing non-`latest` ranges unchanged.
- Keep `package-lock.json` root metadata aligned with `package.json`.

## Out Of Scope

- Do not upgrade dependencies.
- Do not downgrade dependencies.
- Do not change application code.
- Do not run `npm audit fix --force`.

## Functional Requirements

- Direct `latest` entries shall be removed from `package.json`.
- The pinned versions shall match the current lockfile-resolved versions.
- Existing caret ranges for packages already intentionally ranged shall remain unchanged.

## Non-Functional Requirements

- The unified CI command shall remain clean.

## Acceptance Criteria

- `package.json` contains no direct `latest` dependency ranges.
- `package-lock.json` root package metadata matches `package.json`.
- `npm run ci` passes.

## Error Cases

- If a future dependency upgrade is required, it shall be done as an explicit upgrade rather than by floating `latest`.

## Security And Privacy Considerations

Pinned direct dependency versions reduce unexpected supply-chain drift between local development and CI.

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

- `npm run ci`

## Implementation Tasks

- [x] Pin direct `latest` dependencies to lockfile versions.
- [x] Align lockfile root metadata.
- [x] Run the unified CI command.

## Documentation To Update

No additional documentation update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-27 | Initial implemented spec | Keep the validated toolchain reproducible |
