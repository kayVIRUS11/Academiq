
'use client';

import { Course } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';

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
    
    const { courseCode, ...rest } = newCourseData;
    const { data, error } = await supabase.from('courses').insert({ ...rest, course_code: courseCode, uid: user.id }).select();
    
    if (error) {
      console.error(error);
      toast({ title: 'Error adding course', variant: 'destructive' });
    } else {
        toast({ title: 'Course added!' });
        fetchCourses();
    }
  };

  const updateCourse = async (id: string, updatedData: Partial<Omit<Course, 'id' | 'uid'>>) => {
    const { courseCode, ...rest } = updatedData;
    const { error } = await supabase.from('courses').update({ ...rest, course_code: courseCode }).eq('id', id);
    
    if (error) {
      console.error(error);
      toast({ title: 'Error updating course', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Course updated!' });
      setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } as Course : c));
    }
  }

  const deleteCourse = async (id: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) {
        console.error(error);
        toast({ title: 'Error deleting course', description: error.message, variant: 'destructive' });
    } else {
        toast({ title: 'Course deleted!' });
        setCourses(prev => prev.filter(c => c.id !== id));
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
