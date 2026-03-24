
'use client';

import { Calendar } from 'lucide-react';
import { TimetableEntry, Course } from '@/lib/types';
import { TimetableView } from '@/components/timetable/timetable-view';
import { AddTimetableEntry } from '@/components/timetable/add-timetable-entry';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useSupabase } from '@/supabase';
import { useCourses } from '@/context/courses-context';
import { useSupabaseRealtime } from '@/hooks/use-supabase-realtime';

export default function TimetablePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { supabase } = useSupabase();
  const { courses } = useCourses();
  
  const { data: entries, loading } = useSupabaseRealtime<TimetableEntry>('timeTables', 'created_at', true);


  const handleAddEntry = async (newEntryData: Omit<TimetableEntry, 'id' | 'uid'>) => {
    if (!user || !supabase) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    try {
      const dataToSave: any = {
        ...newEntryData,
        uid: user.id
      };
      
      if (!dataToSave.courseId) {
        delete dataToSave.courseId;
      }

      const { error } = await supabase.from('timeTables').insert(dataToSave);
      if (error) throw error;
      toast({ title: 'Class added!' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error adding class', description: e.message, variant: 'destructive' });
    }
  };

  const handleUpdateEntry = async (updatedEntry: TimetableEntry) => {
    if (!user || !supabase) return;
    try {
      const { id, ...entryData } = updatedEntry;
      const { error } = await supabase.from('timeTables').update(entryData).eq('id', id);
      if (error) throw error;
      toast({ title: 'Class updated.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error updating class', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user || !supabase) return;
    try {
      const { error } = await supabase.from('timeTables').delete().eq('id', entryId);
      if (error) throw error;
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
