# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Type-check (tsc -b) then build for production
npm run preview      # Preview production build locally
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format all src files
npm run format:check # Prettier check without writing
npm run type-check   # TypeScript check only (tsc --noEmit)
```

No test framework is configured.

## Firebase Deployment

```bash
firebase deploy                  # Deploy hosting + Firestore rules
firebase deploy --only hosting   # Deploy hosting only
firebase deploy --only firestore # Deploy Firestore rules/indexes only
```

**Live URLs:**

- Production: https://linear.thorshome.xyz (custom domain)
- Default: https://linear-budgeting.web.app

**Config files:** `firebase.json` (hosting + firestore), `.firebaserc` (project alias), `firestore.rules`

Pushing to `main` triggers GitHub Actions CI which automatically builds and deploys to Firebase. Manual `firebase deploy` is only needed for out-of-band changes.

**Required GitHub Secrets:** `FIREBASE_SERVICE_ACCOUNT`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`

## Environment Setup

Copy `.env.example` to `.env` and fill in Firebase credentials. All env vars use the `VITE_` prefix and are accessed via `import.meta.env.VITE_*`.

## Architecture

**Stack:** React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4 + Firebase (Auth + Firestore)

**State management:** Two React Contexts — `AuthContext` (Firebase auth state, login/signup/logout/Google sign-in/password reset/account deletion) and `DataContext` (entries, accounts, templates, payday templates CRUD with real-time Firestore `onSnapshot` listeners). No external state library. Access via `useAuth()` and `useData()` hooks.

**Routing:** React Router v7 with `BrowserRouter` in `main.tsx`, `Routes` in `App.tsx`. All routes except `/login`, `/signup`, `/forgot-password` are wrapped in `ProtectedRoute` which checks auth state. Pages render inside `Layout` (gradient header + nav + dark mode toggle).

**Firestore data model (subcollections):**

- `users/{userId}/accounts/{accountId}` — name, order
- `users/{userId}/entries/{entryId}` — type (bill/payday), date, month, name, amounts/balances, paid, templateId
- `users/{userId}/templates/{templateId}` — bill template with recurrence, amounts, autoGenerate
- `users/{userId}/paydayTemplates/{id}` — payday template with recurrence, balances
- Security rules enforce `request.auth.uid == userId` for all reads/writes
- Document IDs are Firestore-generated (used directly as `id`)

**Key directories:**

- `src/pages/` — route-level components (Dashboard inline in App.tsx, Analytics, ManageBills, ManagePaydays, ManageAccounts, DataManagement, Settings\*, Login, Signup, ForgotPassword)
- `src/components/` — shared components (Layout, ProtectedRoute, SettingsLayout, BillTable, BillForm, PaydayForm, Popover, SetupWizard)
- `src/context/` — AuthContext and DataContext providers
- `src/hooks/` — useCalculations (bill/payday period grouping and balance calculations)
- `src/utils/` — uuid, format (currency), generator (entry generation from templates), billAnalytics (YTD tracking)
- `src/types/index.ts` — shared TypeScript interfaces
- `src/config/firebase.ts` — Firebase app initialization
- `src/data/initialData.ts` — empty initial data array

**Path alias:** `@/*` maps to `src/*` (configured in tsconfig and vite).

## Code Patterns

- Firestore subcollections: all data under `users/{userId}/` — no `userId` field in documents
- Firestore batch writes (`writeBatch()`) for multi-document operations (import, reorder, delete all)
- `useMemo`/`useCallback` for expensive calculations and context operations
- Dark mode via CSS variables on `document.documentElement.classList`, persisted in localStorage, defaults to dark
- Template-based entry generation: bill/payday templates auto-generate entries for the current year
- Entry sync on template changes: adds missing entries, removes unpaid entries on template deletion

## Formatting & Style

- Prettier: single quotes, semicolons, 2-space indent, trailing commas (es5), 100 char print width
- ESLint 9 flat config with TypeScript, React, React Hooks, and React Refresh plugins
- TypeScript strict mode with `noUnusedLocals` and `noUnusedParameters` enabled
