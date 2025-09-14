'use client';

import { Note } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

type NotesContextType = {
  notes: Note[];
  loading: boolean;
  error?: Error;
  selectedNoteId: string | null;
  setSelectedNoteId: React.Dispatch<React.SetStateAction<string | null>>;
  addNote: (newNoteData: Omit<Note, 'id' | 'createdAt'>) => Promise<Note>;
  updateNote: (id: string, updatedNote: Partial<Omit<Note, 'id' | 'createdAt'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const { toast } = useToast();

  const [notesSnapshot, loading, error] = useCollection(collection(db, 'notes'));
  
  const notes: Note[] = loading || !notesSnapshot 
    ? [] 
    : notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));


  const addNote = async (newNoteData: Omit<Note, 'id' | 'createdAt'>): Promise<Note> => {
    try {
      const docRef = await addDoc(collection(db, 'notes'), {
        ...newNoteData,
        createdAt: new Date().toISOString(),
      });
      const newNote = { ...newNoteData, id: docRef.id, createdAt: new Date().toISOString() };
      toast({ title: 'Note added!' });
      return newNote;
    } catch (e) {
      console.error(e);
      toast({ title: 'Error adding note', variant: 'destructive' });
      throw e;
    }
  };

  const updateNote = async (id: string, updatedData: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    try {
        const noteRef = doc(db, 'notes', id);
        await updateDoc(noteRef, updatedData);
    } catch(e) {
        // We don't toast here as it's noisy on auto-save
        console.error("Error updating note:", e);
    }
  }

  const deleteNote = async (id: string) => {
    try {
        await deleteDoc(doc(db, 'notes', id));
        toast({ title: 'Note deleted.' });
    } catch(e) {
        console.error(e);
        toast({ title: 'Error deleting note.', variant: 'destructive'});
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
