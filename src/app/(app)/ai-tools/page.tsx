import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Bot, FileText, Blocks, BookOpen, CalendarDays } from "lucide-react";
import Link from "next/link";

const aiTools = [
    { 
        href: '/ai-tools/daily-planner', 
        icon: CalendarDays, 
        title: 'AI Daily Planner', 
        description: 'Generate a detailed daily schedule.' 
    },
    { 
        href: '/ai-tools/file-summarizer', 
        icon: FileText, 
        title: 'AI File Summarizer', 
        description: 'Get concise summaries of your documents.' 
    },
    { 
        href: '/ai-tools/flashcards', 
        icon: Blocks, 
        title: 'AI Flashcard Generator', 
        description: 'Create flashcards from your notes instantly.' 
    },
    { 
        href: '/ai-tools/study-guide', 
        icon: BookOpen, 
        title: 'AI Study Guide', 
        description: 'Generate study guides from a scheme of work.' 
    },
];

export default function AiToolsPage() {
  return (
    <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Sparkles className="w-10 h-10 text-primary"/>
            </div>
            <h1 className="text-4xl font-bold font-headline">AI-Powered Study Tools</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">Leverage artificial intelligence to boost your productivity and enhance your learning experience.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiTools.map(tool => (
                <Link href={tool.href} key={tool.href} legacyBehavior>
                    <a className="block">
                        <Card className="h-full hover:border-primary hover:shadow-lg transition-all">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <tool.icon className="w-8 h-8 text-primary" />
                                <div>
                                    <CardTitle>{tool.title}</CardTitle>
                                    <CardDescription>{tool.description}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </a>
                </Link>
            ))}
        </div>
    </div>
  );
}
