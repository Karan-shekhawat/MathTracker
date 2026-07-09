import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// ============================================================================
// 🔧 FIREBASE CONFIGURATION
// ============================================================================
// To set up your own Firebase project:
//   1. Go to https://console.firebase.google.com/
//   2. Create a new project called "MathTracker"
//   3. Go to Build → Firestore Database → Create database (test mode)
//   4. Go to Build → Authentication → Get started → Enable Google sign-in
//   5. Go to Project Settings → Add a web app → Copy the config below
//   6. Replace the placeholder values below with your actual config
// ============================================================================

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
