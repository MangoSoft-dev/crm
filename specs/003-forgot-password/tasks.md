---

description: "Task list for Forgot Password Screens implementation"
---

# Tasks: Forgot Password Screens

**Input**: Design documents from `/specs/003-forgot-password/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: Included — FR-011 explicitly requires unit tests for the recovery form hook.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story. All changes are confined to `frontend/src/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- Web app: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the `ForgotPasswordValues` type and i18n strings that all subsequent tasks
depend on. These tasks touch different files and can run in parallel.

- [x] T001 [P] Add `ForgotPasswordValues` interface to `frontend/src/features/auth/types/index.ts`
- [x] T002 [P] Add `forgotPassword` i18n key block to `frontend/src/features/auth/locales/es.json`
- [x] T003 [P] Add `forgotPassword` i18n key block to `frontend/src/features/auth/locales/en.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the GraphQL mutation hook that both user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until T004 is complete.

- [x] T004 Create `useRecoveryPasswordMutation` hook in `frontend/src/features/auth/api/useRecoveryPasswordMutation.ts` — mirrors `useLoginMutation.ts`, calls `recoveryPassword(email: String!)` mutation selecting `code` and `message` fields
- [x] T005 Export `useRecoveryPasswordMutation` from `frontend/src/features/auth/api/index.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Request Password Recovery (Priority: P1) 🎯 MVP

**Goal**: Complete happy path — user navigates from login to forgot-password screen, submits
email, sees success confirmation, and returns to login.

**Independent Test**: Navigate to `/forgot-password`, enter a valid email, submit — verify the
success confirmation panel is displayed and "Back to login" returns to `/login`.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T006 [P] [US1] Write unit test for `useForgotPasswordForm` success path in `frontend/src/features/auth/hooks/__tests__/useForgotPasswordForm.test.ts` — mock `useRecoveryPasswordMutation` to resolve successfully, assert `isSuccess` becomes `true` and `errorMessage` is `null`
- [x] T007 [P] [US1] Write unit test for `useForgotPasswordForm` loading state in `frontend/src/features/auth/hooks/__tests__/useForgotPasswordForm.test.ts` — assert `isLoading` is `true` while mutation is in flight and submit button receives disabled prop

### Implementation for User Story 1

- [x] T008 [US1] Create `useForgotPasswordForm` hook in `frontend/src/features/auth/hooks/useForgotPasswordForm.ts` — manages `errorMessage: string | null`, `isSuccess: boolean` local state; calls `useRecoveryPasswordMutation`; on success sets `isSuccess = true`; clears `errorMessage` on field change (depends on T004, T006, T007)
- [x] T009 [P] [US1] Create `ForgotPasswordForm.scss` in `frontend/src/features/auth/components/ForgotPasswordForm.scss` — reuse CSS class names and patterns from `LoginForm.scss` (`.login-form-wrapper`, `.login-header`, `.login-alert`, `.login-input`, `.login-submit-btn`); add `.forgot-success-panel` styles for confirmation view
- [x] T010 [US1] Create `ForgotPasswordForm.tsx` in `frontend/src/features/auth/components/ForgotPasswordForm.tsx` — renders email `Input` with `MailOutlined` prefix, Ant Design `Form` with email validation rules (required + email format), submit `Button` with loading state, and a success confirmation panel (replaces form when `isSuccess = true`) with "Back to login" `Link`; uses `useForgotPasswordForm` hook and `useTranslation('auth')` (depends on T001, T002, T003, T008, T009)
- [x] T011 [US1] Create `ForgotPasswordRoute.tsx` in `frontend/src/routes/auth/ForgotPasswordRoute.tsx` — mirrors `LoginRoute.tsx`; checks `isAuthenticated` from `useAuthStore`, redirects to `/` if already logged in, otherwise renders `<LoginLayout><ForgotPasswordForm /></LoginLayout>` (depends on T010)
- [x] T012 [US1] Add `/forgot-password` route to `frontend/src/App.tsx` — add `<Route path="/forgot-password" element={<ForgotPasswordRoute />} />` as a sibling of the existing `/login` route (depends on T011)
- [x] T013 [US1] Wire the "¿Olvidaste tu contraseña?" link in `frontend/src/features/auth/components/LoginForm.tsx` — replace the plain `<Link>` with a `<Link onClick={() => navigate('/forgot-password')}>` using `useNavigate` from React Router DOM (depends on T011)
- [x] T014 [P] [US1] Export `ForgotPasswordForm` from `frontend/src/features/auth/components/index.ts`
- [x] T015 [P] [US1] Export `useForgotPasswordForm` from `frontend/src/features/auth/hooks/index.ts`
- [x] T016 [P] [US1] Export `ForgotPasswordForm` and `useForgotPasswordForm` from `frontend/src/features/auth/index.ts` public API

**Checkpoint**: At this point, User Story 1 is fully functional and testable independently.
Run `npx jest src/features/auth/hooks/__tests__/useForgotPasswordForm.test.ts` — all tests pass.
Navigate `/login` → click forgot-password link → submit valid email → see confirmation.

---

## Phase 4: User Story 2 - Error Feedback for Failed Recovery (Priority: P2)

**Goal**: Handle backend errors and network failures with clear inline feedback that
dismisses when the user edits the email field.

