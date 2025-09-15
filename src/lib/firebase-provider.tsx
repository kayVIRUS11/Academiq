'use client';

import React, { PropsWithChildren } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { useRouter } from 'next/navigation';

export function FirebaseProvider({ children }: PropsWithChildren) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
    )
  }

  if (!user) {
    // To be implemented: redirect to login if not on a public page
  }

  return <>{children}</>;
}
