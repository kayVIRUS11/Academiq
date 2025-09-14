'use client';

import { useState } from 'react';
import { Timer } from 'lucide-react';
import { mockStudySessions, mockCourses } from '@/lib/mock-data';
import { StudySession } from '@/lib/types';
import { AddStudySession } from '@/components/study-tracker/add-study-session';
import { StudySessionList } from '@/components/study-tracker/study-session-list';
import { Course } from '@/lib/types';

export default function StudyTrackerPage() {
  const [sessions, setSessions] = useState<StudySession[]>(mockStudySessions);
  const [courses] = useState<Course[]>(mockCourses);

  const handleAddSession = (newSessionData: Omit<StudySession, 'id'>) => {
    setSessions(prev => [
      ...prev,
      {
        ...newSessionData,
        id: (prev.length + 1).toString(),
      },
    ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleUpdateSession = (updatedSession: StudySession) => {
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <Timer className="w-8 h-8" />
          Study Tracker
        </h1>
        <AddStudySession courses={courses} onAddSession={handleAddSession} />
      </div>

      <StudySessionList
        sessions={sessions}
        courses={courses}
        onUpdateSession={handleUpdateSession}
        onDeleteSession={handleDeleteSession}
      />
    </div>
  );
}
