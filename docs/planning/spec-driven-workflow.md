# Lightweight Spec-Driven Development Workflow

This project uses a lightweight Spec-Driven Development and Context Engineering workflow. The goal is to keep implementation aligned with explicit requirements while avoiding heavy process.

## Purpose

The workflow shall make each non-trivial change traceable from requirement to implementation, review, and documentation update.

It shall help prevent unrelated changes, silent assumptions, stale context, and implementation based only on intuition.

## System Specs And Feature Specs

System specs describe stable project knowledge:

- architecture and stack decisions;
- product boundaries and conventions;
- data model and migrations;
- security, privacy, safety, and compliance rules;
- AI behavior, memory, and operational patterns.

Feature specs describe one specific change:

- objective and user value;
- scope and out-of-scope items;
- functional and non-functional requirements;
- acceptance criteria;
- data, API, UI, memory, AI, and testing impact;
- implementation tasks and documentation updates.

Feature specs shall not replace system specs. When a feature changes stable project knowledge, the relevant system spec or ADR shall be updated as part of the same approved work.

## Living Project Context

Project context is living context, not a one-time document.

Before editing, the implementer shall inspect the current relevant context: `AGENTS.md`, `README.md`, architecture docs, specs, planning docs, current schema, migrations, and existing implementation.

When implementation reveals that the approved spec is incomplete, ambiguous, or contradicted by the repository, work shall stop until the spec is clarified or updated.

## Workflow

### 1. Proposal

- Clarify the requested change.
- Create or update a feature spec when the change is non-trivial.
- Identify ambiguity, missing decisions, risks, and constraints.
- Define acceptance criteria before implementation.
- Validate the proposed scope with the user before implementation.

### 2. Apply

- Implement only the approved spec.
- Avoid unrelated files, abstractions, dependencies, schema changes, and documentation churn.
- Stop if a required decision is missing or if the spec conflicts with the current repository.
- After implementation changes, run the relevant checks, including `npm run typecheck`, `npm run lint`, and `npm run format:check` unless the user explicitly limits the task.

### 3. Review

- Compare the implementation against the feature spec, not intuition.
- Verify every acceptance criterion.
- Check that out-of-scope items were not introduced.
- Review error cases, security and privacy constraints, memory impact, AI behavior impact, and documentation updates.
- Identify whether human review or approval is required before continuing.

### 4. Archive

- Mark the feature spec as implemented or archived when the work is complete.
- Record material changes in the feature spec change log.
- Update system specs, ADRs, README, or planning docs only when project knowledge changed.
- Do not rewrite historical specs unless the approved change requires it.

## Review Contract

The active feature spec is the implementation and review contract.

A change should be considered incomplete when:

- an acceptance criterion is not demonstrably satisfied;
- an out-of-scope behavior was introduced;
- an error case is unhandled without explanation;
- safety, privacy, memory, or AI behavior constraints were weakened;
- required documentation updates were skipped.

## When To Stop

The implementer shall stop and ask for clarification when:

- the feature spec is missing for a non-trivial change;
- acceptance criteria are unclear;
- requirements conflict with existing architecture or safety specifications;
- implementation would require an unapproved migration, dependency, external service, or major scope expansion;
- a command produces an error or important warning that requires review.
