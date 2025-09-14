'use client';

import { useState } from 'react';
import { TimetableEntry, Course } from '@/lib/types';
import { EditTimetableEntry } from './edit-timetable-entry';
import { cn } from '@/lib/utils';

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
        <div className="flex min-w-[800px]">
          {/* Time column */}
          <div className="w-16 flex-shrink-0">
             {/* Top-left empty cell */}
             <div className="h-10 border-b"></div>
             {/* Time slots */}
             {timeSlots.map((time) => (
                <div key={time} className="h-16 relative border-t">
                    <div className="text-xs text-muted-foreground absolute -top-[9px] right-2">{time}</div>
                </div>
             ))}
          </div>

          {/* Schedule Grid */}
          <div className="flex-grow grid grid-cols-5">
            {/* Day headers */}
            {days.map(day => (
                <div key={day} className="text-center font-semibold py-2 border-b border-l h-10">
                <h3>{day}</h3>
                </div>
            ))}

            {/* Day columns */}
            {days.map(day => (
                <div key={day} className="relative border-l">
                    {/* Grid lines */}
                    {timeSlots.map((time) => (
                        <div key={time} className="h-16 border-t"></div>
                    ))}
                    
                    {/* Entries */}
                    <div className="absolute inset-0">
                        {entries
                        .filter(entry => entry.day === day)
                        .map(entry => {
                            const course = getCourse(entry.courseId);
                            return (
                                <button
                                    key={entry.id}
                                    onClick={() => setSelectedEntry(entry)}
                                    className={cn(
                                        "absolute w-full text-left p-2 rounded-lg text-white overflow-hidden transition-shadow hover:shadow-lg",
                                        "opacity-80 border"
                                    )}
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
