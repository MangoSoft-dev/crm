# Data Model: Authentication Frontend Screens

## Entities

### 1. User
**Description**: System user with login credentials and authentication status

**Fields**:
- id (Integer): Unique identifier for the user
- username (String): Unique username for login
- email (String): User's email address
- password (String): Hashed password (not stored in frontend)
- account_id (Integer): Associated account identifier
- status (Integer): User status (1=active, -98=force change password)
- ip_restricted (String): IP restriction for login (optional)
- last_ip_connected (String): Last IP address used to connect
- login_attemps (Integer): Number of failed login attempts
- last_login_attemps (DateTime): Timestamp of last failed login attempt
- validate_otp (Boolean): Flag indicating if OTP verification is required
- google_id (String): Google OAuth identifier (optional)
- facebookId (String): Facebook OAuth identifier (optional)

**Validation Rules**:
- username and email must be unique
- email must follow valid email format
- password must be at least 8 characters long
- status must be one of: 1 (active), -98 (force change password)

### 2. Security Code
**Description**: Temporary code used for OTP verification or password recovery

**Fields**:
- id (String): Unique identifier for the security code
- user_id (Integer): Reference to the associated user
- entity (String): Type of security code ("LOGIN_OTP", "FORCE_CHANGE_PASSWORD")
- entity_id (String): Identifier for the specific security code request
- code (String): The actual security code value
- created_at (DateTime): Timestamp when code was generated
- expires_at (DateTime): Timestamp when code expires
- used (Boolean): Flag indicating if code has been used

**Validation Rules**:
- entity must be one of: "LOGIN_OTP", "FORCE_CHANGE_PASSWORD"
- code must be 6-digit numeric value for OTP codes
- code must be a valid UUID for password recovery codes
- expires_at must be after created_at
- entity_id must match the request identifier

### 3. Authentication Token
**Description**: JWT token used for secure session management

**Fields**:
- token (String): Main authentication token
- refreshToken (String): Refresh token for obtaining new access tokens
- expires_at (DateTime): Timestamp when token expires
- issued_at (DateTime): Timestamp when token was issued

**Validation Rules**:
- token must be a valid JWT format
- refreshToken must be a valid JWT format
- expires_at must be after issued_at
- Both tokens must be present for valid authentication session

## Relationships

### User ↔ Security Code
- One-to-many relationship
- A user can have multiple security codes generated over time
- Each security code is associated with one user

### User ↔ Authentication Token
- One-to-many relationship (for refresh tokens)
- A user can have multiple active sessions
- Each authentication token is associated with one user

## State Transitions

### User Status Flow
1. **Active (1)** → Normal login access
2. **Force Change Password (-98)** → User must change password before accessing system
3. **Inactive (0 or other)** → Login blocked

### Security Code Flow
1. **Generated** → Code created and stored in database
2. **Used** → Code validated and marked as used
3. **Expired** → Code automatically invalidated after expiration time

## Data Validation Rules

### Input Validation
- Email fields must pass email format validation
- Password fields must meet minimum length requirements (8 characters)
- OTP codes must be exactly 6 digits
- Security code entity types must match predefined values

### Business Logic Validation
- User status must be validated before login attempts
- Security codes must be validated for expiration and usage status
- Password recovery requests must validate email exists in system
- OTP verification must match the expected security code
