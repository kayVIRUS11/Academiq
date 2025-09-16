
'use client';

import { BookCopy } from 'lucide-react';
import { Course } from '@/lib/types';
import { AddCourse } from '@/components/courses/add-course';
import { CourseList } from '@/components/courses/course-list';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourses } from '@/context/courses-context';

export default function CoursesPage() {
  const { courses, addCourse, updateCourse, deleteCourse, loading } = useCourses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <BookCopy className="w-8 h-8" />
          Course Management
        </h1>
        <AddCourse onAddCourse={addCourse} />
      </div>
      
      {loading ? (
        <div className="border rounded-lg p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <CourseList 
          courses={courses} 
          onUpdateCourse={updateCourse} 
          onDeleteCourse={deleteCourse}
        />
      )}
    </div>
  );
}
