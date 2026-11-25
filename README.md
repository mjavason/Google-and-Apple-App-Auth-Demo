# Google + Apple App Auth Demo

A full-stack Firebase authentication demo that combines an Expo React Native app, an Express/TypeScript API, and a browser sign-in page. The browser supports Google and Apple sign-in, exchanges the Firebase ID token for a short-lived code, and returns that code to the Expo app through its custom URL scheme.

## Repository layout

```text
app-auth-demo/
├── app/       Expo Router app and React Native login screen
├── api/       Express API with Firebase Admin and Swagger
├── frontend/  Google/Apple browser sign-in and callback page
└── README.md
```

## How it works

1. The Expo app generates an unpredictable `state` value and an `app://` redirect URI.
2. It opens `frontend/index.html` in a browser.
3. The browser page uses Firebase popup authentication for Google or Apple.
4. The page sends the Firebase ID token and `state` to `POST /auth/mobile/exchange`.
5. The API verifies the token and creates a one-time, 60-second authorization code.
6. The browser sends the code and `state` to the Expo app through the custom redirect URI.
7. The app validates the returned `state`, calls `POST /auth/mobile/redeem`, and displays the resolved Firebase user.

The one-time code is stored only in memory and is invalidated after the first redemption attempt.

## Prerequisites

- Node.js 18 or newer
- npm
- Expo CLI available through `npx`
- A Firebase project with Google and/or Apple Authentication enabled
- A Firebase web app
- A Firebase Admin service account
- Android Studio, Xcode, Expo Go, or another Expo-compatible runtime

## Firebase setup

Configure Google and Apple providers in Firebase Authentication. For Apple, also configure the Apple provider and any required Apple Developer credentials in the Firebase console.

The backend requires Firebase Admin credentials from `api/.env`. Keep private keys and service-account files out of source control.

## API setup

From the repository root:

```powershell
cd api
npm install
Copy-Item env.sample .env
npm run dev
```

Configure `api/.env`:

```env
PORT=5000
BASE_URL=http://localhost:5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

The private key must contain escaped `\n` sequences; `api/constants.ts` converts them to newline characters.

The API is available at `http://localhost:5000`, and Swagger UI is at `http://localhost:5000/docs`.

Useful API commands:

```text
npm run dev    Start with nodemon
npm run build  Compile TypeScript
npm run start  Run the compiled server
npm test       Run Jest tests
```

## Expo app setup

Create `app/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-web-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
EXPO_PUBLIC_FRONTEND_AUTH_URL=http://127.0.0.1:5500/frontend/index.html
```

On a physical device, `localhost` and `127.0.0.1` refer to the device itself. Use an address reachable from that device, and use HTTPS for remote deployments.

Install and start:

```powershell
cd app
npm install
npm start
```

Run a platform directly:

```text
npm run android
npm run ios
npm run web
```

The app entry point is [app/src/app/login.tsx](./app/src/app/login.tsx). Its custom redirect uses the `app` scheme configured in [app/app.json](./app/app.json).

## Browser callback setup

Serve `frontend/` over HTTP or HTTPS:

```powershell
cd frontend
python -m http.server 5500
```

Open or configure the callback URL as:

```text
http://127.0.0.1:5500/frontend/index.html
```

The browser page's Firebase configuration and API base URL are currently configured directly inside [frontend/index.html](./frontend/index.html). Update both values for your Firebase project and deployed backend.

`frontend/auth-test.html` is a simple redirect test and does not perform Firebase or API authentication.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/` | Health/status response |
| `GET` | `/api` | Demo request to `httpbin.org` |
| `POST` | `/firebase/sign-in` | Verify a Firebase ID token |
| `POST` | `/auth/mobile/exchange` | Exchange an ID token and state for a one-time code |
| `POST` | `/auth/mobile/redeem` | Redeem a code and return the Firebase user |

Example direct token verification:

```json
POST /firebase/sign-in

{
  "idToken": "<Firebase ID token>"
}
```

## Development notes

- Run the API and frontend callback page on origins reachable from the app/browser.
- Google and Apple popup sign-in require a browser environment.
- Register the Expo custom scheme and test deep links on both the emulator and physical device.
- This demo does not implement secure persistent sessions, refresh-token rotation, account linking, or multi-instance code storage.
- Do not publish Firebase Admin private keys or service-account JSON files.
