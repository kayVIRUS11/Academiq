'use client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { useFlashcards } from './flashcards-context';
import Link from 'next/link';

export function FlashcardGenerator() {
  const { flashcards } = useFlashcards();

  function Flashcard({ card }: { card: { question: string, answer: string } }) {
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

  if (!flashcards || flashcards.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-4 p-8 border-dashed border-2 rounded-lg h-80">
            <BookOpen className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Flashcards Generated</h3>
            <p className="text-muted-foreground">Go to your notes to generate a new set of flashcards.</p>
            <Link href="/notes">
                <Button>Go to Notes</Button>
            </Link>
        </div>
    )
  }

  return (
    <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4 font-headline text-center">Your Flashcards</h3>
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
  );
}
