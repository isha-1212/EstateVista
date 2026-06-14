import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// IMPORTANT:
// Add your Firebase client config in a .env file (recommended) and restart the dev server.
// Example variables:
// VITE_FIREBASE_API_KEY
// VITE_FIREBASE_AUTH_DOMAIN
// VITE_FIREBASE_PROJECT_ID
// VITE_FIREBASE_APP_ID
// VITE_FIREBASE_STORAGE_BUCKET (optional)
// VITE_FIREBASE_MESSAGING_SENDER_ID (optional)

// Firebase client config (Web app)
// Uses VITE_FIREBASE_* values from .env.local. If you prefer hardcoding, update this file accordingly.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};


const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

const missing = requiredKeys.filter((k) => {
  const env = import.meta.env as Record<string, unknown>;
  const v = env[k];
  return v === undefined || v === null || String(v).trim().length === 0;
});


let app: ReturnType<typeof initializeApp> | undefined;
let auth: ReturnType<typeof getAuth> | undefined;

try {
  if (missing.length) {
    console.error(
      `[Firebase client] Missing env vars: ${missing.join(', ')}. ` +
        `Set these in a .env.local file and restart the dev server.`
    );
  } else {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
} catch (e) {
  console.error('[Firebase client] Failed to initialize Firebase:', e);
}

export { auth };


