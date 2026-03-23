'use client';

import type { FirebaseLikeAuth, FirebaseLikeUser } from './store';
import {
  getAuthCompat,
  onAuthStateChangedCompat,
  createUserWithEmailAndPasswordCompat,
  signInWithEmailAndPasswordCompat,
  signOutCompat,
  updateProfileCompat,
  signInAnonymouslyCompat,
} from './store';
import type { FirebaseApp } from './app';
import { getApp } from './app';

export type Auth = FirebaseLikeAuth;
export type User = FirebaseLikeUser;

export function getAuth(app?: FirebaseApp): Auth {
  return getAuthCompat(app ?? getApp());
}

export function onAuthStateChanged(
  auth: Auth,
  nextOrObserver: (user: User | null) => void,
  error?: (error: Error) => void
) {
  return onAuthStateChangedCompat(auth, nextOrObserver, error);
}

export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string) {
  return createUserWithEmailAndPasswordCompat(auth, email, password);
}

export function signInWithEmailAndPassword(auth: Auth, email: string, password: string) {
  return signInWithEmailAndPasswordCompat(auth, email, password);
}

export function signOut(auth: Auth) {
  return signOutCompat(auth);
}

export function updateProfile(user: User, updates: { displayName?: string }) {
  return updateProfileCompat(user, updates);
}

export function signInAnonymously(auth: Auth) {
  return signInAnonymouslyCompat(auth);
}

export type UserCredential = { user: User | null };
