
'use client';

import { GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type Flashcard = GenerateFlashcardsOutput['flashcards'][0];

export type FlashcardSet = {
    id: string;
    title: string;
    cards: Flashcard[];
};

type FlashcardsContextType = {
  flashcardSets: FlashcardSet[];
  loading: boolean;
  addFlashcardSet: (title: string, cards: Flashcard[]) => Promise<FlashcardSet>;
  deleteFlashcardSet: (setId: string) => Promise<void>;
  getFlashcardSet: (setId: string) => FlashcardSet | null | undefined;
};

const FlashcardsContext = createContext<FlashcardsContextType | undefined>(undefined);

export function FlashcardsProvider({ children }: { children: ReactNode }) {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const [loading, setLoading] = useState(true);

  const getDocRef = useCallback(() => {
    if (!user || !firestore) return null;
    // This doc holds all non-collection user data to minimize reads
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const fetchFlashcards = useCallback(async () => {
    const docRef = getDocRef();
    if (!docRef) {
        setLoading(false);
        return;
    };
    setLoading(true);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            setFlashcardSets(userData.flashcard_sets || []);
        } else {
            setFlashcardSets([]);
        }
    } catch(error: any) {
        toast({title: 'Error loading flashcards', description: error.message, variant: 'destructive'});
    }
    setLoading(false);
  }, [getDocRef, toast]);

  useEffect(() => {
    if (user) {
        fetchFlashcards();
    } else {
        setFlashcardSets([]);
        setLoading(false);
    }
  }, [user, fetchFlashcards]);

  const updateRemoteFlashcards = async (sets: FlashcardSet[]) => {
    const docRef = getDocRef();
    if (!docRef) return;
    try {
        await setDoc(docRef, { flashcard_sets: sets }, { merge: true });
    } catch(error: any) {
        toast({title: 'Error saving flashcards', description: error.message, variant: 'destructive'});
    }
  }

  const addFlashcardSet = async (title: string, cards: Flashcard[]): Promise<FlashcardSet> => {
    if (!user) throw new Error("User not authenticated");
    const newSet: FlashcardSet = {
        id: Date.now().toString(),
        title,
        cards,
    };
    const newSets = [newSet, ...flashcardSets];
    setFlashcardSets(newSets);
    await updateRemoteFlashcards(newSets);
    return newSet;
  };

  const deleteFlashcardSet = async (setId: string) => {
    if (!user) return;
    const newSets = flashcardSets.filter(set => set.id !== setId);
    setFlashcardSets(newSets);
    await updateRemoteFlashcards(newSets);
    toast({title: "Flashcard set deleted."});
  }

  const getFlashcardSet = (setId: string) => {
    if (loading) return undefined; // Still loading
    return flashcardSets.find(set => set.id === setId) || null;
  }

  return (
    <FlashcardsContext.Provider value={{ flashcardSets, loading, addFlashcardSet, deleteFlashcardSet, getFlashcardSet }}>
      {children}
    </FlashcardsContext.Provider>
  );
}

export function useFlashcards() {
  const context = useContext(FlashcardsContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardsProvider');
  }
  return context;
}
