
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

const ContentPartSchema = z.union([
  z.object({ text: z.string() }),
  z.object({ media: z.object({ url: z.string() }) }),
]);

const SummarizeUploadedFileInputSchema = z.object({
  parts: z.array(ContentPartSchema).describe('An array of text and media parts from the document.'),
  fileType: z.string().describe('Type of the uploaded file (PDF, pptx, txt).'),
  summaryType: z.enum(['quick', 'standard', 'deep']).optional().default('standard').describe('The desired level of summary detail.'),
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
  prompt: `You are an expert academic assistant and summarizer for university students. Your task is to create a study guide from the uploaded document based on the user's requested summary type.

{{#if (eq summaryType 'quick')}}
Your instructions are to create a **Quick Summary**.
- Extract only the most critical key points.
- The output MUST be a single bulleted list.
- Be extremely concise. The entire response must not exceed 200 words.
{{else}}
Your instructions are to create a **Standard Summary**.
- Create a complete, structured, and easy-to-use study guide.
- Break content into clear **Headings, Subheadings, and Bullet Points**.
- Highlight **key definitions, formulas, examples, and important concepts** using Markdown bolding.
- Analyze any images (charts, diagrams, etc.) and incorporate their meaning into the summary.
- Maintain the document's original structure where it makes sense.
- At the very end of your response, provide a section titled \`## Key Takeaways\` that captures the most critical points of the whole document in under 200 words.
- You must summarize the entire document. Do not stop midway. If the document is very long, be more concise to ensure your entire response fits.
{{/if}}

Document Type: {{{fileType}}}
Content:
{{#each parts}}
  {{#if this.text}}
    {{{this.text}}}
  {{/if}}
  {{#if this.media}}
    {{media url=this.media.url}}
  {{/if}}
{{/each}}

---

Now, generate the complete study guide based on all the rules and content above. Place your entire response in the 'summary' output field.

{{{output.summary}}}
`,
});


const summarizeUploadedFileFlow = ai.defineFlow({
    name: 'summarizeUploadedFileFlow',
    inputSchema: SummarizeUploadedFileInputSchema,
    outputSchema: SummarizeUploadedFileOutputSchema,
  },
  async input => {
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const {output} = await summarizeUploadedFilePrompt(input);
        return output!;
      } catch (error: any) {
        attempt++;
        if (attempt >= maxRetries) {
          console.error("Final attempt failed:", error);
          throw new Error("The AI model is currently overloaded. Please try again in a few moments.");
        }
        console.log(`Attempt ${attempt} failed. Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    // This part should not be reachable, but it satisfies TypeScript's need for a return path.
    throw new Error("The AI model failed to respond after multiple attempts.");
  }
);
