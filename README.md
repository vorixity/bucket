# Bucket

Bucket is a premium personal travel atlas web app.

## Product direction

Bucket helps people mark places they have been, save places they want to go, research destinations, filter a personal atlas, upload trip photos, track travel stats, and request recommendations.

## Current stack

- React
- TypeScript
- Vite
- Tailwind CSS
- localStorage persistence
- mock place data

## Product principles

1. The map belongs to the user.
2. Nothing appears unless the user chooses to show it.
3. Recommendations are requested, not forced.
4. Bucket is not Google Maps.
5. Bucket is a personal atlas.
6. The app should feel useful, quiet, and premium.
7. Travel memories should feel personal, not performative.

## Included in the current web v1

- first-launch onboarding
- fake-map atlas with filters, presets, and saved views
- search across 100 mock places
- place detail and research experiences
- required-photo visit capture flow
- Bucket, Explore, Passport, and Profile tabs
- local persistence for visits, notes, favorites, custom lists, settings, and recommendation preferences
- rule-based recommendations
- responsive premium dark UI

## Run commands

```bash
npm install
npm run dev
npm run build
```

## Hosting direction

For a future Google-hosted version, Firebase Hosting is the simplest fit while Bucket remains a frontend-only app. When Bucket gains accounts, server-side data, and richer backend workflows, move toward Firebase App Hosting or another Google Cloud-backed architecture.

## Future production work

- real authentication
- real database and cloud photo storage
- real map provider integration
- place ingestion/admin tools
- backend-powered recommendations
- privacy, moderation, and legal policies
- mobile app packaging and app-store release work

## Current status

Bucket is now being developed independently of Lovable, with cloud CI validating every change.
