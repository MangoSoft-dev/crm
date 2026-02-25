# Application Routing

This document provides a high-level map of the frontend application routes using React Router (or equivalent).

## Base Routes

### Public Routes
- `/login` -> Authentication page.
- `/forgot-password` -> Password recovery flux.

### Private Routes (Requires Auth Token)
All private routes are wrapped in a `<PrivateRoute>` or layout component that forces a redirect to `/login` if no user session is detected.

- `/` -> Main Dashboard.
- `/manage/accounts` -> Account management view.
- `/manage/users` -> User management branch (created recently).

## Layout Structure
The application uses a primary `MainLayout` for private pages containing a Sidebar and a Header.
- `<Sidebar />` navigation is determined by user role permissions.
- `<Content />` area mounts the nested routes (Using `<Outlet />`).

## Creating a New Route
When adding a new feature:
1. Create the page component inside `src/pages` or `src/routes/manage/featureName`.
2. Import it lazily (if it's a large component) into the main `App.tsx` or `router.tsx` file.
3. Define the path and attach it to the appropriate Layout group.
