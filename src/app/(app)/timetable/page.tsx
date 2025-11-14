
'use client';

import { Calendar } from 'lucide-react';
import { TimetableEntry, Course } from '@/lib/types';
import { TimetableView } from '@/components/timetable/timetable-view';
import { AddTimetableEntry } from '@/components/timetable/add-timetable-entry';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useFirebase } from '@/firebase';
import { useState, useEffect, useCallback } from 'react';
import { useCourses } from '@/context/courses-context';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function TimetablePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const { courses } = useCourses();
  
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) {
        setLoading(false);
        return;
    };
    setLoading(true);

    const timetableQuery = query(collection(firestore, 'users', user.uid, 'timeTables'));

    const unsubscribe = onSnapshot(timetableQuery, (snapshot) => {
        const timetableData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimetableEntry));
        setEntries(timetableData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching timetable:", error);
        toast({ title: 'Error fetching timetable', description: error.message, variant: 'destructive' });
        setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user, firestore, toast]);


  const handleAddEntry = async (newEntryData: Omit<TimetableEntry, 'id' | 'uid'>) => {
    if (!user || !firestore) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    try {
      const timetableCollection = collection(firestore, 'users', user.uid, 'timeTables');
      
      const dataToSave: any = {
        ...newEntryData,
        uid: user.uid,
        userProfileId: user.uid
      };
      
      if (!dataToSave.courseId) {
        delete dataToSave.courseId;
      }

      await addDoc(timetableCollection, dataToSave);
      toast({ title: 'Class added!' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error adding class', description: e.message, variant: 'destructive' });
    }
  };

  const handleUpdateEntry = async (updatedEntry: TimetableEntry) => {
    if (!user || !firestore) return;
    try {
      const { id, ...entryData } = updatedEntry;
      const entryDoc = doc(firestore, 'users', user.uid, 'timeTables', id);
      await updateDoc(entryDoc, entryData);
      toast({ title: 'Class updated.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error updating class', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user || !firestore) return;
    try {
      const entryDoc = doc(firestore, 'users', user.uid, 'timeTables', entryId);
      await deleteDoc(entryDoc);
      toast({ title: 'Class deleted.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error deleting class', description: e.message, variant: 'destructive' });
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
