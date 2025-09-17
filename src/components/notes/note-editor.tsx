'use client';

import { useState, useEffect, useMemo } from 'react';
import { Note } from '@/lib/types';
import { Input } from '@/components/ui/input';
import 'react-quill/dist/quill.snow.css'; // import styles
import 'react-quill/dist/quill.bubble.css';
import dynamic from 'next/dynamic';
import { Skeleton } from '../ui/skeleton';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
    () => import('react-quill'), 
    { 
        ssr: false,
        loading: () => <Skeleton className="h-[400px]" />
    }
);


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

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link'],
      ['clean']
    ],
  }), []);

  return (
    <div className="h-full flex flex-col note-editor-container">
        <style jsx global>{`
            .ql-toolbar.ql-snow, .ql-container.ql-snow {
                border-color: hsl(var(--border));
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
      
        <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            placeholder="Start writing your note here..."
        />
    </div>
  );
}
