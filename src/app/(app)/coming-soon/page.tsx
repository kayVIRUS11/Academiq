import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MoreHorizontal, Construction } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="space-y-6 flex flex-col items-center text-center">
        <div className="bg-primary/10 p-3 rounded-full mb-4">
            <Construction className="w-10 h-10 text-primary"/>
        </div>
        <h1 className="text-4xl font-bold font-headline">More Features Are on the Way!</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
            We're working hard to bring you even more tools to supercharge your studies. Stay tuned for exciting new updates.
        </p>
    </div>
  );
}
