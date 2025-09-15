'use client';

import { BookCopy } from 'lucide-react';
import { Course } from '@/lib/types';
import { AddCourse } from '@/components/courses/add-course';
import { CourseList } from '@/components/courses/course-list';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';

export default function CoursesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const coursesQuery = user ? query(collection(db, 'courses'), where('uid', '==', user.uid)) : null;
  const [coursesSnapshot, loading, error] = useCollection(coursesQuery);

  const courses: Course[] = loading || !coursesSnapshot 
    ? [] 
    : coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));

  const handleAddCourse = async (newCourse: Omit<Course, 'id' | 'uid'>) => {
    if (!user) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    try {
      await addDoc(collection(db, 'courses'), { ...newCourse, uid: user.uid });
      toast({ title: 'Course added!' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error adding course', variant: 'destructive' });
    }
  };

  const handleUpdateCourse = async (updatedCourse: Course) => {
    try {
      const courseRef = doc(db, 'courses', updatedCourse.id);
      const { id, ...courseData } = updatedCourse;
      await updateDoc(courseRef, courseData);
      toast({ title: 'Course updated!' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error updating course', variant: 'destructive' });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      toast({ title: 'Course deleted!' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error deleting course', variant: 'destructive' });
    }
  };
  
  if (error) {
    return <p className="text-destructive">Error: {error.message}</p>
  }

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
