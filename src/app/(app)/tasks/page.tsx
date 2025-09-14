import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListTodo } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                <ListTodo className="w-8 h-8"/>
                Task Management
            </h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Organize your tasks by deadlines, priorities, and courses.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This feature is under construction. Soon you will be able to add, view, and filter all your academic tasks.</p>
        </CardContent>
      </Card>
    </div>
  );
}
