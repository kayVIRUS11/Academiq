'use client';

import { Note } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

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
  const { toast } = useToast();
  const { user } = useAuth();

  const notesQuery = user ? query(collection(db, 'notes'), where('uid', '==', user.uid)) : null;
  const [notesSnapshot, loading, error] = useCollection(notesQuery);
  
  const notes: Note[] = loading || !notesSnapshot 
    ? [] 
    : notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));

  useEffect(() => {
    if (error) {
      toast({ title: 'Error loading notes', description: error.message, variant: 'destructive' });
    }
  }, [error, toast]);


  const addNote = async (newNoteData: Omit<Note, 'id' | 'createdAt' | 'uid'>): Promise<Note> => {
    if (!user) throw new Error("User not authenticated");
    try {
      const docRef = await addDoc(collection(db, 'notes'), {
        ...newNoteData,
        uid: user.uid,
        createdAt: new Date().toISOString(),
      });
      const newNote = { ...newNoteData, uid: user.uid, id: docRef.id, createdAt: new Date().toISOString() };
      toast({ title: 'Note added!' });
      return newNote;
    } catch (e) {
      console.error(e);
      toast({ title: 'Error adding note', variant: 'destructive' });
      throw e;
    }
  };

  const updateNote = async (id: string, updatedData: Partial<Omit<Note, 'id' | 'createdAt' | 'uid'>>) => {
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
