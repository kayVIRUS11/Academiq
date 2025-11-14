
'use client';

import { Note } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useFirebase } from '@/firebase';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';


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
  const { firestore } = useFirebase();
  
  useEffect(() => {
    if (!user || !firestore) {
        setNotes([]);
        setLoading(false);
        return;
    };
    
    setLoading(true);
    const notesQuery = query(collection(firestore, 'users', user.uid, 'notes'));
    
    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
        const notesData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamp to ISO string if it's not already
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            } as Note;
        });
        setNotes(notesData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching notes:", error);
        setError(error);
        toast({ title: 'Error loading notes', description: error.message, variant: 'destructive' });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore, toast]);


  const addNote = async (newNoteData: Omit<Note, 'id' | 'createdAt' | 'uid'>): Promise<Note> => {
    if (!user || !firestore) throw new Error("User not authenticated or Firestore not available");
    
    const notesCollection = collection(firestore, 'users', user.uid, 'notes');
    
    try {
        const docRef = await addDoc(notesCollection, {
            ...newNoteData,
            uid: user.id,
            createdAt: serverTimestamp(),
        });
        toast({ title: 'Note added!' });

        // We can't immediately get the server timestamp, so we'll create a client-side version
        // The real-time listener will correct this shortly
        const newNote: Note = {
            id: docRef.id,
            ...newNoteData,
            uid: user.id,
            createdAt: new Date().toISOString(),
        };
        return newNote;

    } catch (error: any) {
        console.error("Error adding note:", error);
        toast({ title: 'Error adding note', description: error.message, variant: 'destructive' });
        throw error;
    }
  };

  const updateNote = async (id: string, updatedData: Partial<Omit<Note, 'id' | 'createdAt' | 'uid'>>) => {
    if (!user || !firestore) return;
    
    const noteDoc = doc(firestore, 'users', user.uid, 'notes', id);
    try {
        await updateDoc(noteDoc, updatedData);
    } catch(e) {
        // We don't toast here as it's noisy on auto-save
        console.error("Error updating note:", e);
    }
  }

  const deleteNote = async (id: string) => {
    if (!user || !firestore) return;

    try {
        const noteDoc = doc(firestore, 'users', user.uid, 'notes', id);
        await deleteDoc(noteDoc);
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
