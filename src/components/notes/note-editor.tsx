'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { marked } from 'marked';
import { Button } from '../ui/button';
import { Edit, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

type NoteEditorProps = {
  note: Note;
  onUpdate: (updatedNote: Partial<Note>) => void;
};

export function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(true); // Default to edit mode when a new note is selected
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

  const getRenderedContent = () => {
    if (!content) return null;
    const rawMarkup = marked.parse(content);
    return { __html: rawMarkup as string };
  };

  return (
    <div className="h-full flex flex-col">
       <div className="flex items-center justify-between mb-4 flex-wrap">
            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold border-none focus-visible:ring-0 shadow-none p-0 h-auto flex-1 min-w-[200px]"
                placeholder="Note Title"
            />
             <div className="flex items-center gap-2">
                <Button variant={isEditing ? "default" : "outline"} size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2"/>
                    Edit
                </Button>
                <Button variant={!isEditing ? "default" : "outline"} size="sm" onClick={() => setIsEditing(false)}>
                    <Eye className="mr-2"/>
                    Preview
                </Button>
            </div>
        </div>
      
      {isEditing ? (
        <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 text-base border rounded-md focus-visible:ring-1 p-4 resize-none"
            placeholder="Start writing your note here... You can use Markdown for formatting."
        />
      ) : (
        <div 
            className={cn(
                "prose dark:prose-invert max-w-none flex-1 overflow-y-auto rounded-md border p-4",
                !content && "flex items-center justify-center text-muted-foreground"
            )}
            dangerouslySetInnerHTML={getRenderedContent() || {__html: '<p>Nothing to preview. Add some content in the editor!</p>'}}
        />
      )}
    </div>
  );
}
