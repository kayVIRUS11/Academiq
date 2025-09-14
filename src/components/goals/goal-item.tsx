'use client';

import { useState } from 'react';
import { Goal } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Edit, MoreVertical, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditGoal } from './edit-goal';

type GoalItemProps = {
  goal: Goal;
  onUpdate: (goal: Goal) => void;
  onDelete: (id: string) => void;
};

export function GoalItem({ goal, onUpdate, onDelete }: GoalItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{goal.title}</CardTitle>
              <CardDescription>
                {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} Goal
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
                <DropdownMenuItem onSelect={() => onDelete(goal.id)} className="text-destructive">
                  <Trash className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-muted-foreground">Progress</span>
              <span className="text-sm font-mono text-muted-foreground">{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} />
          </div>
        </CardContent>
      </Card>
      <EditGoal
        goal={goal}
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        onUpdateGoal={onUpdate}
      />
    </>
  );
}
