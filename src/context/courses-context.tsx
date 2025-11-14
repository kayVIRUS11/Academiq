
'use client';

import { Course } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useFirebase } from '@/firebase';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';


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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { firestore } = useFirebase();

  useEffect(() => {
    if (!user || !firestore) {
      setCourses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(firestore, 'users', user.uid, 'courses'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(coursesData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching courses:", error);
        toast({ title: 'Error loading courses', description: error.message, variant: 'destructive'});
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore, toast]);

  
  const addCourse = async (newCourseData: Omit<Course, 'id' | 'uid'>) => {
    if (!user || !firestore) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    
    try {
      const coursesCollection = collection(firestore, 'users', user.uid, 'courses');
      await addDoc(coursesCollection, { ...newCourseData, uid: user.id });
      toast({ title: 'Course added!' });
    } catch(error: any) {
      console.error(error);
      toast({ title: 'Error adding course', description: error.message, variant: 'destructive' });
    }
  };

  const updateCourse = async (id: string, updatedData: Partial<Omit<Course, 'id' | 'uid'>>) => {
    if (!user || !firestore) return;
    try {
        const courseDoc = doc(firestore, 'users', user.uid, 'courses', id);
        await updateDoc(courseDoc, updatedData);
        toast({ title: 'Course updated!' });
    } catch(error: any) {
      console.error(error);
      toast({ title: 'Error updating course', description: error.message, variant: 'destructive' });
    }
  }

  const deleteCourse = async (id: string) => {
    if (!user || !firestore) return;
    try {
        const courseDoc = doc(firestore, 'users', user.uid, 'courses', id);
        await deleteDoc(courseDoc);
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
