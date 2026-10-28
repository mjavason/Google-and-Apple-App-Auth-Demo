import dotenv from 'dotenv';

dotenv.config({
  path: './.env',
});

export const PORT = process.env.PORT || 5000;
export const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || '';
export const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL || '';
export const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
