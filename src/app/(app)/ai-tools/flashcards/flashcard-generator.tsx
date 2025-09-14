'use client';
import { generateFlashcards as generateFlashcardsFlow, GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Loader2, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

type Flashcard = GenerateFlashcardsOutput['flashcards'][0];

export function FlashcardGenerator() {
  const [notes, setNotes] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!notes.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some notes to generate flashcards.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setFlashcards([]);
    try {
      const result = await generateFlashcardsFlow({ notes });
      setFlashcards(result.flashcards);
      toast({
        title: 'Success!',
        description: `Generated ${result.flashcards.length} flashcards.`,
      });
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate flashcards. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  function Flashcard({ card }: { card: Flashcard }) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
      <div className="w-full h-64 [perspective:1000px]" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={cn("relative w-full h-full [transform-style:preserve-3d] transition-transform duration-500", isFlipped ? '[transform:rotateY(180deg)]' : '')}>
          <div className="absolute w-full h-full [backface-visibility:hidden]">
            <Card className="w-full h-full flex flex-col items-center justify-center p-6 bg-secondary">
                <p className="text-muted-foreground text-sm mb-2">Question</p>
                <p className="text-lg text-center font-semibold">{card.question}</p>
            </Card>
          </div>
          <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <Card className="w-full h-full flex flex-col items-center justify-center p-6 bg-primary/20">
                <p className="text-muted-foreground text-sm mb-2">Answer</p>
                <p className="text-lg text-center font-semibold">{card.answer}</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Textarea
          placeholder="Paste your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={10}
          disabled={isLoading}
        />
      </div>
      <Button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Flashcards
          </>
        )}
      </Button>

      {flashcards.length > 0 && (
        <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4 font-headline">Your Flashcards</h3>
            <Carousel className="w-full max-w-xl mx-auto">
                <CarouselContent>
                    {flashcards.map((card, index) => (
                        <CarouselItem key={index}>
                            <Flashcard card={card} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
      )}
    </div>
  );
}
