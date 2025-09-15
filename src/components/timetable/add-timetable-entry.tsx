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
import { TimetableEntryForm } from './timetable-entry-form';
import { TimetableEntry, Course } from '@/lib/types';

type AddTimetableEntryProps = {
  courses: Course[];
  onAddEntry: (entry: Omit<TimetableEntry, 'id' | 'uid'>) => void;
};

export function AddTimetableEntry({ courses, onAddEntry }: AddTimetableEntryProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (values: any) => {
    onAddEntry(values);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2" />
          Add Class
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add a New Class to Timetable</SheetTitle>
          <SheetDescription>
            Enter the details for your new class session.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <TimetableEntryForm
            courses={courses}
            onSubmit={handleSubmit}
            submitButtonText="Add to Timetable"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
