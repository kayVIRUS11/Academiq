'use client';

import { useState } from 'react';
import { BookCopy } from 'lucide-react';
import { mockCourses } from '@/lib/mock-data';
import { Course } from '@/lib/types';
import { AddCourse } from '@/components/courses/add-course';
import { CourseList } from '@/components/courses/course-list';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);

  const handleAddCourse = (newCourse: Omit<Course, 'id' | 'color'>) => {
    const colorClasses = ['bg-blue-200', 'bg-purple-200', 'bg-green-200', 'bg-yellow-200', 'bg-red-200', 'bg-pink-200'];
    const randomColor = colorClasses[Math.floor(Math.random() * colorClasses.length)];

    setCourses(prev => [
      ...prev,
      {
        ...newCourse,
        id: (prev.length + 1).toString(),
        color: randomColor,
      },
    ]);
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <BookCopy className="w-8 h-8" />
          Course Management
        </h1>
        <AddCourse onAddCourse={handleAddCourse} />
      </div>

      <CourseList 
        courses={courses} 
        onUpdateCourse={handleUpdateCourse} 
        onDeleteCourse={handleDeleteCourse}
      />
    </div>
  );
}
