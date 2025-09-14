'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Course } from '@/lib/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const courseFormSchema = z.object({
  name: z.string().min(3, { message: 'Course name must be at least 3 characters.' }),
  instructor: z.string().min(3, { message: 'Instructor name must be at least 3 characters.' }),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

type CourseFormProps = {
  onSubmit: (values: CourseFormValues) => void;
  defaultValues?: Partial<Course>;
  submitButtonText?: string;
};

export function CourseForm({
  onSubmit,
  defaultValues,
  submitButtonText = 'Save Course',
}: CourseFormProps) {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      instructor: defaultValues?.instructor ?? '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Quantum Physics" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="instructor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructor Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Dr. Alistair Finch" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{submitButtonText}</Button>
      </form>
    </Form>
  );
}
