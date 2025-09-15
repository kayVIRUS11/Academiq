'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { StudySessionForm } from './study-session-form';
import { StudySession, Course } from '@/lib/types';

type AddStudySessionProps = {
  courses: Course[];
  onAddSession: (session: Omit<StudySession, 'id' | 'uid'>) => void;
};

export function AddStudySession({ courses, onAddSession }: AddStudySessionProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (values: any) => {
    onAddSession({
      ...values,
      date: values.date.toISOString(),
    });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2" />
          Log Session
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Log a New Study Session</SheetTitle>
          <SheetDescription>
            Record your study time to track your progress.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <StudySessionForm
            courses={courses}
            onSubmit={handleSubmit}
            submitButtonText="Log Session"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
