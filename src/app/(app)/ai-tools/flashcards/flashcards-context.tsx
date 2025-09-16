'use client';

import { GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';

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
  const [loading, setLoading] = useState(true);

  const fetchFlashcards = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('user_data')
      .select('flashcard_sets')
      .eq('uid', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore "no rows found" error
        toast({title: 'Error loading flashcards', description: error.message, variant: 'destructive'});
    } else {
        setFlashcardSets(data?.flashcard_sets || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const updateRemoteFlashcards = async (sets: FlashcardSet[]) => {
    if (!user) return;
    const { error } = await supabase
      .from('user_data')
      .upsert({ uid: user.id, flashcard_sets: sets }, { onConflict: 'uid' });
    if (error) {
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
