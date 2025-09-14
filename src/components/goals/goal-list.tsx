import { Goal } from '@/lib/types';
import { GoalItem } from './goal-item';

type GoalListProps = {
  goals: Goal[];
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
};

export function GoalList({ goals, onUpdateGoal, onDeleteGoal }: GoalListProps) {
  const semesterGoals = goals.filter(g => g.type === 'semester');
  const yearlyGoals = goals.filter(g => g.type === 'yearly');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Semester Goals</h2>
        {semesterGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {semesterGoals.map(goal => (
              <GoalItem key={goal.id} goal={goal} onUpdate={onUpdateGoal} onDelete={onDeleteGoal} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No semester goals yet. Add one to get started!</p>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Yearly Goals</h2>
        {yearlyGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {yearlyGoals.map(goal => (
              <GoalItem key={goal.id} goal={goal} onUpdate={onUpdateGoal} onDelete={onDeleteGoal} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No yearly goals yet.</p>
        )}
      </div>
    </div>
  );
}
