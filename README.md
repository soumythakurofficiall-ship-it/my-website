# StreakRank — Firebase Production MVP

Production-ready Phase 1 web app for Indian Gen-Z students:
- Real authentication (Signup/Login/Logout) via Firebase Auth
- Real data storage via Firestore
- Dynamic XP, level, streak, progress tracking
- Real-time leaderboard and social proof metrics
- Mobile-first glassmorphism UI

## Project Structure

- `public/index.html` — Main app UI
- `public/css/styles.css` — Styles (mobile-first, optimized)
- `public/js/app.js` — App logic (auth, Firestore, UI rendering)
- `public/js/firebase-config.js` — Firebase config (replace values)
- `public/js/firebase-config.example.js` — Config template
- `firestore.rules` — Security rules
- `firestore.indexes.json` — Firestore indexes
- `firebase.json` — Firebase hosting config

## Setup

1. Create a Firebase project.
2. Enable **Authentication > Email/Password**.
3. Create Firestore database in production mode.
4. Copy `public/js/firebase-config.example.js` to `public/js/firebase-config.js` and fill your values.
5. Deploy Firestore rules/indexes:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```
6. Run locally:
   ```bash
   cd public
   python3 -m http.server 4173
   ```
7. Open `http://127.0.0.1:4173`.

## Deployment

Deploy hosting:
```bash
firebase deploy --only hosting
```

## Security Notes

- Firestore rules allow authenticated reads and owner-only writes for user documents.
- Session writes are owner-scoped (`users/{uid}/sessions`).
- Client-side validation + Firebase auth/rules enforce integrity.
- Keep production config injection in CI/CD for stricter secret hygiene.

## Legacy Plan

The original strategy and roadmap from the planning phase has been superseded by this implementation-focused README in this revision.
