
'use client';

import { Course } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useSupabase } from '@/supabase';
import { useSupabaseRealtime } from '@/hooks/use-supabase-realtime';


type CoursesContextType = {
  courses: Course[];
  loading: boolean;
  addCourse: (newCourseData: Omit<Course, 'id' | 'uid'>) => Promise<void>;
  updateCourse: (id: string, updatedCourse: Partial<Omit<Course, 'id' | 'uid'>>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  getCourse: (id: string) => Course | undefined;
};

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const { data: courses, loading } = useSupabaseRealtime<Course>('courses', 'created_at', false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { supabase } = useSupabase();

  
  const addCourse = async (newCourseData: Omit<Course, 'id' | 'uid'>) => {
    if (!user || !supabase) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    
    try {
      const { error } = await supabase.from('courses').insert({ ...newCourseData, uid: user.id });
      if (error) throw error;
      toast({ title: 'Course added!' });
    } catch(error: any) {
      console.error(error);
      toast({ title: 'Error adding course', description: error.message, variant: 'destructive' });
    }
  };

  const updateCourse = async (id: string, updatedData: Partial<Omit<Course, 'id' | 'uid'>>) => {
    if (!user || !supabase) return;
    try {
        const { error } = await supabase.from('courses').update(updatedData).eq('id', id);
        if (error) throw error;
        toast({ title: 'Course updated!' });
    } catch(error: any) {
      console.error(error);
      toast({ title: 'Error updating course', description: error.message, variant: 'destructive' });
    }
  }

  const deleteCourse = async (id: string) => {
    if (!user || !supabase) return;
    try {
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) throw error;
        toast({ title: 'Course deleted!' });
    } catch (error: any) {
        console.error(error);
        toast({ title: 'Error deleting course', description: error.message, variant: 'destructive' });
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
