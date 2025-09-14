'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Goal } from '@/lib/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const goalFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  type: z.enum(['semester', 'yearly']),
  progress: z.number().min(0).max(100).optional(),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

type GoalFormProps = {
  onSubmit: (values: GoalFormValues) => void;
  defaultValues?: Partial<Goal>;
  submitButtonText?: string;
};

export function GoalForm({
  onSubmit,
  defaultValues,
  submitButtonText = 'Save Goal',
}: GoalFormProps) {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      type: defaultValues?.type ?? 'semester',
      progress: defaultValues?.progress ?? 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Achieve a 3.8 GPA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a goal type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="semester">Semester</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {defaultValues?.id && ( // Only show progress for existing goals
          <FormField
            control={form.control}
            name="progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Progress: {field.value}%</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value ?? 0]}
                    onValueChange={value => field.onChange(value[0])}
                    max={100}
                    step={1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit">{submitButtonText}</Button>
      </form>
    </Form>
  );
}
