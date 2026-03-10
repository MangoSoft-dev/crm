# Feature Specification: Security Screens — Login, Password Recovery & OTP Validation

**Feature Branch**: `001-auth-otp-login`
**Created**: 2026-03-08
**Status**: Draft
**Input**: User description: "Quiero crear las pantallas de seguridad para el proceso completo de inicio de sesión, olvido de contraseña y los pasos adicionales de validación via código OTP"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Standard Login (Priority: P1)

A registered user visits the CRM and provides their email and password to gain access. If their credentials are correct, they are authenticated and redirected to the main application. If credentials are wrong, they receive a clear error and, after 3 failed attempts, their access is temporarily blocked.

**Why this priority**: Login is the entry point to the entire application. Without it, no other feature is accessible. This is the foundational security screen.

**Independent Test**: Can be fully tested by navigating to the login page, entering valid/invalid credentials, and verifying redirection or error messages, delivering a secure authentication entry point.

**Acceptance Scenarios**:

1. **Given** a registered user with valid credentials, **When** they submit the login form with correct email and password, **Then** they are authenticated and redirected to the main CRM dashboard.
2. **Given** a registered user, **When** they submit incorrect credentials, **Then** they receive a clear, non-revealing error message (e.g., "Invalid email or password") and the attempt counter increments.
3. **Given** a user who has failed 3 consecutive login attempts, **When** they try to log in again, **Then** the system blocks further attempts and displays a lockout message explaining when or how to regain access.
4. **Given** a user on the login page, **When** they leave the email or password field empty and submit, **Then** the form highlights the missing fields with descriptive validation messages without submitting to the server.
5. **Given** a user with a valid session, **When** they navigate directly to the login page, **Then** they are automatically redirected to the main dashboard.

---

### User Story 2 - Forgot Password Request (Priority: P2)

A user who cannot remember their password selects "Forgot Password" from the login screen, provides their registered email address, and receives instructions to reset their password. The system confirms the request without revealing whether the email exists in the system.

**Why this priority**: Password recovery is essential to prevent permanent account lockout and reduce support burden. It is independent of the OTP validation step.

**Independent Test**: Can be fully tested by clicking "Forgot Password", entering an email, submitting the form, and verifying confirmation is shown — regardless of whether the email exists in the system.

**Acceptance Scenarios**:

1. **Given** a user on the forgot password screen, **When** they enter a registered email and submit, **Then** the system shows a generic confirmation message (e.g., "If this email is registered, you will receive instructions shortly") and sends a recovery email.
2. **Given** a user on the forgot password screen, **When** they enter an unregistered email and submit, **Then** the system shows the same generic confirmation message (no email enumeration).
3. **Given** a user on the forgot password screen, **When** they enter an invalid email format, **Then** the form shows an inline validation error before submission.
4. **Given** a user who submitted a forgot password request, **When** the recovery process is initiated, **Then** they can return to the login screen via a clear navigation link.

---

### User Story 3 - OTP Code Verification (Priority: P3)

After initiating a password recovery request, the user receives a one-time password (OTP) code via email. They are presented with a code entry screen where they enter the 6-digit code. If the code is valid and unexpired, they proceed to set a new password. If invalid or expired, they receive clear feedback and can request a new code.

**Why this priority**: OTP verification is the identity confirmation step in the recovery flow. It ensures only the legitimate account owner can reset the password.

**Independent Test**: Can be fully tested by navigating to the OTP entry screen with a valid recovery session, entering correct/incorrect codes, and verifying progression to password reset or appropriate error messages.

**Acceptance Scenarios**:

