# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x (both frontend and backend)
**Primary Dependencies**: React 19, Ant Design 6, Express 5, GraphQL with @as-integrations/express5, Passport.js with JWT, PostgreSQL via pg driver
**Storage**: PostgreSQL database
**Testing**: Jest for both frontend and backend
**Target Platform**: Web application (browser-based)
**Project Type**: Web application
**Performance Goals**: 500ms response time for authentication endpoints
**Constraints**: Maximum 3 login attempts with lockout, OTP codes valid for 10 minutes, resend cooldown of 60 seconds, email-only delivery 
**Scale/Scope**: Support up to 1000 concurrent authenticated users with standard login flow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Compliance Analysis**

The proposed implementation for the Authentication OTP Login feature is compliant with the project's constitutional principles:

1. **Test-First (NON-NEGOTIABLE)** - All authentication endpoints will have unit and integration tests following TDD principles. Tests will be written before implementation.

2. **Integration Testing** - The authentication system requires integration with:
   - Database for user accounts, sessions and recovery requests
   - Email delivery service for OTP codes  
   - JWT token handling for session management
   - External services for password hashing

3. **Observability** - All endpoints will follow consistent logging patterns with request IDs and appropriate error messages.

4. **Simplicity** - The solution leverages existing technologies in the codebase (Express, GraphQL, Passport.js) and implements clean separation of concerns between different authentication flows.

5. **Versioning & Breaking Changes** - This feature extends existing system functionality without breaking changes to public interfaces, following semantic versioning principles.

All requirements have been satisfied and no violations were identified that would require justification.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
