'use client';

import { useState } from 'react';
import { Course } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, MoreVertical, Trash, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EditCourse } from './edit-course';

type CourseItemProps = {
  course: Course;
  onUpdate: (course: Course) => void;
  onDelete: (id: string) => void;
};

export function CourseItem({ course, onUpdate, onDelete }: CourseItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="flex-1 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>
                {course.courseCode}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                  <Edit className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                  <Trash className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        {course.instructor && (
            <CardContent>
                <p className="text-sm text-muted-foreground">Taught by {course.instructor}</p>
            </CardContent>
        )}
      </Card>

      <EditCourse
        course={course}
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        onUpdateCourse={onUpdate}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(course.id)} className="bg-destructive hover:bg-destructive/90">
              Yes, delete course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
