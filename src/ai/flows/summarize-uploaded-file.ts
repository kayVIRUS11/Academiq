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
  summary: z.string().describe('Concise summary of the file content.'),
});

export type SummarizeUploadedFileOutput = z.infer<typeof SummarizeUploadedFileOutputSchema>;

export async function summarizeUploadedFile(input: SummarizeUploadedFileInput): Promise<SummarizeUploadedFileOutput> {
  return summarizeUploadedFileFlow(input);
}

const summarizeUploadedFilePrompt = ai.definePrompt({
  name: 'summarizeUploadedFilePrompt',
  input: {schema: SummarizeUploadedFileInputSchema},
  output: {schema: SummarizeUploadedFileOutputSchema},
  prompt: `You are an expert summarizer. Please provide a concise summary of the following document content, no more than 3 paragraphs.\n\nDocument Type: {{{fileType}}}\nContent: {{{fileContent}}}`,
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
