import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AppProviders } from '@/context/app-providers';
import { Course } from '@/lib/types';

async function getCourses(supabase: any) {
  const { data: courses } = await supabase.from('courses').select('*');
  return courses as Course[] || [];
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const courses = await getCourses(supabase);

  return (
    <AppProviders courses={courses}>
      {children}
    </AppProviders>
  );
}
