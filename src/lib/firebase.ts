'use client';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "studio-8345773297-1411a",
  appId: "1:106486969170:web:90b8bf4c29a369c0c5408b",
  storageBucket: "studio-8345773297-1411a.firebasestorage.app",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "studio-8345773297-1411a.firebaseapp.com",
  messagingSenderId: "106486969170"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Enable offline persistence
try {
    if (typeof window !== 'undefined') {
        enableIndexedDbPersistence(db);
    }
} catch (err: any) {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled
        // in one tab at a time.
        console.warn('Firestore offline persistence failed: multiple tabs open.');
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence
        console.warn('Firestore offline persistence is not supported in this browser.');
    }
}


export { app, db, auth };
