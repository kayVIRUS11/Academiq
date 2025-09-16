import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AppProviders } from '@/context/app-providers';
import { Course } from '@/lib/types';
import { supabase } from '@/lib/supabase';

async function getCourses() {
  const { data: courses } = await supabase.from('courses').select('*');
  return courses as Course[] || [];
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const courses = await getCourses();

  return (
    <AppProviders courses={courses}>
      {children}
    </AppProviders>
  );
}
