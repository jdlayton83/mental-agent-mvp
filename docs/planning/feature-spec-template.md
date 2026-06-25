# Feature Specification Template

Use this template for any non-trivial product or engineering change before implementation starts.

## Feature Name

Short, descriptive name.

## Status

Use one of:

- Proposed
- Approved
- In progress
- Implemented
- Archived

## Owner

Person responsible for clarifying scope and accepting the result.

## Date

Creation date and, when useful, last update date.

## Objective

State the intended outcome in one or two paragraphs.

## Problem / Context

Explain why this change is needed, what currently exists, and what constraint or gap it addresses.

## User Value

Describe the concrete value for the user or operator.

## Scope

List what is included in this change.

## Out Of Scope

List what must not be implemented as part of this change.

## Functional Requirements

Use normative, testable requirements.

- The system shall...

## Non-Functional Requirements

Include performance, reliability, accessibility, localization, maintainability, or operational constraints when relevant.

## Acceptance Criteria

Define the observable conditions that must be true for the change to be accepted.

- Given...
- When...
- Then...

## Error Cases

Describe expected behavior for invalid input, unavailable services, denied access, empty states, and recoverable failures.

## Security And Privacy Considerations

Document authentication, authorization, consent, auditability, secret handling, data minimization, and privacy implications.

## Data Model Impact

State whether database schema, migrations, seeds, repositories, or data retention rules change.

## API Impact

State whether route handlers, server actions, internal services, external integrations, or contracts change.

## UI/UX Impact

Describe screens, navigation, copy, states, accessibility, and Spanish-first product text requirements.

## Memory Impact

State whether the feature reads, writes, updates, or deletes user memory, preferences, goals, or conversation history.

Memory shall not be used to make unsupported psychological inferences or weaken safety constraints.

## AI Behavior Impact

State whether prompts, model routing, safety behavior, tone adaptation, tool use, or response validation change.

AI behavior changes shall preserve the safety specifications and shall not turn the product into a clinical or therapy application.

## Testing Plan

List the checks required before completion, such as:

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- Unit tests
- Manual browser verification

## Implementation Tasks

Break the approved work into small tasks.

- [ ] Task 1
- [ ] Task 2

## Documentation To Update

List any specs, ADRs, README sections, planning docs, or operational notes that must change.

## Open Questions

List unresolved questions. Implementation should not start while blocking questions remain open.

## Change Log

Record material scope or requirement changes.

| Date | Change | Reason |
|---|---|---|
| YYYY-MM-DD | Initial draft | New feature proposal |
