'use client';

import { Note } from '@/lib/types';
import { mockNotes } from '@/lib/mock-data';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type NotesContextType = {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  selectedNoteId: string | null;
  setSelectedNoteId: React.Dispatch<React.SetStateAction<string | null>>;
  addNote: (newNoteData: Omit<Note, 'id' | 'createdAt'>) => Note;
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes.length > 0 ? notes[0].id : null);

  const addNote = (newNoteData: Omit<Note, 'id' | 'createdAt'>): Note => {
    const newNote: Note = {
      ...newNoteData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    return newNote;
  };

  return (
    <NotesContext.Provider value={{ notes, setNotes, selectedNoteId, setSelectedNoteId, addNote }}>
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
