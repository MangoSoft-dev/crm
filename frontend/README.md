# Frontend - MangoSoft CRM

This directory contains the user interface source code, built for scalability using a modular, feature-by-feature approach.

## Core Tech Stack
- **Framework**: React.js (TypeScript)
- **UI Toolkit**: Ant Design (AntD) + Bootstrap (Grid & Utilities)
- **Styling Preprocessor**: SASS (SCSS) for global reusable styling
- **Data Fetching/Caching**: TanStack Query (React Query)
- **Routing**: React Router
- **Global State**: (e.g., Zustand - to be defined, though TanStack Query handles most remote state)

## Proposed Modular Folder Structure (Feature-Based)
To allow the project to grow feature by feature without rewriting code, we strictly separate global concerns from domain-specific features.

```text
src/
├── app/                  # App setup (Providers, Global Router setup, Global Styles)
├── assets/               # Static files (images, fonts)
├── styles/               # 🌟 GLOBAL SASS ARCHITECTURE
│   ├── _variables.scss   # Global Scss variables (Colors, sizes, breakpoints)
│   ├── _mixins.scss      # Reusable Scss mixins
│   ├── _base.scss        # Reset and base HTML styles
│   ├── _components.scss  # Global custom component styles extending AntD/Bootstrap
│   └── main.scss         # Main entry point that imports everything
├── components/           # Generic, globally shared UI components (e.g., Table, Button, Modal)
├── lib/                  # Library configurations (Axios instance, TanStack Query client, AntD Theme)
├── hooks/                # Global shared hooks (e.g., useWindowSize)
├── utils/                # Global utility functions (e.g., formatters)
├── features/             # 🌟 DOMAIN-BASED MODULES (The core of the architecture)
│   ├── auth/             # Example Feature: Authentication
│   │   ├── api/          # TanStack queries/mutations for auth (e.g., useLogin.ts)
│   │   ├── components/   # UI components specific to auth (e.g., LoginForm.tsx)
│   │   ├── types/        # TypeScript interfaces for auth
│   │   └── index.ts      # Public API of this feature (Exports only what other features need)
│   ├── users/            # Example Feature: User Management
│   │   ├── api/
│   │   ├── components/
│   │   └── types/
└── routes/               # Page-level components that compose features together
```

## Getting Started
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`

## Specific Frontend Documentation
Check the [`docs/`](./docs/) folder for detailed guidelines:
- [State Management & Data Fetching](docs/STATE_MANAGEMENT.md)
- [Routing Map](docs/ROUTING.md)
- [UI & Styling Conventions](docs/UI_CONVENTIONS.md)
