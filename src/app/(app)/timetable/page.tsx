'use client';

import { Calendar } from 'lucide-react';
import { TimetableEntry, Course } from '@/lib/types';
import { TimetableView } from '@/components/timetable/timetable-view';
import { AddTimetableEntry } from '@/components/timetable/add-timetable-entry';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function TimetablePage() {
  const { toast } = useToast();
  const [coursesSnapshot, coursesLoading] = useCollection(collection(db, 'courses'));
  const [timetableSnapshot, timetableLoading] = useCollection(collection(db, 'timetable'));
  
  const loading = coursesLoading || timetableLoading;

  const courses = coursesSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)) || [];
  const entries = timetableSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimetableEntry)) || [];

  const handleAddEntry = async (newEntryData: Omit<TimetableEntry, 'id'>) => {
    try {
      await addDoc(collection(db, 'timetable'), newEntryData);
      toast({ title: 'Class added!' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error adding class', variant: 'destructive' });
    }
  };

  const handleUpdateEntry = async (updatedEntry: TimetableEntry) => {
    try {
      const { id, ...entryData } = updatedEntry;
      await updateDoc(doc(db, 'timetable', id), entryData);
      toast({ title: 'Class updated.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error updating class', variant: 'destructive' });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteDoc(doc(db, 'timetable', entryId));
      toast({ title: 'Class deleted.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error deleting class', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <Calendar className="w-8 h-8" />
          Class Timetable
        </h1>
        <AddTimetableEntry courses={courses} onAddEntry={handleAddEntry} />
      </div>

      {loading ? (
        <Skeleton className="h-[500px] w-full" />
      ) : (
        <TimetableView
          entries={entries}
          courses={courses}
          onUpdateEntry={handleUpdateEntry}
          onDeleteEntry={handleDeleteEntry}
        />
      )}
    </div>
  );
}
