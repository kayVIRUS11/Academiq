
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    User, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { useFirebase } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';

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
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    const { auth, firestore } = useFirebase();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
      if (!loading && !user && !publicRoutes.includes(pathname)) {
        router.push('/login');
      }
    }, [loading, user, pathname, router]);

    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName });

            const userProfileRef = doc(firestore, 'users', user.uid);
            await setDoc(userProfileRef, {
                id: user.uid,
                email: user.email,
                name: displayName,
            });

            setUser(user);
            return { user, error: null };
        } catch (error) {
            return { user: null, error };
        }
    };
    
    const signInWithEmail = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { user: userCredential.user, error: null };
        } catch (error) {
            return { user: null, error };
        }
    };

    const logout = () => {
        return signOut(auth);
    };

    const updateUserSettings = async (updates: { [key: string]: any }) => {
        if (!user) throw new Error("No user is signed in.");
        
        let profileUpdates = {};
        if (updates.full_name && updates.full_name !== user.displayName) {
            Object.assign(profileUpdates, { displayName: updates.full_name });
        }
        
        if (Object.keys(profileUpdates).length > 0) {
            await updateProfile(user, profileUpdates);
        }
        
        const userProfileRef = doc(firestore, 'users', user.uid);
        await setDoc(userProfileRef, { name: updates.full_name }, { merge: true });

        // Manually update the user object to reflect changes immediately
        const updatedUser = Object.assign(Object.create(Object.getPrototypeOf(user)), user, {
            displayName: updates.full_name,
        });

        setUser(updatedUser);
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
