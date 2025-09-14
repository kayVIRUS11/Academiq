import { Course } from '@/lib/types';
import { CourseItem } from './course-item';

type CourseListProps = {
  courses: Course[];
  onUpdateCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
};

export function CourseList({ courses, onUpdateCourse, onDeleteCourse }: CourseListProps) {

  return (
    <div className="space-y-8">
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseItem key={course.id} course={course} onUpdate={onUpdateCourse} onDelete={onDeleteCourse} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">No courses yet. Add one to get started!</p>
        )}
    </div>
  );
}
