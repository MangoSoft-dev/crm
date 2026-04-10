# Data Model: Forgot Password Screens

**Feature**: 003-forgot-password
**Date**: 2026-03-11

## Overview

This feature is **frontend-only**. The backend `recoveryPassword` mutation already exists and
is functional. No new database entities, migrations, or backend services are created.

The frontend interacts with a single existing GraphQL type (`CustomResponse`) and introduces
no new persistent data structures.

---

## GraphQL Types (existing — read-only reference)

### CustomResponse (existing)

```graphql
type CustomResponse {
  code: String
  message: String
  data: AWSJSON
}
```

Used as the return type of `recoveryPassword`. The frontend reads `code` and `message` to
determine success or failure feedback.

---

## Frontend State Model

### Hook State: `useForgotPasswordForm`

Manages ephemeral UI state for the forgot-password screen. All state lives in local React
`useState` — not persisted, not shared via Zustand.

| Field | Type | Initial Value | Description |
|---|---|---|---|
| `errorMessage` | `string \| null` | `null` | Error text shown in the Alert component |
| `isSuccess` | `boolean` | `false` | When `true`, renders confirmation panel instead of form |
| `isLoading` | `boolean` (from mutation) | `false` | Disables submit button while request is in flight |

### Form Values: `ForgotPasswordValues`

New TypeScript interface defined in `frontend/src/features/auth/types/index.ts`:

```typescript
export interface ForgotPasswordValues {
  email: string;
}
```

---

## Locale Strings (new keys to add)

### `auth` namespace — new `forgotPassword` block

| i18n Key | Spanish (es) | English (en) |
|---|---|---|
| `forgotPassword.title` | Recupera tu contraseña | Recover Your Password |
| `forgotPassword.subtitle` | Ingresa tu correo y te enviaremos una contraseña temporal. | Enter your email and we'll send you a temporary password. |
| `forgotPassword.emailLabel` | Correo Electrónico | Email Address |
| `forgotPassword.emailPlaceholder` | ejemplo@correo.com | example@email.com |
| `forgotPassword.requiredEmail` | Por favor ingresa tu correo electrónico | Please enter your email address |
| `forgotPassword.validEmail` | Ingresa un correo electrónico válido | Enter a valid email address |
| `forgotPassword.submit` | Enviar contraseña temporal | Send Temporary Password |
| `forgotPassword.submitting` | Enviando... | Sending... |
| `forgotPassword.successTitle` | ¡Revisa tu correo! | Check your inbox! |
| `forgotPassword.successMessage` | Te hemos enviado una contraseña temporal. Úsala para iniciar sesión y cámbiala de inmediato. | We've sent you a temporary password. Use it to log in and change it right away. |
| `forgotPassword.backToLogin` | Volver al inicio de sesión | Back to login |

---

## File Change Summary

| File | Action | Reason |
|---|---|---|
| `frontend/src/features/auth/api/useRecoveryPasswordMutation.ts` | Create | GraphQL mutation hook |
| `frontend/src/features/auth/hooks/useForgotPasswordForm.ts` | Create | Form logic hook |
| `frontend/src/features/auth/components/ForgotPasswordForm.tsx` | Create | Form UI component |
| `frontend/src/features/auth/components/ForgotPasswordForm.scss` | Create | SCSS styles (reuses patterns from LoginForm.scss) |
| `frontend/src/features/auth/components/index.ts` | Update | Export `ForgotPasswordForm` |
| `frontend/src/features/auth/hooks/index.ts` | Update | Export `useForgotPasswordForm` |
| `frontend/src/features/auth/index.ts` | Update | Export new public API items |
| `frontend/src/features/auth/types/index.ts` | Update | Add `ForgotPasswordValues` interface |
| `frontend/src/features/auth/locales/es.json` | Update | Add `forgotPassword` i18n keys |
| `frontend/src/features/auth/locales/en.json` | Update | Add `forgotPassword` i18n keys |
| `frontend/src/features/auth/components/LoginForm.tsx` | Update | Wire forgot-password link to `/forgot-password` route |
| `frontend/src/routes/auth/ForgotPasswordRoute.tsx` | Create | Route component (mirrors LoginRoute) |
| `frontend/src/App.tsx` | Update | Add `/forgot-password` route |
| `frontend/src/features/auth/hooks/__tests__/useForgotPasswordForm.test.ts` | Create | Unit tests (success + error paths) |
