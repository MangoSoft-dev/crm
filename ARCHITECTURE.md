# System Architecture: MangoSoft CRM

This document describes the high-level architecture of the project.

## Functional Diagram
*The **Frontend** (React/SPA) communicates with the **Backend** (Express + GraphQL API) via HTTP requests.*

## Core Technologies
### Frontend
- **Framework/Library**: React.js / Vite
- **Language**: TypeScript
- **Styling**: Ant Design + Bootstrap (Grid/Utilities) + SASS (SCSS)

### Backend
- **Environment/Framework**: Node.js with Express 5
- **Language**: TypeScript
- **API Style**: GraphQL (using `@as-integrations/express5`)
- **Database**: PostgreSQL (Direct usage via `pg` driver with custom Singleton)
- **Authentication**: Passport.js (JWT and Header API Keys)

## Authentication Flow
The frontend sends credentials to the authentication server (`/api/auth`).
Upon success, the backend returns a JWT which is used in the `Authorization` header of every subsequent GraphQL request to the data server (`/api/data`).
Passport strategies (`jwtValidation` and `headerValidation`) handle the token verification on every private request.

## Deployment
(Briefly describe where the project is hosted: Vercel, AWS, DigitalOcean, Docker, etc.)
