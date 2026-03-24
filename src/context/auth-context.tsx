'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { useSupabase } from '@/supabase';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<{ user: User | null, error: any | null }>;
    signInWithEmail: (email: string, password: string) => Promise<{ user: User | null, error: any | null }>;
    logout: () => Promise<any>;
    updateUserSettings: (updates: { [key: string]: any }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup', '/join', '/terms', '/privacy', '/'];

export function AuthProvider({ children }: { children: ReactNode }) {
    const { supabase, user: supabaseUser, isUserLoading } = useSupabase();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        setUser(supabaseUser);
        setLoading(isUserLoading);
    }, [supabaseUser, isUserLoading]);

    useEffect(() => {
      if (!loading && !user && !publicRoutes.includes(pathname)) {
        router.push('/login');
      }
    }, [loading, user, pathname, router]);

    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        if (!supabase) return { user: null, error: new Error("Supabase client not initialized. Please check your .env and restart the server.") };
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: displayName,
                }
            }
        });

        if (error) return { user: null, error };

        const signedUser = data.user;
        if (signedUser) {
            // Upsert into user_profiles table
            await supabase.from('user_profiles').upsert({
                id: signedUser.id
            });
            setUser(signedUser);
        }
        return { user: signedUser, error: null };
    };
    
    const signInWithEmail = async (email: string, password: string) => {
        if (!supabase) return { user: null, error: new Error("Supabase client not initialized. Please check your .env and restart the server.") };
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { user: data.user, error };
    };

    const logout = async () => {
        if (!supabase) return;
        return supabase.auth.signOut();
    };

    const updateUserSettings = async (updates: { [key: string]: any }) => {
        if (!supabase) throw new Error("Supabase client not initialized.");
        if (!user) throw new Error("No user is signed in.");
        
        let profileUpdates: any = {};
        if (updates.full_name && updates.full_name !== user.user_metadata?.full_name) {
            profileUpdates.full_name = updates.full_name;
        }
        
        if (Object.keys(profileUpdates).length > 0) {
            await supabase.auth.updateUser({
                data: profileUpdates
            });
        }
        
        const { data: updatedUser } = await supabase.auth.getUser();
        if (updatedUser.user) setUser(updatedUser.user);
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
        return null;
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
