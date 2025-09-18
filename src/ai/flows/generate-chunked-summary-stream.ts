
'use server';
/**
 * @fileOverview A streaming AI tool to summarize large documents by chunking them.
 *
 * This flow is designed to handle documents that may be too large for a single
 * AI prompt and provides real-time progress updates to the client.
 *
 * - generateChunkedSummaryStream - The main function to trigger the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ContentPartSchema = z.union([
  z.object({ text: z.string() }),
  z.object({ media: z.object({ url: z.string() }) }),
]);

const GenerateChunkedSummaryInputSchema = z.object({
  parts: z.array(ContentPartSchema).describe('An array of text and media parts from the document.'),
  fileType: z.string().describe('Type of the uploaded file (PDF, pptx, txt).'),
});

const ProgressEventSchema = z.object({
  type: z.literal('progress'),
  data: z.object({
    percent: z.number(),
    message: z.string(),
  }),
});

const ResultEventSchema = z.object({
  type: z.literal('result'),
  data: z.object({
    summary: z.string(),
  }),
});

const StreamEventSchema = z.union([ProgressEventSchema, ResultEventSchema]);

// Prompt to summarize a single chunk of text.
const summarizeChunkPrompt = ai.definePrompt({
  name: 'summarizeStreamChunkPrompt',
  input: { schema: z.object({ chunkText: z.string() }) },
  output: { schema: z.object({ chunkSummary: z.string() }) },
  prompt: `You are a part of a multi-stage summarization pipeline. Your current task is to summarize the following chunk of text from a larger document. Extract the key points, concepts, and any important information. The output of this summary will be used in a later stage to build a final, comprehensive summary.

Provide a concise but thorough summary of this text chunk:

{{{chunkText}}}
`,
});

// Prompt to synthesize the final summary from a collection of chunk summaries.
const synthesizeSummariesPrompt = ai.definePrompt({
  name: 'synthesizeStreamSummariesPrompt',
  input: { schema: z.object({ chunkSummaries: z.array(z.string()) }) },
  output: { schema: z.object({ summary: z.string() }) },
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

export const generateChunkedSummaryStream = ai.defineFlow(
  {
    name: 'generateChunkedSummaryStream',
    inputSchema: GenerateChunkedSummaryInputSchema,
    outputSchema: z.unknown(),
    streamSchema: StreamEventSchema,
  },
  async function* (input, streamingCallback) {
    const CHUNK_SIZE = 30000; // Characters per chunk

    // 1. CHUNK STAGE
    yield* streamingCallback({
      type: 'progress',
      data: { percent: 5, message: 'Parsing and chunking document...' },
    });
    
    const fullText = input.parts.map((part) => ('text' in part ? part.text : '')).join('\n\n');
    if (!fullText.trim()) {
      throw new Error("Document appears to be empty or contains no text.");
    }
    const chunks: string[] = [];
    for (let i = 0; i < fullText.length; i += CHUNK_SIZE) {
      chunks.push(fullText.substring(i, i + CHUNK_SIZE));
    }

    // 2. SUMMARIZE STAGE
    const chunkSummaries: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const progress = 10 + Math.round((i / chunks.length) * 80);
      yield* streamingCallback({
        type: 'progress',
        data: { percent: progress, message: `Summarizing chunk ${i + 1} of ${chunks.length}...` },
      });
      
      const { output } = await summarizeChunkPrompt({ chunkText: chunk });
      if (output?.chunkSummary) {
        chunkSummaries.push(output.chunkSummary);
      }
    }

    // 3. SYNTHESIZE STAGE
    yield* streamingCallback({
      type: 'progress',
      data: { percent: 95, message: 'Synthesizing final summary...' },
    });

    const { output } = await synthesizeSummariesPrompt({
      chunkSummaries: chunkSummaries.filter(Boolean),
    });

    if (!output) {
        throw new Error("Failed to synthesize the final summary.");
    }

    yield* streamingCallback({
      type: 'result',
      data: { summary: output.summary },
    });

    return { success: true };
  }
);
