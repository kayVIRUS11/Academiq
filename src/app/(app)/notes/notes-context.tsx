
'use client';

import { Note } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useSupabase } from '@/supabase';
import { useSupabaseRealtime } from '@/hooks/use-supabase-realtime';


type NotesContextType = {
  notes: Note[];
  loading: boolean;
  error?: Error;
  selectedNoteId: string | null;
  setSelectedNoteId: React.Dispatch<React.SetStateAction<string | null>>;
  addNote: (newNoteData: Omit<Note, 'id' | 'createdAt' | 'uid'>) => Promise<Note>;
  updateNote: (id: string, updatedNote: Partial<Omit<Note, 'id' | 'createdAt' | 'uid'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const { data: notes, loading } = useSupabaseRealtime<Note>('notes', 'createdAt', false);
  const [error, setError] = useState<Error | undefined>();
  const { toast } = useToast();
  const { user } = useAuth();
  const { supabase } = useSupabase();


  const addNote = async (newNoteData: Omit<Note, 'id' | 'createdAt' | 'uid'>): Promise<Note> => {
    if (!user || !supabase) throw new Error("User not authenticated or Supabase not available");
    
    try {
        const dataToSave: any = {
            ...newNoteData,
            uid: user.id
        };

        if (!dataToSave.courseId) {
            delete dataToSave.courseId;
        }

        const { data, error } = await supabase.from('notes').insert(dataToSave).select().single();
        if (error) throw error;
        
        toast({ title: 'Note added!' });

        return data as Note;
    } catch (error: any) {
        console.error("Error adding note:", error);
        toast({ title: 'Error adding note', description: error.message, variant: 'destructive' });
        throw error;
    }
  };

  const updateNote = async (id: string, updatedData: Partial<Omit<Note, 'id' | 'createdAt' | 'uid'>>) => {
    if (!user || !supabase) return;
    
    try {
        // Prevent sending undefined to Supabase
        const safeData = Object.fromEntries(
            Object.entries(updatedData).filter(([_, v]) => v !== undefined)
        );

        if (Object.keys(safeData).length > 0) {
            const { error } = await supabase.from('notes').update(safeData).eq('id', id);
            if (error) throw error;
        }
    } catch(e) {
        // We don't toast here as it's noisy on auto-save
        console.error("Error updating note:", e);
    }
  }

  const deleteNote = async (id: string) => {
    if (!user || !supabase) return;

    try {
        const { error } = await supabase.from('notes').delete().eq('id', id);
        if (error) throw error;
        toast({ title: 'Note deleted.' });
    } catch(e: any) {
        console.error(e);
        toast({ title: 'Error deleting note.', description: e.message, variant: 'destructive'});
    }
  }

  return (
    <NotesContext.Provider value={{ notes, loading, error, selectedNoteId, setSelectedNoteId, addNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