1. **Given** a user who requested password recovery, **When** they enter the correct 6-digit OTP code within the valid time window, **Then** they are directed to the new password creation screen.
2. **Given** a user on the OTP entry screen, **When** they enter an incorrect code, **Then** they see an error message and can try again (up to 3 attempts).
3. **Given** a user who has failed 3 OTP attempts, **When** they try again, **Then** the OTP session is invalidated and they are prompted to restart the password recovery process.
4. **Given** a user who received an OTP code, **When** the code expires (after 10 minutes), **Then** an entry attempt shows an expiry message and offers the option to request a new code.
5. **Given** a user on the OTP screen, **When** they click "Resend code", **Then** a new OTP is sent to their email, the previous code is invalidated, and a cooldown period (60 seconds) prevents immediate re-requests.
6. **Given** a user who completed OTP verification, **When** they set a new password and confirm it, **Then** the password is updated, the recovery session is invalidated, and they are redirected to the login screen with a success confirmation.

---

### User Story 4 - Email Validation for Unverified Accounts (Priority: P2)

A newly registered user who has not yet validated their email address attempts to log in with correct credentials. Because their account has an unverified status, the system does not grant access immediately — instead, it redirects them to the OTP verification screen. Once they enter the code sent to their registered email, their account is marked as validated and they are redirected to the main dashboard.

**Why this priority**: Email validation is a mandatory gate before first access. Without it, an unverified account (status -98) cannot operate in the system, making this a critical post-registration step tightly coupled to the login flow.

**Independent Test**: Can be fully tested by using a test account with status -98, attempting login with valid credentials, completing the OTP flow, and confirming the account status changes and dashboard access is granted.

**Acceptance Scenarios**:

1. **Given** a user with status -98 (email unverified), **When** they submit correct login credentials, **Then** they are NOT redirected to the dashboard — instead, the system sends an OTP to their registered email and redirects them to the OTP verification screen with a message explaining they must validate their email.
2. **Given** a user on the email validation OTP screen, **When** they enter the correct 6-digit code, **Then** their account status is updated to verified and they are redirected to the main CRM dashboard.
3. **Given** a user on the email validation OTP screen, **When** they enter an incorrect code, **Then** they see an error message and can try again (up to 3 attempts).
4. **Given** a user on the email validation OTP screen, **When** they fail 3 OTP attempts, **Then** the session is invalidated and they are redirected to the login screen with a message to contact support or retry.
5. **Given** a user on the email validation OTP screen, **When** they click "Resend code", **Then** a new OTP is sent and the 60-second cooldown applies.
6. **Given** a user with a verified account (status other than -98), **When** they log in with correct credentials, **Then** they go directly to the dashboard without any OTP step.

---

### Edge Cases

- What happens when a user submits the login form with a very long input string (e.g., 10,000 characters)?
- What happens when two simultaneous password reset requests are made for the same account?
- How is the OTP entry screen displayed if the user navigates directly to it without a valid session?
- What happens if the user's email account is not accessible and they cannot retrieve the OTP code?
- How does the lockout state reset — time-based, manual admin unlock, or both?
- What happens when a status -98 user's account is disabled or deleted between login and OTP submission?
- What happens when a status -98 user successfully validates their email but their session has expired in the meantime — do they need to log in again?
- Can a status -98 user use the "Forgot Password" flow, and if so, does completing it also validate their email?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a login screen with fields for email address and password, accessible without prior authentication.
- **FR-002**: The system MUST validate that both email and password fields are filled before submitting, with inline field-level error messages.
- **FR-003**: The system MUST block login access after 3 consecutive failed authentication attempts and display a lockout notice.
- **FR-004**: The system MUST display a "Forgot Password" link on the login screen that navigates to the password recovery request screen.
- **FR-005**: The system MUST allow users to request password recovery by submitting their email address.
- **FR-006**: The system MUST always respond to a forgot password submission with a generic confirmation message, regardless of whether the email is registered (preventing email enumeration).
- **FR-007**: The system MUST present a 6-digit OTP code entry screen as part of the password recovery flow.
- **FR-008**: The system MUST invalidate an OTP code after 10 minutes from generation.
- **FR-009**: The system MUST allow a maximum of 3 failed OTP entry attempts before invalidating the recovery session.
- **FR-010**: The system MUST provide a "Resend code" option on the OTP screen with a minimum 60-second cooldown between resend requests.
- **FR-011**: The system MUST display a new password creation form after successful OTP verification, requiring password confirmation.
- **FR-012**: The system MUST enforce password strength requirements (minimum 8 characters, at least one uppercase letter, one number, and one special character).
- **FR-013**: The system MUST invalidate the recovery session after a successful password reset and redirect the user to the login screen.
- **FR-014**: The system MUST provide a navigation link back to the login screen from the forgot password and OTP screens.
- **FR-015**: The system MUST detect when a successfully authenticated user has an unverified account status (status -98) and redirect them to the OTP email validation screen instead of the dashboard.
- **FR-016**: The system MUST send a new OTP to the user's registered email when they are redirected to the email validation screen due to status -98.
- **FR-017**: Upon successful OTP verification for a status -98 account, the system MUST update the account status to verified and grant access to the dashboard.
- **FR-018**: The system MUST display a clear message on the email validation OTP screen explaining why the code is required (e.g., "Please verify your email address to continue").

