import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Header } from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import { AppProviders } from '@/context/app-providers';
import { Course } from '@/lib/types';

async function getCourses(supabase: any) {
  const { data: courses } = await supabase.from('courses').select('*');
  return courses?.map((c: any) => ({ ...c, courseCode: c.course_code })) as Course[] || [];
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const courses = await getCourses(supabase);

  return (
    <AppProviders courses={courses}>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <SidebarNav />
        </aside>
        <div className="flex flex-col sm:pl-14">
          <Header />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 bg-muted/40 animate-in fade-in-50">
            {children}
          </main>
        </div>
      </div>
    </AppProviders>
  );
}
