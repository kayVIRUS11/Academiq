// SummarizeUploadedFile
'use server';
/**
 * @fileOverview AI tool to summarize user-uploaded files (PDF, pptx, txt).
 *
 * - summarizeUploadedFile - Summarizes the content of an uploaded file.
 * - SummarizeUploadedFileInput - Input type for summarizeUploadedFile.
 * - SummarizeUploadedFileOutput - Output type for summarizeUploadedFile.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SummarizeUploadedFileInputSchema = z.object({
  fileContent: z.string().describe('Content of the uploaded file.'),
  fileType: z.string().describe('Type of the uploaded file (PDF, pptx, txt).'),
});

export type SummarizeUploadedFileInput = z.infer<typeof SummarizeUploadedFileInputSchema>;

const SummarizeUploadedFileOutputSchema = z.object({
  summary: z.string().describe('A structured study guide summary of the file content in Markdown format.'),
});

export type SummarizeUploadedFileOutput = z.infer<typeof SummarizeUploadedFileOutputSchema>;

export async function summarizeUploadedFile(input: SummarizeUploadedFileInput): Promise<SummarizeUploadedFileOutput> {
  return summarizeUploadedFileFlow(input);
}

const summarizeUploadedFilePrompt = ai.definePrompt({
  name: 'summarizeUploadedFilePrompt',
  input: {schema: SummarizeUploadedFileInputSchema},
  output: {schema: SummarizeUploadedFileOutputSchema},
  prompt: `You are an academic assistant for university students. 
Your task is to summarize the uploaded document into a structured, easy-to-use study guide.

Rules:
- Use clear, simple language (avoid jargon unless explained).
- Break content into **Headings, Subheadings, and Bullet Points**.
- Highlight key definitions, formulas, examples, and important concepts.
- Provide a short "Key Takeaways" section at the end.
- If the document is very long, create a **chapter-by-chapter or section-by-section summary**.
- Prioritize what would be most useful for students revising for exams.
- The output should be a single string formatted as Markdown.

Document Type: {{{fileType}}}
Content: {{{fileContent}}}`,
});

const summarizeUploadedFileFlow = ai.defineFlow({
    name: 'summarizeUploadedFileFlow',
    inputSchema: SummarizeUploadedFileInputSchema,
    outputSchema: SummarizeUploadedFileOutputSchema,
  },
  async input => {
    const {output} = await summarizeUploadedFilePrompt(input);
    return output!;
  }
);
