# App Auth Demo

This repository contains a small full-stack authentication demo built with an Expo React Native app and an Express API. The current implementation focuses on Google Sign-In, with the backend validating Firebase ID tokens before returning the authenticated user payload.

## Overview

- `app/` — Expo + React Native app using Firebase client SDK and Google Sign-In
- `api/` — Express API that verifies Firebase tokens and exposes Swagger docs
- Shared auth flow: Google sign-in → Firebase credential exchange → backend token verification

## Current implementation

The codebase currently includes:

- Google Sign-In flow in `app/src/features/auth/google-sign-in.ts`
- Firebase client setup in `app/src/lib/firebase.ts`
- API endpoint `POST /firebase/sign-in` in `api/app.ts`
- Firebase Admin verification in `api/firebase.config.ts`
- Swagger docs at `http://localhost:5000/docs`

Apple Sign-In is not implemented in the checked-in code yet, so the README reflects the Google-based authentication flow that is actually present.

## Project structure

```text
app-auth-demo/
├── README.md
├── app/
│   ├── src/
│   │   ├── app/
│   │   │   ├── index.tsx
│   │   │   └── login.tsx
│   │   ├── features/
│   │   │   └── auth/
│   │   │       └── google-sign-in.ts
│   │   └── lib/
│   │       ├── api.ts
│   │       ├── auth.api.ts
│   │       └── firebase.ts
│   ├── package.json
│   └── ...
├── api/
│   ├── app.ts
│   ├── constants.ts
│   ├── env.sample
│   ├── firebase.config.ts
│   ├── swagger.config.ts
│   ├── package.json
│   └── ...
└── .gitignore
```

## Prerequisites

- Node.js 18+
- npm
- A Firebase project with:
  - Web app config for Expo
  - Google Sign-In enabled
  - Firebase Admin service account credentials

## API setup

1. Install dependencies:

   ```bash
   cd api
   npm install
   ```

2. Create an environment file based on `api/env.sample`:

   ```bash
   cp api/env.sample api/.env
   ```

3. Fill in the values in `api/.env`:

   ```env
   PORT=5000
   BASE_URL=http://localhost:5000
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

   The private key must include escaped newlines as shown above so it can be loaded correctly by the app.

4. Start the API:

   ```bash
   cd api
   npm run dev
   ```

5. Open the Swagger docs:

   ```text
   http://localhost:5000/docs
   ```

## App setup

1. Install dependencies:

   ```bash
   cd app
   npm install
   ```

2. Add your client-side Firebase and API environment variables. The app expects `EXPO_PUBLIC_*` values in Expo environment files such as `.env.local` or `.env`.

   Example:

   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000
   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id
   ```

   You can find the Firebase web config values in the Firebase console under Project settings → Your apps → Web app configuration.

3. Start the Expo app:

   ```bash
   cd app
   npx expo start
   ```

   Then launch the app on an emulator, simulator, or Expo Go.

## Authentication flow

The current flow is:

1. User opens the login screen in `app/src/app/login.tsx`.
2. `googleLogin()` in `app/src/features/auth/google-sign-in.ts` calls Google Sign-In.
3. The app exchanges the Google ID token for a Firebase credential with `signInWithCredential(...)`.
4. The app sends the Firebase ID token to `POST /firebase/sign-in`.
5. The Express server verifies the token with `adminAuth.verifyIdToken(...)`.
6. The server returns the authenticated user data (`uid`, `email`, `name`, `photo`).

## API endpoints

### `GET /`
Returns the health status of the API.

### `GET /api`
Calls `https://httpbin.org` as a simple demo external API request.

### `POST /firebase/sign-in`
Accepts:

```json
{
  "idToken": "<Firebase ID token>"
}
```

Returns:

```json
{
  "success": true,
  "uid": "...",
  "email": "...",
  "name": "...",
  "photo": "..."
}
```

## Notes

- The app is structured as a mobile auth demo rather than a production-ready auth system.
- The backend is intentionally lightweight and is designed to validate Firebase-issued tokens.
- If you want to extend the project, the next natural steps would be adding user persistence, refresh token handling, and more providers.

