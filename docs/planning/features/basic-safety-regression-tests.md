# Feature Specification: Basic Safety Regression Tests

## Feature Name

Basic safety regression tests.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-25.

## Objective

Strengthen the MVP's automated safety checks with a small deterministic regression suite for the current local safety classifier, output validator, and safe-response generator.

The feature shall make it harder to accidentally weaken safety behavior while continuing product development.

## Problem / Context

The safety specification requires regression tests for risk classification, safe routing, output validation, and non-clinical boundaries.

The project already has a minimal `src/tests/run.ts` runner and a `npm run test` script covering some safety and memory cases. Coverage is still thin for prompt injection, clinical boundaries, dependency, self-harm output validation, and safe-response content.

## User Value

The project owner gains confidence that core safety rules still work before inviting pilot users.

## Scope

- Expand the existing deterministic test runner.
- Add safety classifier cases for:
  - self-harm;
  - medication;
  - clinical diagnosis requests;
  - dependency;
  - prompt injection;
  - ordinary non-risk text.
- Add output validator cases for:
  - self-harm instructions;
  - medication advice;
  - clinical diagnosis;
  - dependency-forming language;
  - prompt or secret leakage.
- Add safe-response checks for each current safety category.
- Keep the tests local and deterministic.
- Run `npm run test` as part of verification for this slice.

## Out Of Scope

- Do not add an external test framework migration in this slice.
- Do not call any AI provider.
- Do not add browser automation.
- Do not add country-specific emergency resources.
- Do not change the safety policy unless a test reveals an approved bug fix is needed.
- Do not add clinical diagnostic language.

## Functional Requirements

- The test runner shall fail if a risky input is no longer classified as interrupting.
- The test runner shall fail if unsafe assistant output is no longer replaced.
- The test runner shall fail if safe responses are missing core non-clinical boundary language.
- Ordinary safe messages shall remain allowed.
- The tests shall avoid graphic or instructional harmful content.

## Non-Functional Requirements

- Tests shall be deterministic and fast.
- Test names shall clearly describe the expected behavior.
- Typecheck, lint, format check, and test script shall remain clean.

## Acceptance Criteria

- `npm run test` covers all current safety categories.
- `npm run test` covers output replacement for unsafe assistant text.
- `npm run test` covers safe response generation for current categories.
- Existing memory tests still pass.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.

## Error Cases

- If a test reveals that current behavior contradicts the safety specification, implementation shall stop and the fix shall be reviewed before changing expected outcomes.
- If test compilation fails, the suite shall not be considered complete.

## Security And Privacy Considerations

Test fixtures shall be synthetic and shall not include real user data.

Tests shall avoid detailed harmful instructions, methods, doses, or operational abuse content.

## Data Model Impact

No schema change is planned.

## API Impact

No public API is planned.

## UI/UX Impact

No UI change is planned.

## Memory Impact

Existing memory extractor tests shall remain in place.

This feature shall not create, update, or delete real memories.

## AI Behavior Impact

No provider prompt or AI gateway behavior change is planned unless a failing test exposes a bug that the user approves fixing.

## Testing Plan

- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`

## Implementation Tasks

- [x] Expand classifier regression cases.
- [x] Expand output validator regression cases.
- [x] Add safe-response regression cases.
- [x] Keep existing memory extractor tests passing.
- [x] Run test, typecheck, lint, and format checks.

## Documentation To Update

Update this feature spec if scope changes.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-25 | Initial draft | Define safety regression test slice |
| 2026-06-25 | Marked implemented | Expanded regression tests, fixed self-harm output validation gap, and completed checks |
