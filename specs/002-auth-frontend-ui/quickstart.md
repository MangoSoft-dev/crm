# Quickstart: Authentication Frontend Implementation

## Overview

This document provides a quickstart guide for implementing the authentication frontend screens in the MangoSoft CRM application. The implementation includes login, password recovery, OTP verification, and forced password change flows.

## Prerequisites

Before starting implementation, ensure you have:

1. Node.js and npm installed
2. Access to the MangoSoft CRM codebase
3. Development environment configured with Vite and React 19
4. Existing authentication store and hooks in place
5. TanStack Query integration working properly

## Implementation Steps

### 1. Component Structure

Create the following components in `/frontend/src/features/auth/components/`:

- `PasswordRecoveryForm.tsx`
- `OTPVerificationForm.tsx` 
- `ForceChangePasswordForm.tsx`

### 2. Hook Integration

Implement new hooks in `/frontend/src/features/auth/hooks/`:

- `usePasswordRecovery.ts`
- `useOTPVerification.ts`
- `useForceChangePassword.ts`

### 3. API Integration

Create GraphQL mutation hooks in `/frontend/src/features/auth/api/`:

- `usePasswordRecoveryMutation.ts`
- `useOTPVerificationMutation.ts`
- `useForceChangePasswordMutation.ts`

### 4. Route Configuration

Add new routes in `/frontend/src/features/auth/routes/`:

- `PasswordRecoveryRoute.tsx`
- `OTPVerificationRoute.tsx`
- `ForceChangePasswordRoute.tsx`

### 5. Internationalization

Update translation files in `/frontend/src/features/auth/locales/` to include:
- Password recovery form labels and messages
- OTP verification form labels and messages  
- Forced password change form labels and messages

## Key Implementation Details

### Form Validation
All forms should follow existing Ant Design patterns with:
- Required field validation
- Email format validation for email fields
- Password strength requirements
- Matching confirmation fields where applicable

### Error Handling
Implement proper error handling for:
- Network timeouts
- Invalid credentials
- Expired security codes
- Backend API errors
- User-friendly error messages

### State Management
Integrate with existing authentication store:
- Use `useAuthStore` for token management
- Update user state after successful authentication
- Clear session on logout

## Testing Approach

1. Unit tests for each component
2. Integration tests for form submission flows
3. End-to-end tests for complete authentication journeys
4. Mock backend responses for testing error scenarios

## Running the Implementation

After implementation:

1. Run `npm run dev` to start development server
2. Navigate to `/login` to test login flow
3. Navigate to `/recover-password` to test password recovery
4. Test OTP verification and forced password change flows

## Troubleshooting

### Common Issues
- Authentication tokens not persisting: Check Zustand store integration
- Forms not validating properly: Verify Ant Design component usage
- API calls failing: Confirm GraphQL endpoint configuration
- Translation issues: Validate i18next setup

### Debugging Tips
- Use browser developer tools to inspect network requests
- Check console for error messages
- Verify token handling in authentication store
- Test each flow independently before integration
