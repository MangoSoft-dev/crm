# Feature Specification: Forgot Password Screens

**Feature Branch**: `003-forgot-password`
**Created**: 2026-03-11
**Status**: Draft
**Input**: User description: "basado en el schema de autenticación existente, quiero hacer las pantallas de olvida tu contraseña basado en el mismo diseño que existe de login donde el proceso hace un llamado al método recoveryPassword que recibe una dirección de correo electrónico y envía un correo con un password temporal. se debe hacer pruebas y reusar las librerías existentes"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Request Password Recovery (Priority: P1)

A user who has forgotten their password navigates from the login screen to a "Forgot Password"
screen. They enter their registered email address and submit the form. The system sends them an
email containing a temporary password, and the user sees a confirmation message on screen
instructing them to check their inbox.

**Why this priority**: This is the sole primary user journey. Without this story, no value is
delivered.

**Independent Test**: Can be fully tested by clicking "¿Olvidaste tu contraseña?" on the login
screen, entering a valid email, submitting, and verifying a success confirmation is displayed.
Delivers self-service account recovery without support intervention.

**Acceptance Scenarios**:

1. **Given** the user is on the login screen, **When** they click "¿Olvidaste tu contraseña?",
   **Then** they are taken to the Forgot Password screen which visually matches the login
   screen layout (same two-panel hero + form design using the existing `LoginLayout`).
2. **Given** the user is on the Forgot Password screen, **When** they enter a valid email
   address and submit, **Then** the system shows a success confirmation message and the user
   is informed to check their inbox.
3. **Given** the user is on the Forgot Password screen, **When** they submit the form with an
   empty email field, **Then** an inline validation error appears and no request is sent.
4. **Given** the user is on the Forgot Password screen, **When** they submit the form with an
   invalid email format, **Then** an inline validation error appears and no request is sent.
5. **Given** the user sees the success confirmation, **When** they click "Back to login",
   **Then** they are returned to the login screen.

---

### User Story 2 - Error Feedback for Failed Recovery (Priority: P2)

A user submits the forgot-password form but the backend returns an error (e.g. email not found,
service unavailable). The screen displays a clear error message in the same style as the login
form errors. The user can correct their input and try again.

**Why this priority**: Proper error feedback is required for a production-ready feature but
depends on US1 being in place.

**Independent Test**: Can be tested by mocking a failed API response and verifying that an
error alert appears using the Ant Design Alert component, consistent with the login form
error pattern.

**Acceptance Scenarios**:

1. **Given** the user submits a valid-format email that triggers a backend error, **When** the
   response arrives, **Then** an error alert is displayed below the form header — matching the
   error display pattern of the existing login form.
2. **Given** an error is displayed, **When** the user modifies the email field, **Then** the
   error alert is dismissed.
3. **Given** the backend is unreachable, **When** the user submits, **Then** a network error
   message is displayed using the same error pattern.

---

### Edge Cases

- What happens when the user double-clicks the submit button?
  The submit button MUST be disabled while the request is in flight to prevent duplicate
  requests.
- What happens when the user navigates directly to the forgot-password URL while already
  authenticated?
  They MUST be redirected to the home screen.
- What happens when the user navigates back to login and then returns to the forgot-password
  screen? The form MUST be in its initial empty state (no leftover values or error messages).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a "Forgot Password" screen accessible via the existing
  "¿Olvidaste tu contraseña?" link on the login form.
- **FR-002**: The Forgot Password screen MUST reuse the existing `LoginLayout` component to
  maintain the same two-panel hero + form visual design.
- **FR-003**: The form MUST contain a single email input field styled consistently with the
  existing login form inputs (Ant Design `Input` with icon prefix).
- **FR-004**: The system MUST validate that the email field is not empty and has a valid email
  format before allowing submission.
- **FR-005**: On submission, the system MUST call the `recoveryPassword(email: String!)`
  GraphQL mutation on the public auth endpoint (no JWT required).
- **FR-006**: On a successful response, the system MUST display a confirmation message
  informing the user that a temporary password has been sent to their inbox.
- **FR-007**: On a failure response or network error, the system MUST display an error message
  using the same `Alert` component pattern already used in `LoginForm`.
- **FR-008**: The submit button MUST show a loading state while the request is in progress and
  MUST be disabled to prevent duplicate submissions.
- **FR-009**: The screen MUST include a "Back to login" navigation link that returns the user
  to the login screen.
- **FR-010**: All user-facing text MUST be defined in both Spanish (`es.json`) and English
  (`en.json`) locale files under the existing `auth` i18n namespace. No hardcoded string
  literals are permitted in component code.
- **FR-011**: The feature MUST include unit tests for the recovery form hook, covering both
  the success path (confirmation displayed) and the error path (error alert displayed),
  using mocked GraphQL responses consistent with the project's test conventions.

### Key Entities

- **RecoveryRequest**: A password recovery attempt initiated by a user. Key attribute: `email`
  (the registered address to which the temporary password is sent). Entirely handled by the
  backend; the frontend only submits the email and reacts to the response.
- **CustomResponse**: The existing GraphQL response type containing `code` and `message` fields
  used to signal success or failure to the UI (already defined in the auth schema and types).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can complete the full forgot-password flow (from clicking the link on the
  login screen to seeing the confirmation message) in under 60 seconds.
- **SC-002**: 100% of form submissions with invalid or empty email inputs are caught client-side
  before any network request is made.
- **SC-003**: The Forgot Password screen passes visual review as matching the existing login
  screen two-panel layout, with no new layout components introduced.
- **SC-004**: All new hook and mutation logic is covered by passing unit tests for both the
  success and error response paths.
- **SC-005**: All user-facing strings appear in both `es.json` and `en.json` with no
  hardcoded string literals in component or hook code.

## Assumptions

- The `recoveryPassword` mutation is already functional on the backend (confirmed from
  `backend/src/schemas/auth/Authentication.graphql`). No backend changes are required.
- The mutation always returns a `CustomResponse` (not `Authentication`), so the success/error
  discrimination is based on the response `code` field.
- The "¿Olvidaste tu contraseña?" link in `LoginForm` currently has no navigation wired up;
  this feature will wire it to a new `/forgot-password` route.
- A new route will be added to the existing React Router configuration.
- The temporary password is generated and emailed entirely by the backend; the frontend has
  no access to the password content.
