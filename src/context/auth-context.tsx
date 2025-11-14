
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<any>;
    signInWithEmail: (email: string, password: string) => Promise<any>;
    logout: () => Promise<any>;
    updateUserSettings: (updates: { [key: string]: any }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup', '/join', '/terms', '/privacy', '/'];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };
        
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
      if (!loading && !user && !publicRoutes.includes(pathname)) {
        router.push('/login');
      }
    }, [loading, user, pathname, router]);

    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        return supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: displayName,
                },
            },
        });
    };
    
    const signInWithEmail = (email: string, password: string) => {
        return supabase.auth.signInWithPassword({ email, password });
    };

    const logout = () => {
        return supabase.auth.signOut();
    };

    const updateUserSettings = async (updates: { [key: string]: any }) => {
        if (!user) {
            throw new Error("No user is signed in.");
        }
        const { data, error } = await supabase.auth.updateUser({
            data: { ...user.user_metadata, ...updates }
        });

        if (error) throw error;
        if (data.user) setUser(data.user);
    };

    const value = {
        user,
        loading,
        signUpWithEmail,
        signInWithEmail,
        logout,
        updateUserSettings
    };
    
    if (loading && !publicRoutes.includes(pathname)) {
        return (
           <div className="flex h-screen items-center justify-center">
               <Loader2 className="h-16 w-16 animate-spin text-primary" />
           </div>
        );
    }
    
    if (!loading && !user && !publicRoutes.includes(pathname)) {
        return null; // The useEffect above will handle the redirection.
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
