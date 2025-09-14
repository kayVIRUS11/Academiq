'use client';

import { useState } from 'react';
import { TimetableEntry, Course } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { TimetableEntryForm } from './timetable-entry-form';
import { Button } from '../ui/button';
import { Trash } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type EditTimetableEntryProps = {
  entry: TimetableEntry;
  courses: Course[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateEntry: (entry: TimetableEntry) => void;
  onDeleteEntry: (id: string) => void;
};

export function EditTimetableEntry({ entry, courses, isOpen, onOpenChange, onUpdateEntry, onDeleteEntry }: EditTimetableEntryProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = (values: any) => {
    onUpdateEntry({ ...entry, ...values });
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDeleteEntry(entry.id);
    setIsDeleting(false);
    onOpenChange(false);
  }

  return (
    <>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Edit Class</DialogTitle>
                <DialogDescription>
                    Update the details for this class session.
                </DialogDescription>
                </DialogHeader>
                <TimetableEntryForm
                    courses={courses}
                    onSubmit={handleSubmit}
                    defaultValues={entry}
                    submitButtonText="Save Changes"
                />
                <DialogFooter className="mt-4">
                    <Button variant="destructive" className="mr-auto" onClick={() => setIsDeleting(true)}>
                        <Trash className="mr-2" />
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This will permanently delete this class entry from your timetable.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Yes, delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
