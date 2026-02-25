# Backend - MangoSoft CRM

This directory contains the API and core business logic for the CRM.

## Core Tech Stack
- **Node.js** & **Express 5**
- **GraphQL** (`@as-integrations/express5`)
- **PostgreSQL** (via `pg`)
- **TypeScript**

## Prerequisites
- Node.js
- PostgreSQL running

## Setup & Configuration
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   Copy `.env.example` to `.env`. Critical variables include:
   - `DB_*` (PostgreSQL connection settings)
   - `SECRET_*` (JWT and API Key secrets)
   - `SMTP_*` (Sendinblue/Brevo configuration)
   - `GOOGLE_*` (Google Auth Client ID/Secret)

## Starting the Server
- **Development**: `npm run start` (Uses nodemon and `ts-node`)
- **Production**: `npm run prod`

## Specific Backend Documentation
Check the [`docs/`](./docs/) folder for detailed guidelines:
- [Code Conventions](docs/CONVENTIONS.md)
- [Database Schema](docs/DATABASE.md)
- [API Reference](docs/API_REFERENCE.md)
