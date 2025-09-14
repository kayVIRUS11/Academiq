'use client';

import { GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

type Flashcard = GenerateFlashcardsOutput['flashcards'][0];

export type FlashcardSet = {
    id: string;
    title: string;
    cards: Flashcard[];
};

type FlashcardsContextType = {
  flashcardSets: FlashcardSet[];
  loading: boolean;
  addFlashcardSet: (title: string, cards: Flashcard[]) => Promise<void>;
  deleteFlashcardSet: (setId: string) => Promise<void>;
  getFlashcardSet: (setId: string) => FlashcardSet | undefined;
};

const FlashcardsContext = createContext<FlashcardsContextType | undefined>(undefined);

// In a real app, get from auth
const USER_ID = 'default-user';

export function FlashcardsProvider({ children }: { children: ReactNode }) {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const { toast } = useToast();

  const userFlashcardsRef = doc(db, 'flashcardSets', USER_ID);
  const [snapshot, loading, error] = useDocument(userFlashcardsRef);

  useEffect(() => {
    if (snapshot?.exists()) {
        setFlashcardSets(snapshot.data().sets || []);
    }
  }, [snapshot]);

  const addFlashcardSet = async (title: string, cards: Flashcard[]) => {
    const newSet: FlashcardSet = {
        id: Date.now().toString(),
        title,
        cards,
    };
    const newSets = [newSet, ...flashcardSets];
    setFlashcardSets(newSets);
    await setDoc(userFlashcardsRef, { sets: newSets });
  };

  const deleteFlashcardSet = async (setId: string) => {
    const newSets = flashcardSets.filter(set => set.id !== setId);
    setFlashcardSets(newSets);
    await setDoc(userFlashcardsRef, { sets: newSets });
    toast({title: "Flashcard set deleted."});
  }

  const getFlashcardSet = (setId: string) => {
    return flashcardSets.find(set => set.id === setId);
  }
  
  if (error) {
    toast({title: 'Error loading flashcards', description: error.message, variant: 'destructive'});
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
