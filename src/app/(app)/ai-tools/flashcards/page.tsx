import { Blocks } from 'lucide-react';
import { FlashcardGenerator } from './flashcard-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FlashcardsPage() {
  return (
    <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Blocks className="w-10 h-10 text-primary"/>
            </div>
            <h1 className="text-4xl font-bold font-headline">AI Flashcard Generator</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
                Paste your notes below, and our AI will automatically create a set of flashcards to help you study more effectively.
            </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Generate from Notes</CardTitle>
                <CardDescription>Enter your study material to get started.</CardDescription>
            </CardHeader>
            <CardContent>
                <FlashcardGenerator />
            </CardContent>
        </Card>
    </div>
  );
}
