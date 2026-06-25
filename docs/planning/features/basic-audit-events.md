# Feature Specification: Basic Audit Events

## Feature Name

Basic audit events.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-25.

## Objective

Add a minimal audit trail for critical privacy, consent, and memory-control actions in the MVP.

The audit trail shall help verify that sensitive user actions happened without storing private conversation content, memory content, secrets, or excessive personal data.

## Problem / Context

The architecture specifies an `audit_events` table, and the backlog requires auditability for privacy and control actions.

The current app already has consent changes, JSON data export, account deletion, and memory confirmation/archive/delete actions, but those actions do not write audit records yet. `audit_events` does not currently exist in the schema or migrations.

## User Value

The user and project owner can trust that critical data-control actions are traceable at a technical level without keeping the sensitive content itself.

## Scope

- Add an `audit_events` table.
- Add Drizzle schema and export it.
- Create and register a manual Drizzle migration.
- Add a small audit helper for server-side code.
- Record audit events for:
  - consent grant;
  - consent revoke;
  - data export;
  - memory confirm;
  - memory reject;
  - memory archive;
  - memory delete;
  - account deletion request completed.
- Include only minimized metadata.

## Out Of Scope

- Do not build an admin audit dashboard.
- Do not expose audit records in the UI.
- Do not log full conversation content, memory content, passwords, secrets, API keys, or prompt text.
- Do not add external analytics.
- Do not add background jobs.
- Do not modify ADRs.
- Do not run `drizzle-kit generate`.

## Functional Requirements

- The system shall persist audit events in `audit_events`.
- Each audit event shall include actor user ID, action, entity type, optional entity ID, result, correlation ID, minimized metadata, and creation time.
- The system shall record successful consent grant and revoke actions.
- The system shall record successful data export requests.
- The system shall record successful memory confirm, reject, archive, and delete actions.
- The system shall record successful account deletion completion before or during the deletion transaction in a way that preserves minimal evidence.
- Audit metadata shall not include sensitive user-authored content.
- Audit writes shall not weaken the main authorization checks.

## Non-Functional Requirements

- The implementation shall be small and server-side.
- Audit failures should not expose sensitive errors to the user.
- Typecheck, lint, and format checks shall remain clean.
- The migration shall be manual and registered in Drizzle's journal because `drizzle-kit generate` is not safe in this Windows environment.

## Acceptance Criteria

- `src/db/schema/audit-events.ts` exists and exports `auditEvents`.
- `src/db/schema/index.ts` exports the audit schema.
- A manual migration creates `audit_events`.
- The migration journal includes the new migration entry with the next sequential index.
- Critical consent, export, memory, and account deletion actions write audit records.
- Audit metadata excludes conversation content, memory content, secrets, and API keys.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.

## Error Cases

- If a user is not authenticated, existing auth redirects or responses shall remain unchanged and no user audit event is required.
- If an action receives invalid input and does not modify data, it does not need to create a success audit event.
- If an audited action modifies no rows because the entity does not belong to the user, it shall not create a misleading success audit event.
- If account deletion removes user-owned records, the audit record shall preserve only minimal technical evidence and shall not preserve deleted content.

## Security And Privacy Considerations

Audit events are operational records, not user memory.

The audit trail shall store minimized metadata only. It may store counts, entity types, action names, policy versions, status values, and route names. It shall not store message text, memory text, exported JSON, passwords, secrets, API keys, or provider prompts.

All action-specific audit writes shall derive the user ID from the authenticated session or the server-side action context.

## Data Model Impact

This feature requires a new `audit_events` table.

Proposed fields:

- `id UUID PK`;
- `actor_user_id UUID NULL FK users.id ON DELETE SET NULL`;
- `action VARCHAR(120) NOT NULL`;
- `entity_type VARCHAR(80) NOT NULL`;
- `entity_id UUID NULL`;
- `result VARCHAR(30) NOT NULL`;
- `correlation_id VARCHAR(120) NOT NULL`;
- `metadata JSONB NOT NULL DEFAULT '{}'`;
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`.

Indexes:

- `(actor_user_id, created_at)`;
- `(action, created_at)`;
- `(entity_type, entity_id)`;
- `(correlation_id)`.

## API Impact

No public API is added.

Internal server actions and route handlers may call a shared audit helper.

## UI/UX Impact

No new user-facing screen is planned in this slice.

Existing pages and actions shall behave the same from the user's perspective.

## Memory Impact

Memory actions shall write audit events using memory IDs and status changes only. Audit metadata shall not include memory title, content, normalized content, or extracted details.

Audit events shall not be used as memories and shall not affect memory retrieval.

## AI Behavior Impact

No AI behavior change is planned.

Audit events shall not be included in prompts.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- Manual database migration run by the user:
  - `node --env-file=.env .\node_modules\drizzle-kit\bin.cjs migrate`
- Manual browser checks:
  - grant/revoke a consent;
  - export data;
  - confirm/archive/delete a memory;
  - verify rows exist in `audit_events` without sensitive content.

## Implementation Tasks

- [x] Add `audit_events` Drizzle schema.
- [x] Export audit schema from `src/db/schema/index.ts`.
- [x] Create manual migration `0013_create_audit_events.sql`.
- [x] Register migration in `src/db/migrations/meta/_journal.json`.
- [x] Add audit helper.
- [x] Instrument consent actions.
- [x] Instrument data export.
- [x] Instrument memory actions.
- [x] Instrument account deletion completion.
- [x] Run typecheck, lint, and format checks.

## Documentation To Update

Update this feature spec if scope changes.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-25 | Initial draft | Define basic audit trail slice |
| 2026-06-25 | Implementation prepared | Schema, manual migration, audit helper, instrumentation, and checks completed; migration still pending manual application |
| 2026-06-25 | Marked implemented | Migration applied externally and real memory confirmation audit event verified |
