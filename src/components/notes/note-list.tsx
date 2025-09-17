'use client';

import { Note, Course } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type NoteListProps = {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  courses: Course[];
};

export function NoteList({ notes, selectedNoteId, onSelectNote, courses }: NoteListProps) {

  const getCourse = (courseId?: string) => {
    return courses.find(c => c.id === courseId);
  }

  const sortedNotes = [...notes].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // A simple function to strip HTML for a plain text preview
  const getPlainText = (html: string) => {
    if (typeof document !== 'undefined') {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }
    return html;
  }


  return (
    <div className="space-y-2 p-4">
      {sortedNotes.map(note => {
        const course = getCourse(note.courseId);
        return (
          <button
            key={note.id}
            onClick={() => onSelectNote(note.id)}
            className={cn(
              'w-full text-left p-3 rounded-lg transition-colors',
              note.id === selectedNoteId
                ? 'bg-secondary'
                : 'hover:bg-muted/50'
            )}
          >
            <h3 className="font-semibold truncate">{note.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{getPlainText(note.content) || 'No content'}</p>
            <div className="flex items-center justify-between flex-wrap gap-x-2 mt-2">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
              </span>
              {course && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{backgroundColor: course.color}}>
                  {course.name}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
