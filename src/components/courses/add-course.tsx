'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { CourseForm } from './course-form';
import { Course } from '@/lib/types';

type AddCourseProps = {
  onAddCourse: (course: Omit<Course, 'id' | 'color'>) => void;
};

export function AddCourse({ onAddCourse }: AddCourseProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (values: any) => {
    onAddCourse(values);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2" />
          Add Course
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add a New Course</SheetTitle>
          <SheetDescription>
            Enter the details for your new course.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <CourseForm onSubmit={handleSubmit} submitButtonText="Add Course" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
