# Linear Budget

Bill tracking and budget management with recurring templates, multi-account support, and real-time sync.

**Live:** https://linear.thorshome.xyz

## Features

- Recurring bill and payday templates with flexible schedules (weekly, bi-weekly, semi-monthly, monthly, yearly, custom)
- Multi-account tracking with reorderable columns
- Per-period balance calculations (owed vs remaining)
- Year-to-date analytics with change detection
- Setup wizard for new users with backup restore
- JSON export/import for data backup
- Dark mode (default) with light mode option
- Email/password and Google authentication
- Real-time data sync via Firestore

## Tech Stack

React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, Firebase (Auth + Firestore)

## Getting Started

```bash
git clone https://github.com/dmcguire80/Linear-Budget.git
cd Linear-Budget
npm install
cp .env.example .env   # Fill in Firebase credentials
npm run dev
```

## Deployment

Push to `main` triggers CI (lint, type-check, format-check, build) and auto-deploys to Firebase Hosting.

Manual deploy: `npm run build && firebase deploy`

## License

MIT
