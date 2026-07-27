# Feature Specification: Basic Data Export

## Feature Name

Basic data export.

## Status

Implemented.

## Owner

Project owner.

## Date

2026-06-21.

## Objective

Provide a basic structured JSON export for the authenticated user's MVP data.

The export shall support the user's right of access and portability at a lightweight MVP level, without adding a full request-management workflow yet.

## Problem / Context

The backlog requires exporting profile, conversations, sessions, memories, objectives, and consent records without including other users' data.

The current app has user profile, preferences, agents, conversations, messages, sessions, summaries, memories, commitments, credits, usage, safety events, audit events, and consent records. Goals and habits are not implemented yet, so they shall be represented as empty arrays or omitted with an explicit note.

## User Value

The user can download a readable snapshot of their data and understand what the application currently stores.

## Scope

- Add a JSON export route for the current authenticated user.
- Include existing user-owned MVP data:
  - account;
  - profile;
  - preferences;
  - agents;
  - conversations;
  - messages;
  - sessions;
  - session summaries;
  - memories;
  - commitments;
  - credit wallet and transactions;
  - usage events;
  - safety events;
  - audit events;
  - consent records.
- Include an `exportedAt` timestamp and export schema version.
- Filter every query by current `user_id`.
- Add a link or button from `/privacidad`.

## Out Of Scope

- Do not add CSV or Markdown export yet.
- Do not add asynchronous export jobs.
- Do not add email delivery.
- Do not implement account deletion in this slice.
- Do not export data belonging to other users.
- Do not include secrets, password hashes, provider keys, or internal environment values.
- Do not add a new audit table in this slice.

## Functional Requirements

- The export shall require an authenticated session.
- The export shall return `application/json`.
- The export shall set a download filename.
- The export shall include only data for the current user.
- The export shall exclude `password_hash`.
- The export shall include consent history.
- The export shall include minimized audit events for the authenticated user.
- The export shall include commitments when present.
- The export shall include empty arrays or an explicit note for not-yet-implemented goals and habits.

## Non-Functional Requirements

- The implementation shall be simple and synchronous for MVP-sized local data.
- The JSON structure shall be stable and versioned.
- Adding commitments to the export shall use `exportVersion = 2`.
- Typecheck, lint, and format checks shall remain clean.

## Acceptance Criteria

- `/privacidad/exportar` downloads or displays JSON for the current user.
- The JSON includes `exportVersion` and `exportedAt`.
- Commitment-aware exports use `exportVersion = 2`.
- The JSON includes profile, preferences, conversations, messages, sessions, summaries, memories, commitments, credits, usage, safety events, audit events, and consent records.
- The JSON does not include `password_hash`.
- `npm run privacy:check` protects the export path from adding password hashes, provider keys, internal environment values, or direct raw environment access.
- Every user-owned query filters by current user ID.
- `/privacidad` links to the export route.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format:check` passes.

## Error Cases

- If the user is not authenticated, the route shall redirect to `/login`.
- If a category has no records, the export shall include an empty array or null.
- If goals or habits are requested but not implemented, the export shall state that they are not implemented yet.

## Security And Privacy Considerations

The export contains personal data and conversation content. It shall only be available to the authenticated user and shall not be logged.

The route shall not include secrets, password hashes, API keys, or unrelated system settings.

## Data Model Impact

No schema change is planned.

## API Impact

Add an authenticated internal route at `/privacidad/exportar`.

## UI/UX Impact

Add a clear Spanish export action on `/privacidad`.

## Memory Impact

Confirmed and proposed memory records shall be included. No memory state shall be changed by export.

## AI Behavior Impact

No AI behavior changes are planned.

## Testing Plan

- `npm run typecheck`
- `npm run lint`
- `npm run privacy:check`
- `npm run format:check`
- Manual browser test:
  - open `/privacidad`;
  - click export;
  - confirm JSON downloads or renders;
  - confirm no `password_hash` appears.

## Implementation Tasks

- [x] Add data export helper.
- [x] Add `/privacidad/exportar` route.
- [x] Link export from `/privacidad`.
- [x] Include minimized audit events in the export.
- [x] Include commitments in the export.
- [x] Add a static privacy export guard for forbidden sensitive fields.
- [x] Run typecheck, lint, and format checks.

## Documentation To Update

Update this feature spec if scope changes.

No ADR or README update is expected.

## Open Questions

None.

## Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-06-21 | Initial draft | Start Phase 7.2 basic JSON data export |
| 2026-06-22 | Approved for implementation as authenticated JSON export | User approval |
| 2026-06-22 | Marked implemented after export helper, route, UI link, and checks passed | Implementation complete |
| 2026-07-27 | Added audit events to export | Align export with implemented audit trail |
| 2026-07-27 | Added commitments to export | Keep newly implemented user-owned data portable |
| 2026-07-27 | Bumped export version to 2 | Reflect the commitment-aware JSON shape |
| 2026-07-27 | Added privacy export guard | Prevent accidental export of password hashes, provider keys or internal configuration |
