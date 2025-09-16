'use client';

import { BookCopy } from 'lucide-react';
import { Course } from '@/lib/types';
import { AddCourse } from '@/components/courses/add-course';
import { CourseList } from '@/components/courses/course-list';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';

export default function CoursesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('courses').select('*').eq('uid', user.id);
    if (error) {
      toast({ title: 'Error fetching courses', description: error.message, variant: 'destructive' });
    } else {
      setCourses(data as Course[]);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleAddCourse = async (newCourse: Omit<Course, 'id' | 'uid'>) => {
    if (!user) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    const { data, error } = await supabase.from('courses').insert({ ...newCourse, uid: user.id }).select();
    if (error) {
      console.error(error);
      toast({ title: 'Error adding course', variant: 'destructive' });
    } else {
      setCourses(prev => [...prev, data[0]]);
      toast({ title: 'Course added!' });
    }
  };

  const handleUpdateCourse = async (updatedCourse: Course) => {
    try {
      const { id, ...courseData } = updatedCourse;
      const { data, error } = await supabase.from('courses').update(courseData).eq('id', id).select();
       if (error) throw error;
      setCourses(prev => prev.map(c => c.id === id ? data[0] : c));
      toast({ title: 'Course updated!' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error updating course', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const { error } = await supabase.from('courses').delete().eq('id', courseId);
      if (error) throw error;
      setCourses(prev => prev.filter(c => c.id !== courseId));
      toast({ title: 'Course deleted!' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error deleting course', description: error.message, variant: 'destructive' });
    }
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
      
      {loading ? (
        <div className="border rounded-lg p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <CourseList 
          courses={courses} 
          onUpdateCourse={handleUpdateCourse} 
          onDeleteCourse={handleDeleteCourse}
        />
      )}
    </div>
  );
}
