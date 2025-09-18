
'use server';
/**
 * @fileOverview An AI tool to summarize large documents by chunking them.
 *
 * This flow is designed to handle documents that may be too large for a single
 * AI prompt. It works in three stages:
 * 1. Chunk: The input text is split into smaller, manageable chunks.
 * 2. Summarize: Each chunk is summarized individually in parallel.
 * 3. Synthesize: The individual summaries are combined into a final, coherent summary.
 *
 * - generateChunkedSummary - The main function to trigger the flow.
 * - GenerateChunkedSummaryInput - Input type for the function.
 * - GenerateChunkedSummaryOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ContentPartSchema = z.union([
  z.object({text: z.string()}),
  z.object({media: z.object({url: z.string()})}),
]);

const GenerateChunkedSummaryInputSchema = z.object({
  parts: z
    .array(ContentPartSchema)
    .describe('An array of text and media parts from the document.'),
  fileType: z.string().describe('Type of the uploaded file (PDF, pptx, txt).'),
});
export type GenerateChunkedSummaryInput = z.infer<
  typeof GenerateChunkedSummaryInputSchema
>;

const GenerateChunkedSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A structured study guide summary of the file content in Markdown format.'
    ),
});
export type GenerateChunkedSummaryOutput = z.infer<
  typeof GenerateChunkedSummaryOutputSchema
>;

export async function generateChunkedSummary(
  input: GenerateChunkedSummaryInput
): Promise<GenerateChunkedSummaryOutput> {
  return generateChunkedSummaryFlow(input);
}

// Prompt to summarize a single chunk of text.
const summarizeChunkPrompt = ai.definePrompt({
  name: 'summarizeChunkPrompt',
  input: {schema: z.object({chunkText: z.string()})},
  output: {schema: z.object({chunkSummary: z.string()})},
  prompt: `You are a part of a multi-stage summarization pipeline. Your current task is to summarize the following chunk of text from a larger document. Extract the key points, concepts, and any important information. The output of this summary will be used in a later stage to build a final, comprehensive summary.

Provide a concise but thorough summary of this text chunk:

{{{chunkText}}}
`,
});

// Prompt to synthesize the final summary from a collection of chunk summaries.
const synthesizeSummariesPrompt = ai.definePrompt({
  name: 'synthesizeSummariesPrompt',
  input: {schema: z.object({chunkSummaries: z.array(z.string())})},
  output: {schema: GenerateChunkedSummaryOutputSchema},
  prompt: `You are the final stage in a summarization pipeline. You will be given a series of summaries, each corresponding to a chunk of a larger document. Your task is to synthesize these individual summaries into a single, final, coherent, and well-structured study guide in Markdown format.

Follow these rules strictly:
- Create a single, unified document. Do not just list the summaries.
- Organize the content logically with headings, subheadings, and bullet points.
- Ensure a natural flow between topics.
- Highlight key definitions, formulas, and important concepts using Markdown bolding.
- At the very end, provide a section titled '## Key Takeaways' that captures the most critical points of the entire document in under 200 words.

Here are the summaries from each part of the document:
{{#each chunkSummaries}}
---
Summary of Part {{add @index 1}}:
{{{this}}}
---
{{/each}}

Now, generate the complete and final study guide.
{{{output.summary}}}
`,
});

const generateChunkedSummaryFlow = ai.defineFlow(
  {
    name: 'generateChunkedSummaryFlow',
    inputSchema: GenerateChunkedSummaryInputSchema,
    outputSchema: GenerateChunkedSummaryOutputSchema,
  },
  async (input) => {
    const CHUNK_SIZE = 30000; // Characters per chunk (approx. 7.5k tokens)

    // 1. CHUNK STAGE
    const fullText = input.parts
      .map((part) => ('text' in part ? part.text : ''))
      .join('\n\n');
    
    if (!fullText.trim()) {
      throw new Error("Document appears to be empty or contains no text.");
    }

    const chunks: string[] = [];
    for (let i = 0; i < fullText.length; i += CHUNK_SIZE) {
      chunks.push(fullText.substring(i, i + CHUNK_SIZE));
    }

    // 2. SUMMARIZE STAGE (in parallel)
    const chunkSummaryPromises = chunks.map(async (chunk) => {
      const maxRetries = 3;
      let attempt = 0;
      while (attempt < maxRetries) {
          try {
              const { output } = await summarizeChunkPrompt({ chunkText: chunk });
              return output?.chunkSummary || '';
          } catch (error) {
              attempt++;
              if (attempt >= maxRetries) {
                  console.error('Final attempt to summarize chunk failed:', error);
                  // Return empty string or re-throw, depending on desired behavior.
                  // For now, we'll let it fail silently for this chunk to not stop the whole process.
                  return ''; 
              }
              console.log(`Attempt ${attempt} to summarize chunk failed. Retrying in 2 seconds...`);
              await new Promise((resolve) => setTimeout(resolve, 2000));
          }
      }
      return ''; // Should be unreachable
    });

    const chunkSummaries = await Promise.all(chunkSummaryPromises);

    // 3. SYNTHESIZE STAGE
    const {output} = await synthesizeSummariesPrompt({
      chunkSummaries: chunkSummaries.filter(Boolean), // Filter out any empty summaries
    });

    return output!;
  }
);
