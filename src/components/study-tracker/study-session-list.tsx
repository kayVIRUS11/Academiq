'use client';
import { useState } from 'react';
import { StudySession, Course } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { EditStudySession } from './edit-study-session';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';

type StudySessionListProps = {
  sessions: StudySession[];
  courses: Course[];
  onUpdateSession: (session: StudySession) => void;
  onDeleteSession: (id: string) => void;
};

export function StudySessionList({ sessions, courses, onUpdateSession, onDeleteSession }: StudySessionListProps) {
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const getCourseName = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.name || 'Unknown Course';
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{getCourseName(session.courseId)}</TableCell>
                  <TableCell>{format(new Date(session.date), 'PPP')}</TableCell>
                  <TableCell>{formatDuration(session.duration)}</TableCell>
                  <TableCell className="max-w-xs truncate">{session.notes || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingSession(session)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit Session</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingSessionId(session.id)} className="text-destructive hover:text-destructive">
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete Session</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No study sessions logged yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editingSession && (
        <EditStudySession
          session={editingSession}
          courses={courses}
          isOpen={!!editingSession}
          onOpenChange={(isOpen) => !isOpen && setEditingSession(null)}
          onUpdateSession={onUpdateSession}
        />
      )}
      
      <AlertDialog open={!!deletingSessionId} onOpenChange={(isOpen) => !isOpen && setDeletingSessionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this study session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
                if(deletingSessionId) onDeleteSession(deletingSessionId);
                setDeletingSessionId(null);
            }} className="bg-destructive hover:bg-destructive/90">
              Yes, delete session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
