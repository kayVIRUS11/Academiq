'use client';

import { Calendar } from 'lucide-react';
import { TimetableEntry, Course } from '@/lib/types';
import { TimetableView } from '@/components/timetable/timetable-view';
import { AddTimetableEntry } from '@/components/timetable/add-timetable-entry';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';

export default function TimetablePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [coursesRes, timetableRes] = await Promise.all([
      supabase.from('courses').select('*').eq('uid', user.id),
      supabase.from('timetable').select('*').eq('uid', user.id)
    ]);

    if (coursesRes.error) toast({ title: 'Error fetching courses', description: coursesRes.error.message, variant: 'destructive' });
    else setCourses(coursesRes.data as Course[]);

    if (timetableRes.error) toast({ title: 'Error fetching timetable', description: timetableRes.error.message, variant: 'destructive' });
    else setEntries(timetableRes.data as TimetableEntry[]);
    
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleAddEntry = async (newEntryData: Omit<TimetableEntry, 'id' | 'uid'>) => {
    if (!user) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    try {
      const { data, error } = await supabase.from('timetable').insert({ ...newEntryData, uid: user.id }).select();
      if (error) throw error;
      setEntries(prev => [...prev, data[0]]);
      toast({ title: 'Class added!' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error adding class', description: e.message, variant: 'destructive' });
    }
  };

  const handleUpdateEntry = async (updatedEntry: TimetableEntry) => {
    try {
      const { id, ...entryData } = updatedEntry;
      const { data, error } = await supabase.from('timetable').update(entryData).eq('id', id).select();
      if (error) throw error;
      setEntries(prev => prev.map(e => e.id === id ? data[0] : e));
      toast({ title: 'Class updated.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error updating class', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await supabase.from('timetable').delete().eq('id', entryId);
      setEntries(prev => prev.filter(e => e.id !== entryId));
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
