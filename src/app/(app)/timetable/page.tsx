'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { mockTimetable, mockCourses } from '@/lib/mock-data';
import { TimetableEntry, Course } from '@/lib/types';
import { TimetableView } from '@/components/timetable/timetable-view';
import { AddTimetableEntry } from '@/components/timetable/add-timetable-entry';

export default function TimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>(mockTimetable);
  const [courses] = useState<Course[]>(mockCourses);

  const handleAddEntry = (newEntryData: Omit<TimetableEntry, 'id'>) => {
    setEntries(prev => [
      ...prev,
      {
        ...newEntryData,
        id: (prev.length + 1).toString(),
      },
    ]);
  };

  const handleUpdateEntry = (updatedEntry: TimetableEntry) => {
    setEntries(prev => prev.map(e => (e.id === updatedEntry.id ? updatedEntry : e)));
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries(prev => prev.filter(e => e.id !== entryId));
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

      <TimetableView
        entries={entries}
        courses={courses}
        onUpdateEntry={handleUpdateEntry}
        onDeleteEntry={handleDeleteEntry}
      />
    </div>
  );
}
