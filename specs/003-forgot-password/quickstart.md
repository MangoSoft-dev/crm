# Quickstart: Forgot Password Screens

**Feature**: 003-forgot-password
**Date**: 2026-03-11

## Prerequisites

- Repository cloned and on branch `003-forgot-password`
- Node.js installed
- Backend running locally (or pointed to a working API via `VITE_API_BASE_URL`)

## Run the Frontend

```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:5173/login`.

## Manual Validation Flow

### Happy Path (US1)

1. Open `http://localhost:5173/login`
2. Click **"¿Olvidaste tu contraseña?"** link in the password field label
3. Verify you land on `http://localhost:5173/forgot-password`
4. Verify the page uses the same two-panel layout (hero left, form right)
5. Enter a valid registered email address (e.g. `test@example.com`)
6. Click **"Enviar contraseña temporal"** / **"Send Temporary Password"**
7. Verify the submit button shows a loading spinner while the request is in flight
8. Verify the form is replaced by a confirmation message ("¡Revisa tu correo!" / "Check your inbox!")
9. Click **"Volver al inicio de sesión"** / **"Back to login"**
10. Verify you return to `http://localhost:5173/login`

### Validation Errors (US1 — client-side)

1. Navigate to `http://localhost:5173/forgot-password`
2. Click submit without entering anything
3. Verify an inline error appears: "Por favor ingresa tu correo electrónico"
4. Enter `not-an-email`
5. Click submit
6. Verify an inline error appears: "Ingresa un correo electrónico válido"
7. Verify no network request was made (check browser DevTools Network tab)

### Error Path (US2)

1. Navigate to `http://localhost:5173/forgot-password`
2. Enter an email that triggers a backend error (or disconnect network)
3. Click submit
4. Verify an error Alert appears below the form header with an error message

### Already Authenticated Redirect

1. Log in normally via `http://localhost:5173/login`
2. Navigate directly to `http://localhost:5173/forgot-password`
3. Verify you are immediately redirected to `http://localhost:5173/dashboard`

## Run Unit Tests

```bash
cd frontend
npx jest src/features/auth/hooks/__tests__/useForgotPasswordForm.test.ts
```

Expected output: all tests pass (success path + error path).
