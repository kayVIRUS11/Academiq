import { GoalsOverview } from "@/components/dashboard/goals-overview";
import { PomodoroCard } from "@/components/dashboard/pomodoro-card";
import { TasksDueToday } from "@/components/dashboard/tasks-due-today";
import { TodaysSchedule } from "@/components/dashboard/todays-schedule";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { WeeklyStudyChart } from "@/components/dashboard/weekly-study-chart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WelcomeBanner />
        <PomodoroCard />
        <TasksDueToday />
        <WeeklyStudyChart />
        <TodaysSchedule />
        <GoalsOverview />
      </div>
    </div>
  );
}
