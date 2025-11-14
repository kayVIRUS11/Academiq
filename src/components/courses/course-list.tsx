
'use client';
import { useState } from 'react';
import { Course } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { EditCourse } from './edit-course';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type CourseListProps = {
  courses: Course[];
  onUpdateCourse: (id: string, course: Partial<Omit<Course, 'id' | 'uid'>>) => void;
  onDeleteCourse: (id: string) => void;
};

export function CourseList({ courses, onUpdateCourse, onDeleteCourse }: CourseListProps) {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
  };

  const handleDelete = (id: string) => {
    onDeleteCourse(id);
    setDeletingCourseId(null);
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Name</TableHead>
              <TableHead>Course Code</TableHead>
              <TableHead>Lecturer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length > 0 ? (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: course.color}}/>
                    {course.name}
                  </TableCell>
                  <TableCell>{course.courseCode}</TableCell>
                  <TableCell>{course.instructor || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(course)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit Course</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingCourseId(course.id)} className="text-destructive hover:text-destructive">
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete Course</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No courses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editingCourse && (
        <EditCourse
          course={editingCourse}
          isOpen={!!editingCourse}
          onOpenChange={(isOpen) => !isOpen && setEditingCourse(null)}
          onUpdateCourse={(values) => onUpdateCourse(editingCourse.id, values)}
        />
      )}
      
      <AlertDialog open={!!deletingCourseId} onOpenChange={(isOpen) => !isOpen && setDeletingCourseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingCourseId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deletingCourseId!)} className="bg-destructive hover:bg-destructive/90">
              Yes, delete course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
