'use client';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { useFlashcards, FlashcardSet } from '../flashcards-context';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

function Flashcard({ card }: { card: { question: string, answer: string } }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card]);

  return (
    <div className="w-full h-64 [perspective:1000px]" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={cn("relative w-full h-full [transform-style:preserve-3d] transition-transform duration-500", isFlipped ? '[transform:rotateY(180deg)]' : '')}>
        <div className="absolute w-full h-full [backface-visibility:hidden]">
          <Card className="w-full h-full flex flex-col items-center justify-center p-6 bg-secondary">
              <p className="text-muted-foreground text-sm mb-2">Question</p>
              <p className="text-lg md:text-xl text-center font-semibold">{card.question}</p>
          </Card>
        </div>
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Card className="w-full h-full flex flex-col items-center justify-center p-6 bg-primary/20">
              <p className="text-muted-foreground text-sm mb-2">Answer</p>
              <p className="text-lg md:text-xl text-center font-semibold">{card.answer}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function FlashcardSetPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { getFlashcardSet, loading } = useFlashcards();
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null | undefined>(undefined);
  
  useEffect(() => {
    if (!loading) {
        const set = getFlashcardSet(id);
        setFlashcardSet(set);
    }
  }, [id, getFlashcardSet, loading]);

  if (flashcardSet === undefined || loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-8 w-48 mx-auto" />
            <div className="w-full max-w-xl mx-auto relative">
                <Skeleton className="w-full h-64" />
                <Skeleton className="absolute -left-12 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" />
                <Skeleton className="absolute -right-12 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full" />
            </div>
        </div>
    );
  }

  if (flashcardSet === null) {
    notFound();
  }
  
  return (
    <div className="space-y-6">
        <div className="relative flex flex-col items-center text-center">
            <Link href="/ai-tools/flashcards" className="absolute left-0 top-0">
                <Button variant="ghost">
                    <ArrowLeft className="mr-2"/>
                    Back to Sets
                </Button>
            </Link>
            <h1 className="text-4xl font-bold font-headline mt-12 md:mt-0">{flashcardSet.title}</h1>
            <p className="text-muted-foreground mt-2">
                Click on a card to flip it. Use the arrows to navigate.
            </p>
        </div>

        <Carousel className="w-full max-w-xl mx-auto">
            <CarouselContent>
                {flashcardSet.cards.map((card, index) => (
                    <CarouselItem key={index}>
                        <Flashcard card={card} />
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    </div>
  );
}
