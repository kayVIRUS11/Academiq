'use client';

import { Course } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CourseForm } from './course-form';

type EditCourseProps = {
  course: Course;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateCourse: (course: Course) => void;
};

export function EditCourse({ course, isOpen, onOpenChange, onUpdateCourse }: EditCourseProps) {
  const handleSubmit = (values: any) => {
    onUpdateCourse({ ...course, ...values });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Update the details of your course.
          </DialogDescription>
        </DialogHeader>
        <CourseForm
          onSubmit={handleSubmit}
          defaultValues={course}
          submitButtonText="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}
