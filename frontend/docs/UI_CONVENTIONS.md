# UI & Styling Conventions

To maintain a highly professional, consistent, and scalable UI, we strictly adhere to the following rules based on **Ant Design (AntD)**, **Bootstrap**, and **SASS (SCSS)**.

## Component Library (Ant Design)
- **Rule 1**: NEVER rebuild standard component logic (Modals, Selects, DatePickers) from scratch. Always use AntD.
- **Rule 2**: Customize AntD components via the central AntD Theme `ConfigProvider` when possible. For deep customizations, use our global SASS system to safely override AntD classes.

## Styling System (SASS + Bootstrap)
- **Bootstrap**: We use Bootstrap's Grid System (`container`, `row`, `col-*`) and its spacing utilities (`m-3`, `pb-2`, `d-flex`) for layout and structure. Do not use TailwindCSS.
- **SASS (SCSS)**: All custom styling must be done using SCSS.
  - No inline styles (`style={{ ... }}`).
  - Centralize variables (colors, fonts, breakpoints) in `src/styles/_variables.scss`.
  - Use SCSS mixins (`src/styles/_mixins.scss`) for repeated CSS patterns (e.g., shadows, animations, media queries).
  - Use modular SCSS (CSS Modules: `Component.module.scss`) for component-specific styles when they don't belong in the global stylesheet.

## Reusable Generic Components (`src/components/`)
If you build a generic UI block that wraps an AntD component (e.g., a `PageHeader` or a `ConfirmDeleteModal`) that has no domain business logic, place it in `src/components/`.

## Feature-Specific Components (`src/features/[name]/components/`)
If a component contains domain business logic (e.g., a `UserRoleSelect` that internally calls an API), it MUST go inside the specific feature folder, **not** in the global components folder.
