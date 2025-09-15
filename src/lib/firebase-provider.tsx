'use client';

import React, { PropsWithChildren, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './firebase';
import { useRouter } from 'next/navigation';
import { enableIndexedDbPersistence } from 'firebase/firestore';

export function FirebaseProvider({ children }: PropsWithChildren) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
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
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
    )
  }

  return <>{children}</>;
}
