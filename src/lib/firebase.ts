import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Default config from Firebase provisioning with env overrides
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDlulrmrfAyuW0RFK1ox1e1gTv9MqLYaOU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "turnkey-bucksaw-rt3g1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "turnkey-bucksaw-rt3g1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "turnkey-bucksaw-rt3g1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "360547318523",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:360547318523:web:6491c6a6836d9447070e5e",
};

const databaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "ai-studio-ff2712b3-f416-40ce-824c-28e2cda05b3a";

// Singleton Firebase initialization
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with specific database ID if designated
export const db: Firestore = databaseId && databaseId !== "(default)"
  ? getFirestore(app, databaseId)
  : getFirestore(app);

export { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  fbSignOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
};

export type { FirebaseUser };

/**
 * Safely retrieve the current user's Firebase ID token for authenticated server requests
 */
export async function getAuthToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  try {
    return await currentUser.getIdToken(false);
  } catch (error) {
    console.error("Failed to retrieve Firebase ID token:", error);
    return null;
  }
}
