# Feature Specification: Basic Safety Resource Resolver

## Feature Name

Basic safety resource resolver.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-29.

## Objective

Add a minimal deterministic `ResourceResolver` for safety responses so the application has an explicit component for offering support resources without hard-coding or inventing country-specific emergency numbers.

The resolver shall return safe fallback resource categories now and leave room for maintained country or region resources later.

## Problem / Context

The safety specification names `ResourceResolver` as part of the safety architecture. Current safe responses mention emergencies and human support directly, but there is no explicit resolver component and no regression coverage that prevents future hard-coded resource drift.

## User Value

Users who trigger safety protocols receive clearer, safer next-step language. The project owner gets a maintainable place to add verified resources later without scattering emergency copy across prompts or modules.

## Scope

- Add an internal safety resource resolver module.
- Return fallback resources for self-harm, clinical, medication and dependency cases.
- Avoid static emergency phone numbers, country-specific organizations and unverified URLs.
- Integrate fallback resources into safe responses.
- Add deterministic regression tests.

## Out Of Scope

- Do not add a maintained country resource database in this slice.
- Do not browse or fetch external resources at runtime.
- Do not add country-specific emergency numbers.
- Do not add new tables or migrations.
- Do not change the risk classifier categories.
- Do not make the product clinical.

## Functional Requirements

- The resolver shall accept a safety assessment and optional locale or region code.
- The resolver shall return resources appropriate to the assessment category.
- Self-harm emergency responses shall include emergency-local, trusted-person and urgent-care fallback resources.
- Clinical and medication responses shall include professional-care fallback resources.
- Dependency responses shall include trusted-person fallback resources.
- Prompt injection responses shall not add unrelated external resources.
- All fallback resources shall clearly avoid invented phone numbers.

## Non-Functional Requirements

- The implementation shall be deterministic and fast.
- The module shall not access network, database, filesystem or environment variables.
- Typecheck, lint, format check, tests and build shall remain clean.

## Acceptance Criteria

- `resolveSafetyResources` returns fallback resources for level 4 self-harm.
- Self-harm safe responses include resource guidance without static phone numbers.
- Prompt-injection safe responses do not include emergency resources.
- `npm run test` covers the resolver behavior.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.
- `npm run build -- --webpack` passes.

## Error Cases

- If the assessment has category `none`, the resolver shall return an empty list.
- If no region can be trusted, resources shall use generic local-emergency wording instead of inventing a phone number.

## Security And Privacy Considerations

The resolver shall not record content, user identifiers or location. It shall only transform an already classified safety assessment into generic resource guidance.

The implementation shall not create a false sense of verified localization. Fallback resources shall be labeled as fallback resources.

## Data Model Impact

No data model change is planned.

## API Impact

No public external API is required.

An internal safety helper may be added under `src/modules/safety/`.

## UI/UX Impact

Safe responses may include one concise resources section when appropriate.

## Memory Impact

No memory behavior changes.

## AI Behavior Impact

Safe responses become slightly more structured. The normal conversational model remains unchanged.

## Testing Plan

- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build -- --webpack`

## Implementation Tasks

- [x] Add resource resolver module.
- [x] Integrate resolver with safe responses.
- [x] Add safety regression tests.
- [x] Run tests, typecheck, lint, format check and build.

## Documentation To Update

Update this feature spec if implementation scope changes.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-29 | Initial draft | Add explicit fallback resource resolver |
| 2026-06-29 | Marked implemented after resolver, safe response integration, tests and checks passed | Implementation complete |
