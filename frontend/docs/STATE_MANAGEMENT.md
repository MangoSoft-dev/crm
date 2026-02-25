# State Management & Data Fetching

Because we use **TanStack Query (React Query)**, our state is strictly divided into two categories: **Remote State** (Server data) and **Client State** (UI data).

## 1. Remote State (TanStack Query)
**90% of your state** should live here.
- **Where it lives**: Inside `src/features/[featureName]/api/`.
- **How it works**: We create custom hooks that wrap `useQuery` or `useMutation`.
- **Example**: `useUsers()` fetches the users, caches them, and handles loading/error states automatically.
- **Rule of Thumb**: If the data comes from the backend API, it belongs in TanStack Query. DO NOT save API responses in global client state (like Redux or Zustand).

## 2. Client State (UI State)
This is for state that only exists in the browser and doesn't persist to the database (e.g., Is the sidebar open? What is the currently selected theme?).
- **Technology**: We use a lightweight tool like **Zustand** or simple **React Context**.
- **Rule of Thumb**: Keep global client state as small as possible. Use local component `useState` whenever the state doesn't need to be accessed by deeply nested, unrelated components.

## Cross-Feature Communication
If a component in the `users` feature needs data from the `auth` feature, it should import the TanStack Query hook exported from `src/features/auth/index.ts`. All inter-feature communication happens via the `index.ts` public APIs of each feature.
