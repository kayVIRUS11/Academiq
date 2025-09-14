'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type NoteEditorProps = {
  note: Note;
  onUpdate: (updatedNote: Partial<Note>) => void;
};

export function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);

  // Use a timer to save changes after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        onUpdate({ title, content });
      }
    }, 1000); // 1 second delay

    return () => {
      clearTimeout(handler);
    };
  }, [title, content, note, onUpdate]);


  return (
    <div className="h-full flex flex-col">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-2xl font-bold border-none focus-visible:ring-0 shadow-none p-0 mb-4 h-auto"
        placeholder="Note Title"
      />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 text-base border-none focus-visible:ring-0 shadow-none p-0 resize-none"
        placeholder="Start writing your note here..."
      />
    </div>
  );
}
