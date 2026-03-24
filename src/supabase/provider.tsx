'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { type SupabaseClient, type User } from '@supabase/supabase-js';
import { tryGetSupabaseClient } from './client';

export interface SupabaseContextState {
  supabase: SupabaseClient | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const SupabaseContext = createContext<SupabaseContextState | undefined>(undefined);

export const SupabaseProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  const supabase = useMemo(() => tryGetSupabaseClient(), []);

  useEffect(() => {
    if (!supabase) {
      setUserError(new Error("Supabase client not initialized."));
      setIsUserLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setUserError(error);
      } else {
        setUser(session?.user ?? null);
      }
      setIsUserLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsUserLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const contextValue = useMemo(() => ({
    supabase,
    user,
    isUserLoading,
    userError,
  }), [supabase, user, isUserLoading, userError]);

  return <SupabaseContext.Provider value={contextValue}>{children}</SupabaseContext.Provider>;
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider.');
  }
  return {
    supabase: context.supabase!,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

export const useUser = () => {
  const { user, isUserLoading, userError } = useSupabase();
  return { user, isUserLoading, userError };
};

export const useAuth = () => {
  const { supabase, user } = useSupabase();
  return { user, supabase };
};

export const useFirestore = () => {
  const { supabase } = useSupabase();
  return supabase;
};
