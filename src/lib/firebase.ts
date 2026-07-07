import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDXlQ071YvKt1A_M2npOmI7iWLp4_XB008",
  authDomain: "catataja-83644.firebaseapp.com",
  projectId: "catataja-83644",
  storageBucket: "catataja-83644.firebasestorage.app",
  messagingSenderId: "172667304765",
  appId: "1:172667304765:web:aa93c1cbc5992c3bd5a354",
  measurementId: "G-PLK11FDK4B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with persistent cache to support offline mode out-of-the-box
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Firebase Auth sign-in with Google popup
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Firebase Auth sign-out
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to recursively remove undefined values so Firestore does not throw errors
const removeUndefined = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item));
  }
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        newObj[key] = removeUndefined(val);
      }
    }
    return newObj;
  }
  return obj;
};

// Save user data to Firestore with offline check
export const saveUserDataToCloud = async (userId: string, data: any) => {
  const path = `users/${userId}`;
  try {
    const sanitizedData = removeUndefined(data);
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      ...sanitizedData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log("Cloud sync successful");
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const isOffline = errMsg.toLowerCase().includes('offline') || 
                      errMsg.toLowerCase().includes('network') || 
                      errMsg.toLowerCase().includes('failed-precondition') ||
                      errMsg.toLowerCase().includes('unavailable');
    if (isOffline) {
      console.warn("Could not sync to cloud (offline):", errMsg);
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// Fetch user data from Firestore with offline resilience
export const fetchUserDataFromCloud = async (userId: string) => {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return { exists: true, data: userDocSnap.data() };
    }
    return { exists: false, data: null };
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const isOffline = errMsg.toLowerCase().includes('offline') || 
                      errMsg.toLowerCase().includes('network') || 
                      errMsg.toLowerCase().includes('failed-precondition') ||
                      errMsg.toLowerCase().includes('unavailable');
    if (isOffline) {
      console.warn("Firestore is offline, running with local data:", errMsg);
      return { exists: false, data: null, isOffline: true };
    }
    handleFirestoreError(error, OperationType.GET, path);
  }
};

// Update profile displayName in Firebase Auth
export const updateUserProfileName = async (name: string) => {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: name });
  }
};

