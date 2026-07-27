# Feature Specification: Basic Preference Management

## Feature Name

Basic preference management.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-07-27.

## Objective

Let the authenticated user update basic profile, agent, and conversational preferences after onboarding.

## Problem / Context

Onboarding captures the initial agent name, tone, style, response length, initiative level, and main goal. After onboarding, the user can see these values on `/inicio`, but cannot correct or adjust them without database access.

The agent behavior specification allows personalization, while requiring that safety and non-clinical boundaries remain unchanged.

## User Value

The user can tune the assistant experience as their needs change without recreating the account or agent.

## Scope

- Add a protected `/preferencias` page.
- Let the user update display name and preferred name.
- Let the user update the primary agent custom name.
- Let the user update tone, style, response length, and initiative level.
- Let the user update the primary goal used for context.
- Link the page from `/inicio`.
- Record a minimized audit event for successful preference updates.

## Out Of Scope

- Do not change memory consent; it remains controlled from `/privacidad`.
- Do not change terms, privacy, or analytics consent.
- Do not change agent template selection.
- Do not create a new agent.
- Do not add notifications, reminders, integrations, or billing preferences.
- Do not add a migration.
- Do not weaken safety, privacy, or non-clinical rules.

## Functional Requirements

- The page shall require authentication.
- If the user has no active primary agent, the page shall redirect to onboarding.
- The update action shall modify only records owned by the current user.
- Display name, preferred name, and custom agent name shall be optional and limited to 120 characters.
- Main goal shall be optional and limited to 500 characters.
- Tone shall be one of `soft`, `balanced`, or `direct`.
- Style shall be one of `practical`, `reflective`, or `inspiring`.
- Response length shall be one of `short`, `medium`, or `long`.
- Initiative level shall be an integer from 0 to 2.
- The updated preferences shall affect future conversation context.

## Non-Functional Requirements

- UI copy shall be Spanish-first and concise.
- The page shall not present preferences as clinical settings.
- Audit metadata shall not include display names, custom names, or main goal text.
- Typecheck, lint, tests, format check and build shall remain clean.

## Acceptance Criteria

- `/inicio` links to `/preferencias`.
- `/preferencias` displays current profile, preference, and primary-agent values.
- Submitting valid changes persists them.
- `/inicio` shows updated names and preference summary after save.
- Future conversation context uses the updated tone, style, response length, initiative, and main goal.
- Invalid values do not modify data.
- Actions do not affect another user's data.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run test` passes.
- `npm run format:check` passes.
- `npm run build -- --webpack` passes.

## Error Cases

- If the user is not authenticated, redirect to `/login`.
- If there is no active primary agent, redirect to `/onboarding`.
- If form input is invalid, no data is changed.
- If profile or preference records are missing, the update shall safely create the minimal missing record for the current user.

## Security And Privacy Considerations

All reads and writes shall filter by the authenticated user ID.

Preference audit events shall store field names and boolean presence flags only, not the actual names or goal text.

Preference changes shall not alter safety, privacy, consent, or non-clinical boundaries.

## Data Model Impact

No schema change is planned. The feature uses existing `user_profiles`, `user_preferences`, and `agents` fields.

## API Impact

Adds one internal server action under the users module.

## UI/UX Impact

Adds a Spanish-first settings page using the existing simple form style.

The UI shall keep memory consent visibly separate by linking back to `/privacidad` instead of duplicating the memory control.

## Memory Impact

No memory records are changed.

Updated preferences may affect tone adaptation, but shall not be used to make unsupported psychological inferences or reduce safety constraints.

## AI Behavior Impact

Future conversation prompts shall use the updated tone, style, response length, initiative level, and main goal through the existing context builder.

Safety and non-clinical rules remain higher priority than preferences.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run format:check`
- `npm run build -- --webpack`

Manual browser test:

- open `/preferencias`;
- change tone, style, response length, initiative, and main goal;
- save;
- confirm `/inicio` reflects the updated values;
- send a new conversation message and confirm no safety boundary changed.

## Implementation Tasks

- [x] Add preference update server action.
- [x] Add `/preferencias` page.
- [x] Add link from `/inicio`.
- [x] Add minimized audit event.
- [x] Run validation checks.

## Documentation To Update

Update this feature spec if preference scope expands to consent, notifications, billing, integrations, or agent template changes.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-27 | Initial implemented slice | Add post-onboarding preference control without changing consent or safety rules |