**Independent Test**: Mock a failed mutation response in the test; verify the error `Alert`
appears with the error message. Manually: disconnect network or use an unregistered email
and verify the Ant Design Alert renders below the form header.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T017 [P] [US2] Write unit test for `useForgotPasswordForm` network error path in `frontend/src/features/auth/hooks/__tests__/useForgotPasswordForm.test.ts` — mock `useRecoveryPasswordMutation` to throw an error, assert `errorMessage` is populated and `isSuccess` remains `false`
- [x] T018 [P] [US2] Write unit test for error dismissal in `frontend/src/features/auth/hooks/__tests__/useForgotPasswordForm.test.ts` — after error is set, simulate `onFieldsChange` on the Ant Design Form, assert `errorMessage` resets to `null`

### Implementation for User Story 2

- [x] T019 [US2] Update `useForgotPasswordForm` in `frontend/src/features/auth/hooks/useForgotPasswordForm.ts` — add `catch` block in `handleSubmit` that sets `errorMessage` from the thrown error message or a fallback i18n key; add `handleFieldsChange` callback that calls `setErrorMessage(null)` (depends on T017, T018)
- [x] T020 [US2] Update `ForgotPasswordForm.tsx` in `frontend/src/features/auth/components/ForgotPasswordForm.tsx` — add `onFieldsChange` prop to `<Form>` wired to `handleFieldsChange`; ensure `{errorMessage && <Alert ... />}` block is already present from T010 (if not, add it now) (depends on T019)

**Checkpoint**: At this point, both User Stories 1 AND 2 are independently functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and consistency review.

- [x] T021 [P] Run `npm run build` in `frontend/` and confirm TypeScript compilation succeeds with zero errors
- [x] T022 [P] Run full test suite `npx jest src/features/auth/hooks/__tests__/useForgotPasswordForm.test.ts` and confirm all tests pass (success path, loading state, error path, error dismissal)
- [ ] T023 Run quickstart validation per `specs/003-forgot-password/quickstart.md` — complete all manual flow steps (happy path, validation errors, error path, authenticated redirect)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — all 3 tasks run in parallel immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001–T003) — blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (T004–T005)
- **User Story 2 (Phase 4)**: Depends on User Story 1 implementation (T008, T010)
- **Polish (Phase 5)**: Depends on all story phases complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational phase — no dependencies on US2
- **User Story 2 (P2)**: Extends `useForgotPasswordForm` and `ForgotPasswordForm` from US1 — implement after US1 checkpoint

### Within Each User Story

- Tests (T006, T007 / T017, T018) MUST be written and confirmed to FAIL before implementation
- Hook (T008 / T019) before component (T010 / T020) before route (T011)
- Route (T011) before App.tsx update (T012) and LoginForm wire-up (T013)
- Index exports (T014–T016) can run in parallel after their target file is created

### Parallel Opportunities

- T001, T002, T003 (Phase 1) — all parallel, different files
- T006, T007 (US1 tests) — parallel before T008
- T009 (SCSS) — parallel with T008 (different files)
- T014, T015, T016 (exports) — parallel after their dependencies
- T017, T018 (US2 tests) — parallel before T019
- T021, T022 (Polish) — parallel (build check vs test run)

---

## Parallel Example: User Story 1

```bash
# Run these in parallel (Phase 1 setup):
Task T001: Add ForgotPasswordValues to frontend/src/features/auth/types/index.ts
Task T002: Add es.json forgotPassword keys to frontend/src/features/auth/locales/es.json
Task T003: Add en.json forgotPassword keys to frontend/src/features/auth/locales/en.json

# Then Phase 2:
Task T004: Create useRecoveryPasswordMutation.ts
Task T005: Export from api/index.ts

# Then write tests together (US1):
Task T006: Write success path test
Task T007: Write loading state test

# Then implement hook + SCSS in parallel:
Task T008: Implement useForgotPasswordForm hook
Task T009: Create ForgotPasswordForm.scss

# Then component, route, wiring (sequential):
Task T010 → T011 → T012 + T013 (parallel)

# Then exports in parallel:
Task T014 + T015 + T016
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T005)
3. Complete Phase 3: User Story 1 (T006–T016)
4. **STOP and VALIDATE**: Full happy path works end-to-end per quickstart.md
5. Demo: Forgot-password flow functional

### Incremental Delivery

1. Setup + Foundational → GraphQL hook ready
2. User Story 1 → Full happy path with confirmation → MVP demo
3. User Story 2 → Error handling → Production-ready
4. Polish → TypeScript clean, tests green, quickstart validated

### Single Developer Strategy

Execute phases strictly sequentially. Within Phase 3, write tests first (T006, T007), then
implement hook and SCSS in parallel (T008, T009), then component (T010), route (T011),
App.tsx + LoginForm wire-up (T012, T013 — parallel), then exports (T014–T016 — parallel).

---

## Notes

- [P] tasks = different files, no dependencies between them
- [Story] label maps each task to its user story for traceability
- Tests marked with ⚠️ MUST be written and confirmed to FAIL before implementing the code they test
- `ForgotPasswordForm.scss` deliberately reuses CSS class names from `LoginForm.scss` to achieve visual consistency without duplicating SCSS variables
- `useMutationGraphQL` automatically routes to `/api/auth` when no JWT is present — no custom endpoint configuration required
