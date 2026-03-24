'use server';
/**
 * @fileOverview AI tool to summarize user-uploaded files (PDF, txt).
 *
 * - summarizeUploadedFile - Summarizes the content of an uploaded file.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentPartSchema = z.union([
  z.object({ text: z.string() }),
  z.object({ media: z.object({ url: z.string() }) }),
]);

const SummarizeUploadedFileInputSchema = z.object({
  parts: z.array(ContentPartSchema).describe('An array of text and media parts from the document.'),
  fileType: z.string().describe('Type of the uploaded file (PDF, txt).'),
  summaryType: z.enum(['quick', 'standard', 'deep']).optional().default('standard').describe('The desired level of summary detail.'),
});

const SummarizeUploadedFileOutputSchema = z.object({
  summary: z.string().describe('A structured study guide summary of the file content in Markdown format.'),
});

export async function summarizeUploadedFile(input: {
  parts: ({ text: string } | { media: { url: string } })[];
  fileType: string;
  summaryType?: 'quick' | 'standard' | 'deep';
}): Promise<{ summary: string }> {
  return summarizeUploadedFileFlow({
    ...input,
    summaryType: input.summaryType || 'standard',
  });
}

const summarizeUploadedFilePrompt = ai.definePrompt({
  name: 'summarizeUploadedFilePrompt',
  input: {schema: SummarizeUploadedFileInputSchema},
  output: {schema: SummarizeUploadedFileOutputSchema},
  prompt: `You are an expert academic assistant and summarizer for university students. Your task is to create a structured study guide from the uploaded document.

### Context:
- Document Type: {{{fileType}}}
- Summary Type: {{summaryType}}

### Instructions:
{{#if (eq summaryType 'quick')}}
- Create a **Quick Summary**.
- Extract only the most critical key points.
- Output MUST be a concise bulleted list.
- Be extremely brief (under 200 words).
{{else}}
- Create a **Standard Study Guide**.
- Use a clear structure with **Headings, Subheadings, and Bullet Points**.
- Highlight **key definitions, formulas, and important concepts** using Markdown bolding.
- **Multimodal Analysis**: If images (charts, diagrams, etc.) are provided, analyze them and incorporate their insights directly into the relevant sections.
- At the very end, provide a section titled \`## Key Takeaways\` summarizing the most critical points in under 200 words.
{{/if}}

### Content to Summarize:
{{#each parts}}
  {{#if this.text}}
    {{{this.text}}}
  {{/if}}
  {{#if this.media}}
    {{media url=this.media.url}}
  {{/if}}
{{/each}}

---

Now, generate the complete study guide based on the rules and content above.
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
    throw new Error("The AI model failed to respond after multiple attempts.");
  }
);
