'use client';

import { Blocks, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFlashcards } from './flashcards-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function FlashcardsPage() {
    const { flashcardSets, deleteFlashcardSet, loading } = useFlashcards();
    const router = useRouter();

    const handleDelete = (e: React.MouseEvent, setId: string) => {
        e.preventDefault();
        e.stopPropagation();
        deleteFlashcardSet(setId);
    }

  return (
    <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Blocks className="w-10 h-10 text-primary"/>
            </div>
            <h1 className="text-4xl font-bold font-headline">Your Flashcard Sets</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
                Review your generated flashcards. Select a set to start studying, or generate new ones from your notes.
            </p>
        </div>

        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        ) : flashcardSets.length === 0 ? (
            <Card className="text-center py-16">
                <CardContent>
                    <h3 className="text-xl font-semibold">No Flashcards Yet</h3>
                    <p className="text-muted-foreground mt-2">Go to your notes to generate your first set of flashcards!</p>
                    <Link href="/notes">
                        <Button className="mt-4">Go to Notes</Button>
                    </Link>
                </CardContent>
            </Card>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flashcardSets.map(set => (
                    <AlertDialog key={set.id}>
                        <Card 
                            className="flex flex-col hover:border-primary transition-colors cursor-pointer"
                            onClick={() => router.push(`/ai-tools/flashcards/${set.id}`)}
                        >
                            <CardHeader>
                                <CardTitle>{set.title}</CardTitle>
                                <CardDescription>{set.cards.length} cards</CardDescription>
                            </CardHeader>
                            <CardFooter className="mt-auto">
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                                        <Trash2 className="mr-2"/> Delete
                                    </Button>
                                </AlertDialogTrigger>
                            </CardFooter>
                        </Card>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This will permanently delete the flashcard set titled "{set.title}".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={(e) => handleDelete(e, set.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ))}
            </div>
        )}
    </div>
  );
}
