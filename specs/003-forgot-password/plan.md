# Implementation Plan: Forgot Password Screens

**Branch**: `003-forgot-password` | **Date**: 2026-03-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-forgot-password/spec.md`

## Summary

Add a "Forgot Password" screen to the React SPA that allows unauthenticated users to request
a temporary password via email. The screen reuses the existing `LoginLayout` two-panel design
and calls the already-functional `recoveryPassword(email: String!)` GraphQL mutation on the
public `/api/auth` endpoint. The feature introduces no backend changes — only new frontend
components, hooks, a route, and i18n strings following the patterns established by the
existing login feature.

## Technical Context

**Language/Version**: TypeScript 5 / React 18
**Primary Dependencies**: TanStack Query (useMutation), Ant Design 5, React Router DOM 6,
react-i18next, SCSS modules
**Storage**: N/A — frontend-only; backend handles temporary password generation and email
**Testing**: Jest + React Testing Library (frontend hook unit tests with mocked mutation)
**Target Platform**: Web browser (React SPA, Vite)
**Project Type**: Web application — frontend feature only
**Performance Goals**: Form submission feedback within 2 seconds under normal network conditions
**Constraints**: MUST reuse `LoginLayout`, `useMutationGraphQL`, and existing SCSS patterns.
No new layout abstractions. No inline styles.
**Scale/Scope**: 1 new route, 2 new components, 2 new hooks, 1 test file, locale updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Applies? | Status | Notes |
|---|---|---|---|
| I. Multi-Tenant Isolation | No | ✅ PASS | Public auth endpoint; no account_id filtering on frontend |
| II. Three-Layer GraphQL Architecture | No | ✅ PASS | No new backend entity; existing mutation consumed as-is |
| III. Mock-DB Test Discipline | Partial | ✅ PASS | Frontend equivalent: mock `useMutationGraphQL` via jest.mock() |
| IV. Soft Delete & Audit Trail | No | ✅ PASS | No new DB entities; frontend-only feature |
| V. Frontend State Separation | **Yes** | ✅ PASS | Success/error state in local hook useState; NOT stored in Zustand |

**Constitution Check Post-Design**: All gates pass. The design strictly follows Principle V:
mutation state via TanStack Query (`useMutationGraphQL`), ephemeral UI state (`isSuccess`,
`errorMessage`) in local hook state only. No Zustand usage for remote/form state.

## Project Structure

### Documentation (this feature)

```text
specs/003-forgot-password/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── graphql-mutations.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── App.tsx                                               (update: add /forgot-password route)
│   ├── routes/
│   │   └── auth/
│   │       ├── LoginRoute.tsx                               (no change)
│   │       └── ForgotPasswordRoute.tsx                      (new)
│   └── features/
│       └── auth/
│           ├── api/
│           │   ├── index.ts                                 (update: export new mutation hook)
│           │   ├── useLoginMutation.ts                      (no change)
│           │   └── useRecoveryPasswordMutation.ts           (new)
│           ├── components/
│           │   ├── index.ts                                 (update: export ForgotPasswordForm)
│           │   ├── LoginForm.tsx                            (update: wire forgot-password link)
│           │   ├── LoginForm.scss                           (no change)
│           │   ├── LoginLayout.tsx                          (no change)
│           │   ├── LoginLayout.scss                         (no change)
│           │   ├── ForgotPasswordForm.tsx                   (new)
│           │   └── ForgotPasswordForm.scss                  (new)
│           ├── hooks/
│           │   ├── index.ts                                 (update: export useForgotPasswordForm)
│           │   ├── useLoginForm.ts                          (no change)
│           │   ├── useForgotPasswordForm.ts                 (new)
│           │   └── __tests__/
│           │       └── useForgotPasswordForm.test.ts        (new)
│           ├── locales/
│           │   ├── en.json                                  (update: add forgotPassword keys)
│           │   └── es.json                                  (update: add forgotPassword keys)
│           ├── types/
│           │   └── index.ts                                 (update: add ForgotPasswordValues)
│           ├── store/
│           │   └── useAuthStore.ts                          (no change)
│           └── index.ts                                     (update: export new public API items)
```

**Structure Decision**: Web application — Option 2 structure (frontend/src). All changes are
confined to the `frontend/` tree within the existing `features/auth/` domain module.

## Complexity Tracking

> No constitution violations. No complexity justification required.
