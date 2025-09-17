
'use client';

import { Course } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { queueRequest } from '@/lib/offline-sync';

type CoursesContextType = {
  courses: Course[];
  loading: boolean;
  addCourse: (newCourseData: Omit<Course, 'id' | 'uid'>) => Promise<void>;
  updateCourse: (id: string, updatedCourse: Partial<Omit<Course, 'id' | 'uid'>>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  getCourse: (id: string) => Course | undefined;
};

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export function CoursesProvider({ children, initialCourses }: { children: ReactNode, initialCourses: Course[] }) {
  const [courses, setCourses] = useState<Course[]>(initialCourses || []);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isOnline = useOnlineStatus();

  const fetchCourses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('courses').select('*').eq('uid', user.id);
    if (error) {
      toast({ title: 'Error loading courses', description: error.message, variant: 'destructive'});
    } else {
      setCourses(data.map(c => ({...c, courseCode: c.course_code})) as Course[]);
    }
    setLoading(false);
  }, [user, toast]);

  
  const addCourse = async (newCourseData: Omit<Course, 'id' | 'uid'>) => {
    if (!user) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }

    const tempId = `temp-${Date.now()}`;
    const newCourse: Course = { ...newCourseData, id: tempId, uid: user.id };

    setCourses(prev => [...prev, newCourse]);
    toast({ title: 'Course added!' });

    if (!isOnline) {
      const { courseCode, ...rest } = newCourseData;
      const body = { ...rest, course_code: courseCode, uid: user.id };
      await queueRequest(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/courses`,
        'POST',
        body,
        { 
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
         }
      );
      return;
    }
    
    const { courseCode, ...rest } = newCourseData;
    const { data, error } = await supabase.from('courses').insert({ ...rest, course_code: courseCode, uid: user.id }).select();
    
    if (error) {
      console.error(error);
      toast({ title: 'Error adding course', variant: 'destructive' });
      setCourses(prev => prev.filter(c => c.id !== tempId));
    } else {
        fetchCourses();
    }
  };

  const updateCourse = async (id: string, updatedData: Partial<Omit<Course, 'id' | 'uid'>>) => {
    const originalCourses = [...courses];
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } as Course : c));

    if (!isOnline) {
        const { courseCode, ...rest } = updatedData;
        const body = { ...rest, course_code: courseCode };
        await queueRequest(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/courses?id=eq.${id}`,
            'PATCH',
            body,
            { 
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
            }
        );
        return;
    }

    const { courseCode, ...rest } = updatedData;
    const { error } = await supabase.from('courses').update({ ...rest, course_code: courseCode }).eq('id', id);
    
    if (error) {
      console.error(error);
      toast({ title: 'Error updating course', description: error.message, variant: 'destructive' });
      setCourses(originalCourses);
    } else {
      toast({ title: 'Course updated!' });
    }
  }

  const deleteCourse = async (id: string) => {
    const originalCourses = [...courses];
    setCourses(prev => prev.filter(c => c.id !== id));
    
    if (!isOnline) {
        await queueRequest(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/courses?id=eq.${id}`,
            'DELETE',
            {},
            { 
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            }
        );
        return;
    }

    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) {
        console.error(error);
        toast({ title: 'Error deleting course', description: error.message, variant: 'destructive' });
        setCourses(originalCourses);
    } else {
        toast({ title: 'Course deleted!' });
    }
  }

  const getCourse = useCallback((id: string) => {
    return courses.find(c => c.id === id);
  }, [courses]);

  return (
    <CoursesContext.Provider value={{ courses, loading, addCourse, updateCourse, deleteCourse, getCourse }}>
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CoursesContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CoursesProvider');
  }
  return context;
}
