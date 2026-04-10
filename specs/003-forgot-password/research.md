# Research: Forgot Password Screens

**Feature**: 003-forgot-password
**Date**: 2026-03-11

## Decision 1: GraphQL Endpoint Routing

**Decision**: Use the existing `useMutationGraphQL` hook from `frontend/src/hooks/useQueryTanstack.ts`
without modification.

**Rationale**: `performRequestWithRefresh` (line 89) already routes to `GRAPHQL_AUTH` when no
JWT token is present in the auth store (`const endpoint = token ? env.GRAPHQL_DATA : env.GRAPHQL_AUTH`).
Since the user is unauthenticated when on the forgot-password screen, the `recoveryPassword`
mutation will automatically be sent to `/api/auth` — the correct public endpoint. No new
HTTP client code is needed.

**Alternatives considered**: Creating a dedicated `useAuthMutation` helper that hardcodes the
auth endpoint. Rejected — unnecessary abstraction; the existing hook already handles this case
correctly.

---

## Decision 2: Form Component Architecture

**Decision**: Create `ForgotPasswordForm.tsx` following the exact same structure as the
existing `LoginForm.tsx`:
- A custom hook `useForgotPasswordForm.ts` (mirrors `useLoginForm.ts`)
- A mutation hook `useRecoveryPasswordMutation.ts` (mirrors `useLoginMutation.ts`)
- An SCSS module `ForgotPasswordForm.scss` (reuses existing CSS class names where possible)
- A route component `ForgotPasswordRoute.tsx` (mirrors `LoginRoute.tsx`)

**Rationale**: The codebase establishes a clear three-file pattern (route → form component →
hook → mutation hook) for auth screens. Deviating from this pattern would be inconsistent
and harder to maintain.

**Alternatives considered**: Merging the forgot-password form into `LoginForm.tsx` as a toggle.
Rejected — separate route is cleaner, easier to test independently, and matches the spec
requirement for a distinct screen.

---

## Decision 3: Success State Management

**Decision**: Manage the success/confirmed state in local React `useState` within
`useForgotPasswordForm.ts`. When the backend returns a success response, set a
`isSuccess: boolean` flag. The `ForgotPasswordForm` component renders either the form
or the confirmation panel based on this flag.

**Rationale**: Constitution Principle V prohibits storing remote state in Zustand. The
success state is ephemeral UI state tied to this screen's lifecycle — not cross-feature
shared state. Local hook state is the correct choice.

**Alternatives considered**: Storing success state in Zustand or in the route component.
Rejected — over-engineering; local state in the hook is sufficient for this use case.

---

## Decision 4: Success/Error Discrimination

**Decision**: A `CustomResponse` with `code` value `"SUCCESS"` (or any truthy code without
an error indication from the backend) signals success. Any non-success code or a thrown
GraphQL error signals failure. The frontend will treat all `CustomResponse` outcomes as
success unless the mutation itself throws (network error) or the `code` indicates failure.

**Rationale**: The `recoveryPassword` mutation always returns `CustomResponse`. There is no
`Authentication` union branch to check. The discriminator is whether `mutateAsync` throws or
returns normally. If it returns normally the user gets the confirmation message; if it throws
the error message is shown.

**Note**: The exact error codes returned by the backend are not specified in the schema. The
frontend should show the `message` field from `CustomResponse` on error, or a generic
fallback if `message` is empty. This matches how `useLoginForm.ts` handles the `CustomResponse`
branch.

**Alternatives considered**: Checking specific `code` values (e.g., `"USER_NOT_FOUND"`).
Rejected — codes are not documented in the schema; treating any non-thrown response as success
and any thrown error as failure is the safest and most consistent approach with existing patterns.

---

## Decision 5: Frontend Test Strategy

**Decision**: Place frontend hook tests at
`frontend/src/features/auth/hooks/__tests__/useForgotPasswordForm.test.ts`.
Mock `useMutationGraphQL` at the module level using `jest.mock()`. Test two paths:
(a) successful mutation call → `isSuccess: true`, (b) thrown error → `errorMessage` populated.
Use `@testing-library/react-hooks` (or equivalent) to render the hook in a test wrapper.

**Rationale**: The backend test convention (mock DB injected into service constructor) does
not apply to frontend hooks. The equivalent frontend pattern is mocking the TanStack Query
mutation hook. No existing frontend tests exist in the repo, so this establishes the pattern.

**Alternatives considered**: E2E tests with a real backend. Rejected — spec FR-011 explicitly
requires unit tests with mocked responses, consistent with the project's overall philosophy
of isolating units under test.

---

## Decision 6: i18n Namespace

**Decision**: Extend the existing `auth` namespace in both `es.json` and `en.json` by adding
a `forgotPassword` key block. Do not create a new namespace.

**Rationale**: The forgot-password feature is part of the auth domain. Using the existing
namespace keeps locale files consolidated and follows the pattern established by the `login`
key block.

**Alternatives considered**: Creating a separate `forgotPassword` namespace. Rejected —
unnecessary file proliferation for a small set of strings.
