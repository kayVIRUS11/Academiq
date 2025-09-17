'use client';

import { useState, useEffect, useMemo } from 'react';
import { Note } from '@/lib/types';
import { Input } from '@/components/ui/input';
import 'quill/dist/quill.snow.css';
import { useQuill } from 'react-quilljs';
import { Skeleton } from '../ui/skeleton';


type NoteEditorProps = {
  note: Note;
  onUpdate: (updatedNote: Partial<Note>) => void;
};

export function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link'],
      ['clean']
    ],
  }), []);

  const { quill, quillRef } = useQuill({ modules });
  const [content, setContent] = useState(note.content);

  // Load note content into Quill when it's ready
  useEffect(() => {
    if (quill) {
        if (note.content) {
             quill.clipboard.dangerouslyPasteHTML(note.content);
        } else {
             quill.setText('');
        }
    }
  }, [quill, note.id]); // Rerun when note changes

  // Listen for text changes in Quill
  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        setContent(quill.root.innerHTML);
      });
    }
  }, [quill]);


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

  useEffect(() => {
    setTitle(note.title);
    // Content is handled by the Quill effect
  }, [note.id, note.title]);


  return (
    <div className="h-full flex flex-col note-editor-container">
        <style jsx global>{`
            .ql-toolbar, .ql-container {
                border-color: hsl(var(--border)) !important;
            }
            .ql-snow .ql-stroke {
                stroke: hsl(var(--foreground));
            }
             .ql-snow .ql-picker-label {
                color: hsl(var(--foreground));
            }
            .ql-snow .ql-editor.ql-blank::before {
                color: hsl(var(--muted-foreground));
            }
            .ql-editor {
                min-height: 400px;
                font-size: 1rem;
                color: hsl(var(--foreground));
            }
        `}</style>
       <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold border-none focus-visible:ring-0 shadow-none p-0 h-auto mb-4"
            placeholder="Note Title"
        />
      
        <div ref={quillRef} />
    </div>
  );
}
