# Google + Apple App Auth Demo

This repository contains a small full-stack auth demo for a mobile application. The checked-in implementation uses an Expo React Native app and an Express backend to verify Firebase-issued user identities and exchange a mobile authorization code between the browser callback flow and the API.

## What is in this repo?

- `app/` — Expo app with a login screen, Firebase client setup, and the mobile auth callback flow
- `api/` — Express API with Firebase Admin verification and internal mobile auth code storage
- `frontend/` — a lightweight HTML callback page used to return from browser auth back to the app

This project is a demo, not a production auth system. It is intended to show one way to bridge a mobile app to a backend that verifies Firebase users and persists a short-lived auth code during browser callback handoff.

## Project structure

```text
app-auth-demo/
├── README.md
├── app/
│   ├── README.md
│   ├── package.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── index.tsx
│   │   │   ├── login.tsx
│   │   │   └── test.tsx
│   │   ├── common/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── ...
│   └── ...
├── api/
│   ├── README.md
│   ├── app.ts
│   ├── constants.ts
│   ├── env.sample
│   ├── firebase.config.ts
│   ├── mobile-auth.store.ts
│   ├── package.json
│   ├── swagger.config.ts
│   └── ...
├── frontend/
│   └── auth-test.html
└── .gitignore
```

## Prerequisites

- Node.js 18+
- npm
- A Firebase project with:
  - a web app config (for client-side Firebase initialization)
  - Firebase Authentication enabled
  - a Firebase Admin service account configured for backend verification
- A URL that can be opened from the app during the browser callback flow, such as the included `frontend/auth-test.html` served locally

## Backend setup

1. Install API dependencies:

   ```bash
   cd api
   npm install
   ```

2. Create an environment file from the sample:

   ```bash
   cp env.sample .env
   ```

3. Fill in your Firebase Admin values in `api/.env`:

   ```env
   PORT=5000
   BASE_URL=http://localhost:5000
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

   `FIREBASE_PRIVATE_KEY` must include escaped newlines so that the Admin SDK can read it correctly.

4. Start the API:

   ```bash
   cd api
   npm run dev
   ```

5. Open the Swagger docs:

   ```text
   http://localhost:5000/docs
   ```

## Mobile app setup

1. Install Expo app dependencies:

   ```bash
   cd app
   npm install
   ```

2. Add your Expo environment variables in `app/.env` or `.env.local`:

   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000
   EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-web-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
   EXPO_PUBLIC_FRONTEND_AUTH_URL=http://127.0.0.1:5500/frontend/auth-test.html
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id
   ```

   The `EXPO_PUBLIC_FRONTEND_AUTH_URL` value should point to the page the app opens during the auth callback flow. The repo includes a simple callback page at `frontend/auth-test.html`, which can be served locally.

3. Serve the callback page locally if you are using the included demo page:

   ```bash
   cd frontend
   python -m http.server 5500
   ```

4. Start the Expo app:

   ```bash
   cd app
   npx expo start
   ```

5. Launch the app in an emulator, simulator, or Expo Go.

## Authentication flow in this repo

The actual flow in this project is:

1. The app loads `app/src/app/login.tsx` and the user taps the Google button.
2. The app builds a redirect URL and opens a browser session to `FRONTEND_AUTH_URL` with a random `state` value.
3. The browser callback page returns to the app via the configured redirect URI.
4. The app validates the returned `code` and `state`, then calls:
   - `POST /auth/mobile/exchange` with the Firebase ID token and state
5. The API verifies the token with `adminAuth.verifyIdToken(...)` and creates a short-lived mobile auth code in `api/mobile-auth.store.ts`.
6. The app calls:
   - `POST /auth/mobile/redeem` with the returned code and state
7. The backend validates and redeems the code, then fetches the Firebase user from `adminAuth.getUser(uid)` and returns the user payload.

The app displays the resulting user information (`uid`, `email`, `name`, `photo`).

## API endpoints

### `GET /`
Returns the API status.

### `GET /api`
Calls `https://httpbin.org` as a simple demo external API request.

### `POST /firebase/sign-in`
Validates a Firebase ID token and returns the decoded user profile.

Request body:

```json
{
  "idToken": "<Firebase ID token>"
}
```

Response:

```json
{
  "success": true,
  "uid": "...",
  "email": "...",
  "name": "...",
  "photo": "..."
}
```

### `POST /auth/mobile/exchange`
Exchanges a Firebase ID token and state for a one-time mobile auth code.

### `POST /auth/mobile/redeem`
Validates and redeems the one-time code, returning the Firebase user profile.

### Swagger docs

```text
http://localhost:5000/docs
```

## Notes

- This is a demo implementation for learning and prototyping mobile auth patterns.
- The mobile auth code is kept in memory only and expires after a short TTL.
- The project does not include full production hardening such as refresh token rotation, secure storage, or account linking.
- Apple Sign-In is not implemented in the checked-in code yet; the current flow is centered on the browser-assisted mobile auth exchange described above.
