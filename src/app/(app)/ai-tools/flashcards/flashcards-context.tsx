'use client';

import { GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Flashcard = GenerateFlashcardsOutput['flashcards'][0];

export type FlashcardSet = {
    id: string;
    title: string;
    cards: Flashcard[];
};

type FlashcardsContextType = {
  flashcardSets: FlashcardSet[];
  addFlashcardSet: (title: string, cards: Flashcard[]) => void;
  deleteFlashcardSet: (setId: string) => void;
  getFlashcardSet: (setId: string) => FlashcardSet | undefined;
};

const FlashcardsContext = createContext<FlashcardsContextType | undefined>(undefined);

export function FlashcardsProvider({ children }: { children: ReactNode }) {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);

  const addFlashcardSet = (title: string, cards: Flashcard[]) => {
    const newSet: FlashcardSet = {
        id: Date.now().toString(),
        title,
        cards,
    };
    setFlashcardSets(prev => [newSet, ...prev]);
  };

  const deleteFlashcardSet = (setId: string) => {
    setFlashcardSets(prev => prev.filter(set => set.id !== setId));
  }

  const getFlashcardSet = (setId: string) => {
    return flashcardSets.find(set => set.id === setId);
  }

  return (
    <FlashcardsContext.Provider value={{ flashcardSets, addFlashcardSet, deleteFlashcardSet, getFlashcardSet }}>
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
