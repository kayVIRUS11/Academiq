'use client';

import { Note } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';

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
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  const { toast } = useToast();
  const { user } = useAuth();
  
  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('notes').select('*').eq('uid', user.id);
    if(error) {
      setError(error as any);
      toast({ title: 'Error loading notes', description: error.message, variant: 'destructive' });
    } else {
      setNotes(data as Note[]);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);


  const addNote = async (newNoteData: Omit<Note, 'id' | 'createdAt' | 'uid'>): Promise<Note> => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase.from('notes').insert({
        ...newNoteData,
        uid: user.id,
        createdAt: new Date().toISOString(),
      }).select();

    if (error) {
        console.error(error);
        toast({ title: 'Error adding note', variant: 'destructive' });
        throw error;
    }
    const newNote = data[0] as Note;
    setNotes(prev => [...prev, newNote]);
    toast({ title: 'Note added!' });
    return newNote;
  };

  const updateNote = async (id: string, updatedData: Partial<Omit<Note, 'id' | 'createdAt' | 'uid'>>) => {
    try {
        const { error } = await supabase.from('notes').update(updatedData).eq('id', id);
        if (error) throw error;
        setNotes(prev => prev.map(n => n.id === id ? {...n, ...updatedData} : n));
    } catch(e) {
        // We don't toast here as it's noisy on auto-save
        console.error("Error updating note:", e);
    }
  }

  const deleteNote = async (id: string) => {
    try {
        const { error } = await supabase.from('notes').delete().eq('id', id);
        if (error) throw error;
        setNotes(prev => prev.filter(n => n.id !== id));
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
