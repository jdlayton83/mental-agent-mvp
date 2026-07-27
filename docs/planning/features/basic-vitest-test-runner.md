# Feature Specification: Basic Vitest Test Runner

## Feature Name

Basic Vitest test runner.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Run the existing unit and regression test suite through Vitest, matching ADR-0001's selected unit-test tooling.

## Problem / Context

ADR-0001 states that Vitest shall cover rules and internal services. Vitest is installed, but `npm run test` still used a custom `tsc --project tsconfig.test.json && node .test-dist/tests/run.js` command.

The current test file already contains focused regression cases for safety, memory extraction, conversation context, usage status, feedback metadata and guided flows. This slice keeps those cases and changes only the runner.

## User Value

The project owner gets a standard test runner that matches the documented stack and is easier to extend with future test files.

## Scope

- Convert the existing `src/tests/run.ts` table of cases to register Vitest tests.
- Rename the regression suite to Vitest's `*.test.ts` convention.
- Update `npm run test` to use Vitest.
- Use Vitest's threads pool in this Windows environment to avoid the known child-process `spawn EPERM` failure.
- Remove the old custom runner TypeScript config.
- Keep the existing assertions and coverage intent.

## Out Of Scope

- Do not add browser or Playwright tests.
- Do not add database integration tests.
- Do not change application behavior.
- Do not change safety, memory, guided-mode, feedback or usage logic.

## Functional Requirements

- `npm run test` shall run the current regression cases through Vitest.
- `npm run test` shall use `--pool=threads` locally because the default fork pool can fail with `spawn EPERM` in this Windows environment.
- Existing test names shall remain readable in command output.
- Existing assertion coverage shall be preserved.

## Non-Functional Requirements

- Typecheck, lint, test, quality checks, format check and build shall remain clean.

## Acceptance Criteria

- `npm run test` passes through Vitest.
- The same regression cases continue to run.
- `npm run ci` passes.

## Error Cases

- If a test fails, Vitest shall report the named failing case.

## Security And Privacy Considerations

The suite includes safety and privacy-adjacent regression cases. Moving to Vitest shall not remove those checks.

## Data Model Impact

No data model impact.

## API Impact

No API impact.

## UI/UX Impact

No UI impact.

## Memory Impact

No memory behavior impact.

## AI Behavior Impact

No AI behavior change.

## Testing Plan

- `npm run test`
- `npm run ci`

## Implementation Tasks

- [x] Register existing test cases with Vitest.
- [x] Rename the regression suite to Vitest's test-file convention.
- [x] Update `npm run test`.
- [x] Configure Vitest to use the threads pool for the local Windows runner.
- [x] Remove the old `tsconfig.test.json` custom runner config.
- [x] Run the unified CI command.

## Documentation To Update

No additional documentation update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-27 | Initial implemented spec | Align unit test runner with ADR-0001 |
| 2026-07-27 | Configured Vitest with `--pool=threads` | Avoid Windows `spawn EPERM` from the default fork pool |
| 2026-07-27 | Removed the old custom runner config | Keep a single test execution path |
