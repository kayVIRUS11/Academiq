
'use client';

import { GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

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

  const userFlashcardsRef = user ? doc(db, 'flashcardSets', user.uid) : null;
  const [snapshot, loading, error] = useDocument(userFlashcardsRef);

  useEffect(() => {
    if (snapshot?.exists()) {
        setFlashcardSets(snapshot.data().sets || []);
    } else {
        setFlashcardSets([]);
    }
  }, [snapshot]);

  useEffect(() => {
    if (error) {
      toast({title: 'Error loading flashcards', description: error.message, variant: 'destructive'});
    }
  }, [error, toast]);

  const addFlashcardSet = async (title: string, cards: Flashcard[]): Promise<FlashcardSet> => {
    if (!userFlashcardsRef) throw new Error("User not authenticated");
    const newSet: FlashcardSet = {
        id: Date.now().toString(),
        title,
        cards,
    };
    const newSets = [newSet, ...flashcardSets];
    await setDoc(userFlashcardsRef, { sets: newSets });
    setFlashcardSets(newSets);
    return newSet;
  };

  const deleteFlashcardSet = async (setId: string) => {
    if (!userFlashcardsRef) return;
    const newSets = flashcardSets.filter(set => set.id !== setId);
    await setDoc(userFlashcardsRef, { sets: newSets });
    setFlashcardSets(newSets);
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
