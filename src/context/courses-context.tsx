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
  
  const addCourse = async (newCourseData: Omit<Course, 'id' | 'uid'>) => {
    if (!user) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    setLoading(true);
    const { courseCode, ...rest } = newCourseData;
    const { data, error } = await supabase.from('courses').insert({ ...rest, course_code: courseCode, uid: user.id }).select();
    
    if (error) {
      console.error(error);
      toast({ title: 'Error adding course', variant: 'destructive' });
    } else {
      const addedCourse = data[0];
      setCourses(prev => [...prev, {...addedCourse, courseCode: addedCourse.course_code}]);
      toast({ title: 'Course added!' });
    }
    setLoading(false);
  };

  const updateCourse = async (id: string, updatedData: Partial<Omit<Course, 'id' | 'uid'>>) => {
    setLoading(true);
    const { courseCode, ...rest } = updatedData;
    const { data, error } = await supabase.from('courses').update({ ...rest, course_code: courseCode }).eq('id', id).select();
    
    if (error) {
      console.error(error);
      toast({ title: 'Error updating course', description: error.message, variant: 'destructive' });
    } else {
      const newCourse = data[0];
      setCourses(prev => prev.map(c => c.id === id ? {...newCourse, courseCode: newCourse.course_code} : c));
      toast({ title: 'Course updated!' });
    }
    setLoading(false);
  }

  const deleteCourse = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) {
        console.error(error);
        toast({ title: 'Error deleting course', description: error.message, variant: 'destructive' });
    } else {
        setCourses(prev => prev.filter(c => c.id !== id));
        toast({ title: 'Course deleted!' });
    }
    setLoading(false);
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
