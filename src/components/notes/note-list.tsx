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
            <p className="text-sm text-muted-foreground truncate">{note.content || 'No content'}</p>
            <div className="flex items-center justify-between mt-2">
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
