'use client';

import { useState } from 'react';
import { TimetableEntry, Course } from '@/lib/types';
import { EditTimetableEntry } from './edit-timetable-entry';

type TimetableViewProps = {
  entries: TimetableEntry[];
  courses: Course[];
  onUpdateEntry: (entry: TimetableEntry) => void;
  onDeleteEntry: (id: string) => void;
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = Array.from({ length: 11 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`); // 8am to 6pm

export function TimetableView({ entries, courses, onUpdateEntry, onDeleteEntry }: TimetableViewProps) {
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);

  const getCourse = (courseId: string) => courses.find(c => c.id === courseId);

  const timeToPosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours - 8) * 60 + minutes;
  };

  const getEntryStyle = (entry: TimetableEntry) => {
    const start = timeToPosition(entry.startTime);
    const end = timeToPosition(entry.endTime);
    const course = getCourse(entry.courseId);

    return {
      top: `${(start / (11 * 60)) * 100}%`,
      height: `${((end - start) / (11 * 60)) * 100}%`,
      backgroundColor: course?.color || '#ccc',
    };
  };

  return (
    <>
      <div className="border rounded-lg bg-card text-card-foreground p-4 overflow-x-auto">
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] min-w-[800px]">
          {/* Time column */}
          <div className="text-xs text-muted-foreground">
            {timeSlots.map(time => (
              <div key={time} className="h-16 flex items-start -mt-2">
                {time}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map(day => (
            <div key={day} className="relative border-l">
              <h3 className="text-center font-semibold py-2 border-b">{day}</h3>
              <div className="relative h-[calc(11*4rem)]">
                {/* Grid lines */}
                {timeSlots.slice(1).map(time => (
                    <div key={time} className="h-16 border-t"></div>
                ))}
                
                {/* Entries */}
                {entries
                  .filter(entry => entry.day === day)
                  .map(entry => {
                    const course = getCourse(entry.courseId);
                    return (
                        <button
                            key={entry.id}
                            onClick={() => setSelectedEntry(entry)}
                            className="absolute w-full text-left p-2 rounded-lg text-white overflow-hidden transition-shadow hover:shadow-lg"
                            style={getEntryStyle(entry)}
                        >
                            <p className="font-bold text-xs leading-tight">{course?.name}</p>
                            <p className="text-xs leading-tight">{entry.startTime} - {entry.endTime}</p>
                            <p className="text-xs leading-tight truncate">{entry.location}</p>
                        </button>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedEntry && (
        <EditTimetableEntry
            entry={selectedEntry}
            courses={courses}
            isOpen={!!selectedEntry}
            onOpenChange={(isOpen) => !isOpen && setSelectedEntry(null)}
            onUpdateEntry={onUpdateEntry}
            onDeleteEntry={onDeleteEntry}
        />
      )}
    </>
  );
}
