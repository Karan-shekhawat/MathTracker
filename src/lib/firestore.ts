import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Topic, Question, PracticeSession, MockTest, ErrorBookItem, PastImport, AppState } from '../types';

// ============================================================================
// Firestore Helper Functions
// ============================================================================
// Data is stored under: users/{userId}/{collectionName}/{documentId}
// Each user gets their own isolated namespace.
// ============================================================================

// ---------- Full State Save / Load ----------

/**
 * Save the entire app state to Firestore.
 * Uses a batched write for atomicity.
 */
export async function saveFullState(userId: string, state: AppState): Promise<void> {
  // Save each collection. For simplicity and to avoid Firestore's
  // 500-write batch limit, we store each collection type as a single document.
  const userRef = doc(db, 'users', userId);

  const stateDoc = {
    topics: JSON.parse(JSON.stringify(state.topics)),
    questions: JSON.parse(JSON.stringify(state.questions)),
    practiceSessions: JSON.parse(JSON.stringify(state.practiceSessions)),
    mockTests: JSON.parse(JSON.stringify(state.mockTests)),
    errorBook: JSON.parse(JSON.stringify(state.errorBook)),
    pastImports: JSON.parse(JSON.stringify(state.pastImports || [])),
    theme: state.theme,
    lastUpdated: new Date().toISOString(),
  };

  await setDoc(userRef, stateDoc, { merge: true });
}

/**
 * Load the entire app state from Firestore.
 * Returns null if the user has no data yet.
 */
export async function loadFullState(userId: string): Promise<AppState | null> {
  const userRef = doc(db, 'users', userId);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  return {
    topics: data.topics || [],
    questions: data.questions || [],
    practiceSessions: data.practiceSessions || [],
    mockTests: data.mockTests || [],
    errorBook: data.errorBook || [],
    pastImports: data.pastImports || [],
    theme: data.theme || 'dark',
  };
}

/**
 * Delete all user data from Firestore.
 */
export async function deleteAllUserData(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);
}
