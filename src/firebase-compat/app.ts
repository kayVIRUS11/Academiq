'use client';

import { getSupabaseClient } from '@/supabase/client';
import { getAppCompat, getAppsCompat, initializeAppCompat, type FirebaseLikeApp } from './store';

export type FirebaseApp = FirebaseLikeApp;
export type FirebaseOptions = Record<string, unknown>;

export function initializeApp(_options?: FirebaseOptions): FirebaseApp {
  return initializeAppCompat(getSupabaseClient());
}

export function getApps(): FirebaseApp[] {
  return getAppsCompat();
}

export function getApp(): FirebaseApp {
  return getAppCompat();
}

