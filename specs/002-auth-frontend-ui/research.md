# Research Findings: Authentication Frontend Screens

## Available GraphQL Mutations for Authentication Flows

The backend provides these key authentication mutations:
1. `login(username: String!, password: String!)` - Standard login with username/email and password
2. `loginOTP(id: String!, code: String!)` - OTP-based login using security code
3. `loginOTPResendCode(id: String!, code: String)` - Resend OTP code to user's email
4. `recoveryPassword(email: String!)` - Initiate password recovery process
5. `forceChangePassword(key: String!, newPassword: String!, code: String!)` - Force password change using security key and code
6. `refreshToken(token: String!)` - Refresh authentication token

## Authentication Store Structure and Integration

The existing authentication store is implemented with Zustand in `/frontend/src/features/auth/store/useAuthStore.ts`. It:
- Stores token, refreshToken, and isAuthenticated state
- Provides setLoginData() to save credentials after successful login
- Provides logout() to clear session and user data
- Integrates with the user store via `useUserStore.getState().clearUser()`

## Error Handling Patterns

Backend error handling follows GraphQL conventions using `GraphQLError`:
- Specific error codes like 'loginInvalid', 'loginMaxAttemps', 'loginInvalidIp', 'loginInvalidOtp', 'DB_NoAffectedRows'
- Extensions with detailed error information including messages and values
- Custom responses for flows like "LOGIN_FORCE_CHANGE_PASSWORD" and "LOGIN_VALIDATE_OTP"
- Error propagation through the GraphQL layer to frontend

## UI Components and Form Validation Patterns

The existing login form follows these patterns:
- Uses Ant Design components (Form, Input, Button, Typography)
- Implements form validation with Ant Design rules
- Uses `useLoginForm` hook for handling form submission and authentication flow
- Displays error messages using Ant Design Alert component
- Follows a consistent layout with title, subtitle, input fields, and submit button

## API Response Formats

### Password Recovery Flow (`recoveryPassword`)
- Returns `CustomResponse` with:
  - `code: 'ok'`
  - `message: "Check your email for the new password"`
  - `data: { email: "masked_email" }`

### OTP Verification Flow (`loginOTP`)
- Returns either:
  - `Authentication` object with token and refreshToken on success
  - `CustomResponse` with code "LOGIN_VALIDATE_OTP" when OTP is required

### Forced Password Change Flow (`forceChangePassword`)
- Returns `CustomResponse` with:
  - `code: 'ok'`
  - `message: "Password has been changed"`
  - Success confirmation after password update

## Integration with TanStack Query

The frontend uses a custom hook `useMutationGraphQL` in `/frontend/src/hooks/useQueryTanstack.ts` that:
- Handles token refresh automatically when needed
- Manages authentication headers for GraphQL requests
- Implements retry logic with logout on repeated failures
- Integrates with the existing auth store for token management

## Implementation Considerations

1. The OTP flows require security codes to be generated and validated using the `createSecurityCode` and `validateSecurityCode` methods in ServiceBase
2. Password recovery generates a temporary password and sends it via email (currently uses a mock implementation)
3. The forced change flow requires handling the "FORCE_CHANGE_PASSWORD" security code type
4. All authentication flows should integrate with the existing Zustand store for state management
5. Error messages from backend should be properly handled and displayed to users