### Key Entities

- **Authentication Session**: Represents an active login session; attributes include user identity, creation time, expiration time, and originating IP address.
- **User Account**: Represents a registered user; relevant attributes include account status (-98 = email unverified, other values = active/valid states) and registered email address.
- **Recovery Request**: Represents a password reset attempt; attributes include associated account, requested time, OTP code (hashed), expiration time, attempt count, and completion status.
- **Email Validation Request**: Represents an email verification attempt for a status -98 account; attributes include associated account, OTP code (hashed), expiration time, and attempt count.
- **OTP Code**: A time-limited 6-digit numeric code; valid for a single use within its expiration window. Used in both password recovery and email validation flows.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the standard login process in under 30 seconds from page load to dashboard access.
- **SC-002**: Users can complete the full forgot password + OTP verification + new password flow in under 3 minutes.
- **SC-008**: Users with a status -98 account can complete email validation (OTP flow) and reach the dashboard in under 2 minutes from their first login attempt.
- **SC-003**: 95% of users successfully complete the login process on their first attempt when entering correct credentials.
- **SC-004**: The OTP entry screen clearly communicates the remaining time, reducing "expired code" support requests by providing proactive feedback.
- **SC-005**: Zero email enumeration vulnerabilities — automated security scans detect no difference in responses between registered and unregistered email submissions on the forgot password screen.
- **SC-006**: All screens are accessible via keyboard navigation and screen readers, meeting WCAG 2.1 AA compliance standards.
- **SC-007**: The lockout mechanism successfully prevents brute-force attacks, blocking access after exactly 3 failed attempts with no bypass.

## Assumptions

- OTP codes are delivered exclusively via email (no SMS/phone delivery in this phase).
- The backend already enforces a maximum of 3 login attempts (`LOGIN_MAX_ATTEMPTS=3`); the frontend reflects this constraint.
- Google/OAuth social login is out of scope for this feature, even though backend infrastructure may support it.
- Session management (token storage, expiration) is handled by existing backend mechanisms; this feature covers only the UI screens.
- OTP is used in exactly two flows: (1) password recovery and (2) email validation when user status is -98. No other login scenarios trigger OTP.
- The account status value -98 specifically means "email address not yet validated by the user". Other negative or positive status values are out of scope for this feature.
- The OTP screen for email validation (status -98) reuses the same OTP entry component as password recovery, with different contextual messaging.
- OTP expiration is set at 10 minutes as an industry-standard default for email-delivered codes.
- Resend cooldown is set at 60 seconds to prevent email flooding.
- Account lockout duration and reset mechanism (time-based vs. admin unlock) will be determined by backend configuration and is not displayed in the UI beyond a generic lockout message.
