
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating flashcards from notes.
 *
 * - generateFlashcards - A function that takes notes as input and returns a set of flashcards.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  notes: z.string().describe('The notes to generate flashcards from.'),
  title: z.string().describe('The title of the notes document.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(z.object({
    question: z.string().describe('The question on the flashcard.'),
    answer: z.string().describe('The answer on the flashcard.'),
  })).describe('A list of flashcards generated from the notes.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an expert educator. Your task is to generate high-quality flashcards from the given notes.

  Document Title: {{{title}}}
  Notes:
  {{{notes}}}

  Generate a list of flashcards that cover the most important key concepts, definitions, and facts from the notes. Each flashcard must have a clear question and a concise, accurate answer.

  Focus on creating questions that test understanding, not just rote memorization.

  Output the flashcards in the specified JSON format.
`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (error: any) {
        attempt++;
        if (attempt >= maxRetries) {
          console.error('Final attempt failed:', error);
          throw new Error('The AI model is currently overloaded. Please try again in a few moments.');
        }
        console.log(`Attempt ${attempt} failed. Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    throw new Error('The AI model failed to respond after multiple attempts.');
  }
);
