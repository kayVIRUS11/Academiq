'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    onAuthStateChanged, 
    User, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendEmailVerification,
    updateProfile,
    applyActionCode
} from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { usePathname, useSearchParams } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<any>;
    signInWithEmail: (email: string, password: string) => Promise<any>;
    signInWithGoogle: () => Promise<any>;
    logout: () => Promise<any>;
    updateUserProfile: (updates: { displayName: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/signup', '/join', '/terms', '/privacy', '/'];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleEmailVerification = async () => {
            const mode = searchParams.get('mode');
            const actionCode = searchParams.get('oobCode');

            if (mode === 'verifyEmail' && actionCode) {
                try {
                    await applyActionCode(auth, actionCode);
                    // Redirect to login with a success message
                    window.location.href = '/login?verified=true';
                } catch (error) {
                    console.error("Error verifying email:", error);
                    // Optionally, redirect to an error page
                }
            }
        };

        handleEmailVerification();
    }, [searchParams]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        
        await setDoc(doc(db, "users", userCredential.user.uid), {
            uid: userCredential.user.uid,
            displayName,
            email,
            createdAt: new Date().toISOString(),
        });

        await sendEmailVerification(userCredential.user);
        return userCredential;
    };
    
    const signInWithEmail = (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            createdAt: new Date().toISOString(),
        }, { merge: true });

        return result;
    };

    const logout = () => {
        return signOut(auth);
    };

    const updateUserProfile = async (updates: { displayName: string }) => {
        if (!auth.currentUser) {
            throw new Error("No user is signed in.");
        }
        await updateProfile(auth.currentUser, updates);
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, updates);
        // Manually trigger a state update for the user object
        const updatedUser = { ...auth.currentUser, ...updates };
        setUser(updatedUser as User);
    };

    const isPublicRoute = publicRoutes.includes(pathname);

    if (loading && !isPublicRoute) {
         return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{ user, loading, signUpWithEmail, signInWithEmail, signInWithGoogle, logout, updateUserProfile }}>
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
