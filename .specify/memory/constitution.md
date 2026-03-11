<!--
SYNC IMPACT REPORT
==================
Version change: (blank template) → 1.0.0
Modified principles: N/A (initial ratification)
Added sections:
  - Core Principles (I–V)
  - Technology Stack
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ — Constitution Check section references this constitution
  - .specify/templates/spec-template.md ✅ — No updates required; sections align with principles
  - .specify/templates/tasks-template.md ✅ — Task phases align with principles; no structural change needed
Follow-up TODOs:
  - None — all placeholders resolved from CLAUDE.md
-->

# MangoSoft CRM Constitution

## Core Principles

### I. Multi-Tenant Isolation (NON-NEGOTIABLE)

Every database query that reads, writes, or deletes data MUST include a
`WHERE account_id = $N` filter using `identity.accountId` from the JWT.
No cross-tenant data leakage is acceptable under any circumstances.

- MUST use parameterized queries — no string interpolation of account IDs.
- `identity` is always the decoded JWT: `identity.id` (user), `identity.accountId` (tenant).
- Violation of this principle constitutes a critical security defect and MUST block any merge.

### II. Three-Layer Declarative GraphQL Architecture

Every new backend entity MUST be implemented as exactly three files:

1. **Schema** (`schemas/data/<entity>.graphql`) — SDL types, inputs, Query/Mutation extensions.
   Pagination shape: `{ items: [Type], rows: Int }`.
2. **Resolver** (`resolvers/data/<Entity>.ts`) — Declarative mapping objects
   `{ field, requestTemplate: { class, method }, type }`. Not traditional resolvers.
3. **Service** (`services/<Entity>.ts`) — Business logic class extending `ServiceBase`,
   registered in `services/index.ts`.

Adding layers, patterns, or abstractions beyond this three-file structure MUST be justified
in the plan's Complexity Tracking table.

### III. Mock-DB Test Discipline

Tests MUST inject a mock DB object into the service constructor. A real database MUST NOT
be used in unit tests.

- Mock pattern: `mockDb = { query: jest.fn(), getFirst: jest.fn(), execute: jest.fn() }`.
- One test file per service method: `src/test/<entity>/<methodName>.test.ts`.
- Every service method MUST have a `console.log(this.key, this.route, "methodName", args)`
  call at its start and a JSDoc block.

### IV. Soft Delete & Audit Trail

Data MUST never be permanently deleted via SQL `DELETE` statements.

- Reads MUST filter `WHERE deleted = 0`.
- Deletes MUST use `UPDATE ... SET deleted = 1, deleted_by = $N`.
- Every mutable entity MUST track `created_by`, `updated_by`, `deleted_by`.
- Throw `GraphQLError` with extensions for all errors. Raw PostgreSQL errors MUST NOT be
  exposed to clients.

### V. Frontend State Separation

Remote (server) state and client (UI) state MUST be managed through separate mechanisms.

- Remote state: TanStack Query hooks in `features/[name]/api/`. MUST NOT be stored in
  Zustand or global state.
- Client state: Zustand or React Context for UI-only concerns (sidebar, theme, etc.).
- Styling: Ant Design + Bootstrap grid/utilities + SCSS modules. Inline styles are PROHIBITED.
  Tailwind is PROHIBITED.
- Inter-feature imports MUST go through `features/[name]/index.ts` public API.

## Technology Stack

The following technology choices are fixed for this project. Deviations require an explicit
constitution amendment.

| Layer | Technology | Notes |
|---|---|---|
| Backend runtime | Node.js / Express 5 | TypeScript |
| GraphQL server | Apollo Server | Two endpoints: `/api/auth` (public), `/api/data` (JWT-required) |
| Database | PostgreSQL | Direct `pg` driver — no ORM |
| Auth | Passport.js | JWT + Header API Key strategies |
| Frontend framework | React (SPA) | TypeScript, Vite |
| Frontend state | TanStack Query + Zustand | See Principle V |
| UI library | Ant Design + Bootstrap | SCSS modules for custom styles |
| Testing | Jest | Backend unit tests with mock DB |
| Third-party integrations | Google APIs, SMTP/nodemailer | In `integrations/` directory |

## Development Workflow

- **Feature branches**: All work MUST be on a named feature branch; no direct commits to `main`.
- **Schema-first**: For any new entity, the `.graphql` schema file MUST be written and reviewed
  before the resolver or service is created.
- **Test before merge**: Every new service method MUST have a corresponding Jest test file.
  Tests MUST be written against a mock DB (see Principle III).
- **N+1 prevention**: Nested entity resolution for list queries MUST be resolved in bulk.
  Instantiate `new OtherService(this.db)` to share DB context; check `selectionSetList` before
  issuing additional queries.
- **Code review gate**: All PRs MUST verify compliance with Principles I–V before merging.
  A compliance checklist SHOULD be included in the PR description.

## Governance

This constitution supersedes all other development practices for MangoSoft CRM. When a
practice described elsewhere (wiki, README, verbal convention) conflicts with this document,
this document takes precedence.

**Amendment procedure**:
1. Open a PR with the proposed change to `.specify/memory/constitution.md`.
2. Describe the motivation and the impact on existing code.
3. Run `/speckit.constitution` to regenerate and validate the document.
4. Obtain at least one peer review before merging.
5. Update any affected templates or downstream artifacts noted in the Sync Impact Report.

**Versioning policy** (semantic):
- MAJOR: Removal or redefinition of a principle that breaks existing patterns.
- MINOR: New principle or section added; materially expanded guidance.
- PATCH: Clarifications, wording, or typo fixes with no semantic change.

**Compliance review**: Every sprint retrospective SHOULD include a brief review of any
unresolved constitution violations tracked in the project's issue tracker.

**Runtime guidance**: See `CLAUDE.md` at the repository root for agent-specific conventions
(naming, SQL patterns, directory layout) that complement but do not override this constitution.

---

**Version**: 1.0.0 | **Ratified**: 2026-03-11 | **Last Amended**: 2026-03-11
