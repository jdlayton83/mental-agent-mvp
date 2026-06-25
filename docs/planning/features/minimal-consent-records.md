# Feature Specification: Minimal Consent Records

## Feature Name

Minimal consent records.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-21.

## Objective

Implement minimal, versioned consent tracking for the MVP so the user can understand and control the core data-processing choices before broader pilot testing.

The feature shall keep legal/privacy consent separate from user preferences and shall preserve consent history.

## Problem / Context

The backlog requires minimum consents for terms, privacy, memory, and optional analytics. The database architecture specifies a `consent_records` table and states that legal consents shall not be stored in `user_preferences`.

The current app has `user_preferences.memory_enabled`, but it does not yet have a versioned consent history or a user-facing consent control surface.

## User Value

The user can see which core consents are active, grant or revoke optional ones, and understand that memory and analytics are separate choices.

## Scope

- Add a `consent_records` table.
- Add Drizzle schema and export it.
- Create and register the manual migration.
- Add minimal server helpers to get current consent state.
- Add server actions to grant or revoke consents by appending records.
- Add a Spanish-first privacy/consent page or section.
- Link the consent page from `/inicio`.
- Keep memory consent synchronized with `user_preferences.memory_enabled` for this MVP slice.

## Out Of Scope

- Do not implement full legal policy documents.
- Do not add cookie banners or marketing communications.
- Do not add multimodal, microphone, camera, recording, or training consents.
- Do not implement data export or account deletion in this slice.
- Do not add audit events until the audit table exists.
- Do not run `drizzle-kit generate`.
- Do not apply migrations from Codex.

## Functional Requirements

- The system shall track these consent types:
  - `terms`;
  - `privacy`;
  - `memory`;
  - `analytics`;
- Each consent record shall include user, consent type, policy version, status, timestamps, source, and metadata.
- Granting or revoking consent shall append a new record and shall not overwrite previous records.
- The current consent state shall be derived from the latest record per consent type.
- Terms and privacy shall be treated as required for normal MVP use.
- Memory and analytics shall be optional and independently revocable.
- Revoking memory consent shall set `user_preferences.memory_enabled` to `false`.
- Granting memory consent shall set `user_preferences.memory_enabled` to `true`.
- Analytics consent shall not enable external analytics in this slice; it shall only record preference.

## Non-Functional Requirements

- The implementation shall be minimal and local-first.
- UI copy shall be Spanish-first and clear.
- No sensitive conversation content shall be stored in consent metadata.
- Typecheck, lint, and format checks shall remain clean.

## Acceptance Criteria

- `src/db/schema/consent-records.ts` exists and exports `consentRecords`.
- `src/db/schema/index.ts` exports the consent schema.
- A manual migration creates `consent_records` and registers it in Drizzle's journal.
- `/inicio` links to a Spanish-first consent control page.
- The consent control page shows the current status for terms, privacy, memory, and analytics.
- The user can grant and revoke memory consent.
- The user can grant and revoke analytics consent.
- Terms and privacy can be granted if missing.
- Consent history is append-only.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.

## Error Cases

- If the user is not authenticated, the consent page and actions shall redirect to `/login`.
- If form input contains an unsupported consent type, the action shall do nothing safely.
- If memory preference is missing, the action shall not create unrelated profile data.
- If the migration cannot be applied, implementation shall stop before relying on the table.

## Security And Privacy Considerations

Consent records shall be filtered by `user_id` in all reads and writes.

Consent metadata shall not include conversation text, secrets, provider payloads, or sensitive personal content.

This feature is a product/privacy control, not legal advice or a complete compliance implementation.

## Data Model Impact

This feature requires a new `consent_records` table.

No destructive migration is planned.

## API Impact

No external API is required.

Server actions may be added for grant and revoke operations.

## UI/UX Impact

Add a privacy/consent page, recommended route `/privacidad`.

The page shall use direct Spanish copy and short controls. It shall not show long legal text in this MVP slice.

## Memory Impact

Memory consent shall control `user_preferences.memory_enabled`.

Revoking memory consent shall not delete existing memories in this slice; deletion belongs to the later data deletion feature.

## AI Behavior Impact

No prompt behavior change is planned.

Future AI context builders should respect `memory_enabled`; this is already part of the current design.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- Manual database migration by the user.
- Manual browser test:
  - open `/privacidad`;
  - grant missing required consents;
  - toggle memory consent;
  - toggle analytics consent;
  - refresh and verify state persists.

## Implementation Tasks

- [x] Add `consent_records` Drizzle schema.
- [x] Export consent schema from `src/db/schema/index.ts`.
- [x] Create and register manual migration.
- [x] Add consent state and action helpers.
- [x] Add `/privacidad` page.
- [x] Link `/privacidad` from `/inicio`.
- [x] Run typecheck, lint, and format checks.

## Documentation To Update

Update this feature spec if scope changes.

No ADR or README update is expected because this implements existing approved architecture.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-21 | Initial draft | Start Phase 7.1 minimal consent implementation |
| 2026-06-21 | Approved with terms and privacy granted manually through the UI | User approval |
| 2026-06-21 | Marked implemented after schema, manual migration, UI, actions, and checks passed | Implementation complete |
