
'use server';

/**
 * @fileOverview A flow to generate a study guide for a course based on a scheme of work.
 *
 * - generateStudyGuide - A function that handles the study guide generation process.
 * - GenerateStudyGuideInput - The input type for the generateStudyGuide function.
 * - GenerateStudyGuideOutput - The return type for the generateStudyGuide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudyGuideInputSchema = z.object({
  schemeOfWorkDataUri: z
    .string()
    .describe(
      "A scheme of work document for a course, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  courseName: z.string().describe('The name of the course.'),
});
export type GenerateStudyGuideInput = z.infer<typeof GenerateStudyGuideInputSchema>;

const GenerateStudyGuideOutputSchema = z.object({
  studyGuide: z.string().describe('The generated study guide for the course in Markdown format.'),
});
export type GenerateStudyGuideOutput = z.infer<typeof GenerateStudyGuideOutputSchema>;

export async function generateStudyGuide(input: GenerateStudyGuideInput): Promise<GenerateStudyGuideOutput> {
  return generateStudyGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudyGuidePrompt',
  input: {schema: GenerateStudyGuideInputSchema},
  output: {schema: GenerateStudyGuideOutputSchema},
  prompt: `You are an expert tutor, creating a detailed, week-by-week study guide for a university student.

  Based on the provided course syllabus, generate a comprehensive study plan that spans a typical 12-14 week semester. Break down topics, suggest study activities, and allocate time appropriately. End with a "Finals Preparation" section.

  Rules:
  - The output must be a single string formatted as Markdown.
  - Use headings for each week (e.g., "### Week 1: Introduction to...").
  - Use bullet points for weekly topics and suggested tasks.
  - Be practical and encouraging.

  Course Name: {{{courseName}}}
  Syllabus/Scheme of Work: {{media url=schemeOfWorkDataUri}}

  Generate the study guide now.
  `,
});

const generateStudyGuideFlow = ai.defineFlow(
  {
    name: 'generateStudyGuideFlow',
    inputSchema: GenerateStudyGuideInputSchema,
    outputSchema: GenerateStudyGuideOutputSchema,
  },
  async (input) => {
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const { output } = await prompt(input);
        return output!;
      } catch (error: any) {
        attempt++;
        if (attempt >= maxRetries) {
          console.error('Final attempt failed:', error);
          throw new Error(
            'The AI model is currently overloaded. Please try again in a few moments.'
          );
        }
        console.log(`Attempt ${attempt} failed. Retrying in 2 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    // This part should not be reachable, but it satisfies TypeScript's need for a return path.
    throw new Error('The AI model failed to respond after multiple attempts.');
  }
);
