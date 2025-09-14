'use client';

import { useState } from 'react';
import { Course } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, MoreVertical, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditCourse } from './edit-course';

type CourseItemProps = {
  course: Course;
  onUpdate: (course: Course) => void;
  onDelete: (id: string) => void;
};

export function CourseItem({ course, onUpdate, onDelete }: CourseItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription>
                {course.instructor}
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
                <DropdownMenuItem onSelect={() => onDelete(course.id)} className="text-destructive">
                  <Trash className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Card>
      <EditCourse
        course={course}
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        onUpdateCourse={onUpdate}
      />
    </>
  );
}
