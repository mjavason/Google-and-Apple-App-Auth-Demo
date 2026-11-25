# API Auth Demo

This directory contains the backend for the Expo Google/Apple authentication demo. It verifies Firebase ID tokens, creates short-lived browser-to-mobile authorization codes, and exposes Swagger documentation.

## What it does

- Initializes Firebase Admin SDK with service-account credentials
- Verifies Firebase ID tokens with `adminAuth.verifyIdToken(...)`
- Exposes demo auth endpoints for sign-in and mobile callback exchange
- Redeems one-time authorization codes and loads the Firebase user
- Returns interactive API docs at `/docs`

## Project scripts

```bash
npm install
npm run dev
npm run build
npm run start
npm run test
```

## Environment configuration

This project expects an `.env` file in `api/` based on `env.sample`:

```env
PORT=5000
BASE_URL=http://localhost:5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

The private key must keep escaped newline characters so Firebase Admin can parse it correctly.

## Main endpoints

- `GET /` — health check / API status
- `GET /api` — calls a demo external API (`httpbin.org`)
- `POST /firebase/sign-in` — verifies an ID token and returns a user payload
- `POST /auth/mobile/exchange` — creates a short-lived auth code after validating a Firebase ID token
- `POST /auth/mobile/redeem` — validates the auth code and returns the authenticated Firebase user

Authorization codes expire after 60 seconds and are invalidated after a redemption attempt.

## Swagger docs

Once the server is running:

```text
http://localhost:5000/docs
```

## Notes

- `mobile-auth.store.ts` keeps codes in memory for demo purposes only.
- This backend is intentionally simple and not meant to be a full production auth service.
