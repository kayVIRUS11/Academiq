
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
  fileType: z.string().describe('Type of the uploaded file (PDF, txt).'),
});

const GenerateChunkedSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A structured study guide summary of the file content in Markdown format.'
    ),
});

export async function generateChunkedSummary(input: {
  parts: ({ text: string } | { media: { url: string } })[];
  fileType: string;
}): Promise<{ summary: string }> {
  return generateChunkedSummaryFlow(input);
}

// Prompt to summarize a single chunk of text and associated media.
const summarizeChunkPrompt = ai.definePrompt({
  name: 'summarizeChunkPrompt',
  input: {
    schema: z.object({
      parts: z.array(ContentPartSchema),
    })
  },
  output: {schema: z.object({chunkSummary: z.string()})},
  prompt: `You are a part of a multi-stage summarization pipeline. Your task is to summarize the following portion of a larger document.

### Portion Content:
{{#each parts}}
  {{#if this.text}}
    {{{this.text}}}
  {{/if}}
  {{#if this.media}}
    {{media url=this.media.url}}
  {{/if}}
{{/each}}

### Instructions:
- Extract the key points, concepts, and any important information from this portion.
- **Multimodal**: If images are provided, analyze them and incorporate their meaning.
- Provide a concise but thorough summary. This will be used to build a final study guide.
`,
});

// Prompt to synthesize the final summary from a collection of chunk summaries.
const synthesizeSummariesPrompt = ai.definePrompt({
  name: 'synthesizeSummariesPrompt',
  input: {schema: z.object({chunkSummaries: z.array(z.string())})},
  output: {schema: GenerateChunkedSummaryOutputSchema},
  prompt: `You are the final stage in a summarization pipeline. You will be given a series of summaries, each corresponding to a portion of a larger document. Your task is to synthesize these individual summaries into a single, final, coherent, and well-structured study guide in Markdown format.

### Instructions:
- Create a single, unified document.
- Organize content logically with **Headings, Subheadings, and Bullet Points**.
- Ensure a natural flow between topics.
- Highlight **key definitions, formulas, and important concepts** using Markdown bolding.
- At the very end, provide a section titled \`## Key Takeaways\` that captures the most critical points of the entire document in under 200 words.

### Summaries to Synthesize:
{{#each chunkSummaries}}
---
Summary of Portion {{add @index 1}}:
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
    const CHUNK_SIZE = 60000; // Characters per chunk (approx. 15k tokens)

    // 1. CHUNK STAGE
    // We group parts into chunks based on text length
    const chunks: ({ text: string } | { media: { url: string } })[][] = [];
    let currentChunk: ({ text: string } | { media: { url: string } })[] = [];
    let currentChunkSize = 0;

    for (const part of input.parts) {
      const partSize = 'text' in part ? part.text.length : 0;
      
      if (currentChunkSize + partSize > CHUNK_SIZE && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentChunkSize = 0;
      }
      
      currentChunk.push(part);
      currentChunkSize += partSize;
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    if (chunks.length === 0) {
      throw new Error("Document appears to be empty or contains no content.");
    }

    // 2. SUMMARIZE STAGE (in parallel)
    const chunkSummaryPromises = chunks.map(async (chunkParts) => {
      const maxRetries = 3;
      let attempt = 0;
      while (attempt < maxRetries) {
          try {
              const { output } = await summarizeChunkPrompt({ parts: chunkParts });
              return output?.chunkSummary || '';
          } catch (error) {
              attempt++;
              if (attempt >= maxRetries) {
                  console.error('Final attempt to summarize chunk failed:', error);
                  return ''; 
              }
              console.log('Attempt ' + attempt + ' to summarize chunk failed. Retrying in 2 seconds...');
              await new Promise((resolve) => setTimeout(resolve, 2000));
          }
      }
      return '';
    });

    const chunkSummaries = await Promise.all(chunkSummaryPromises);

    // 3. SYNTHESIZE STAGE
    const {output} = await synthesizeSummariesPrompt({
      chunkSummaries: chunkSummaries.filter(Boolean),
    });

    return output!;
  }
);
