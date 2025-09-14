'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/firebase';
import { Course } from '@/lib/types';
import { collection } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';

export type FilterState = {
  status: 'all' | 'pending' | 'completed';
  priority: 'all' | 'Low' | 'Medium' | 'High';
  course: 'all' | string;
};

type TaskFiltersProps = {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
};

export function TaskFilters({ filters, onFilterChange }: TaskFiltersProps) {
  const [coursesSnapshot] = useCollection(collection(db, 'courses'));
  const courses = coursesSnapshot?.docs.map(d => ({id: d.id, ...d.data()})) as Course[] || [];

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Tabs
        value={filters.status}
        onValueChange={(value) => onFilterChange({ status: value as FilterState['status'] })}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex gap-4">
        <Select
          value={filters.priority}
          onValueChange={(value) =>
            onFilterChange({ priority: value as FilterState['priority'] })
          }
        >
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.course}
          onValueChange={(value) => onFilterChange({ course: value })}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
