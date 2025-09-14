'use client';

import { StudySession, Course } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { StudySessionForm } from './study-session-form';

type EditStudySessionProps = {
  session: StudySession;
  courses: Course[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSession: (session: StudySession) => void;
};

export function EditStudySession({ session, courses, isOpen, onOpenChange, onUpdateSession }: EditStudySessionProps) {
  const handleSubmit = (values: any) => {
    onUpdateSession({
      ...session,
      ...values,
      date: values.date.toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Study Session</DialogTitle>
          <DialogDescription>
            Update the details of your study session.
          </DialogDescription>
        </DialogHeader>
        <StudySessionForm
          courses={courses}
          onSubmit={handleSubmit}
          defaultValues={{...session, date: new Date(session.date)}}
          submitButtonText="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}
