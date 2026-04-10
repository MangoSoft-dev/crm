# GraphQL Contract: Forgot Password

**Feature**: 003-forgot-password
**Endpoint**: `/api/auth` (public — no JWT required)
**Date**: 2026-03-11

## Mutation: recoveryPassword

This mutation already exists in the backend. The frontend consumes it without modification.

### Schema (existing — `backend/src/schemas/auth/Authentication.graphql`)

```graphql
type Mutation {
  recoveryPassword(email: String!): CustomResponse
}

type CustomResponse {
  code: String
  message: String
  data: AWSJSON
}
```

### Frontend GraphQL Document

```graphql
mutation RecoveryPassword($email: String!) {
  recoveryPassword(email: $email) {
    code
    message
  }
}
```

### Variables

| Variable | Type | Required | Description |
|---|---|---|---|
| `email` | `String` | Yes | Registered email address of the user requesting recovery |

### Response: Success

```json
{
  "data": {
    "recoveryPassword": {
      "code": "SUCCESS",
      "message": "A temporary password has been sent to your email."
    }
  }
}
```

**Frontend behavior**: Display confirmation panel. `isSuccess` state set to `true`.

### Response: User Not Found / Other Error

```json
{
  "data": {
    "recoveryPassword": {
      "code": "USER_NOT_FOUND",
      "message": "No account found with that email address."
    }
  }
}
```

**Frontend behavior**: Since `useMutationGraphQL` throws on `result.errors` (GraphQL protocol
errors), and a backend-level logical error is returned as a normal `CustomResponse`, the
frontend distinguishes these cases by checking if `mutateAsync` throws:
- **Throws** (network/GraphQL error): Show generic network error in Alert.
- **Returns normally** with any response: Show success confirmation.

> Note: If the backend returns a `CustomResponse` with an error code (not a thrown GraphQL
> error), the current agreed approach (per research Decision 4) treats it as success to avoid
> user enumeration. If the backend evolves to throw GraphQL errors for invalid emails, the
> frontend error path already handles it.

### Authentication

None required. The request is sent to `/api/auth` with the API key header (`x-api-key`)
automatically by `performRequestWithRefresh` when no JWT token is in the auth store.
