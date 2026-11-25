# Expo App Auth Demo

This directory contains the Expo app for the repository's Firebase-based auth flow. It uses Expo Router, Expo AuthSession, and WebBrowser to exchange a browser-issued authorization code through the `app` custom scheme.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add the required environment variables in `.env` or `.env.local`:

   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000
   EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-web-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
   EXPO_PUBLIC_FRONTEND_AUTH_URL=http://127.0.0.1:5500/frontend/index.html
   ```

3. Start the app:

   ```bash
   npx expo start
   ```

4. Run it in an emulator, simulator, or Expo Go.

## App flow

- `src/app/login.tsx` renders the sign-in screen.
- The app opens `FRONTEND_AUTH_URL` with a generated `state` value and Expo redirect URI.
- The browser page signs in with Google or Apple through Firebase.
- The app validates the callback `state`, redeems the authorization code through the API, and displays the Firebase user.

## Useful scripts

```bash
npm start
npm run web
npm run android
npm run ios
npm run reset-project
npm run lint
```

## Notes

- This is a demo app intended for local development and testing.
- Make sure the callback URL is reachable while the app is running.
