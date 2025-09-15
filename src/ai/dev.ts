import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-uploaded-file.ts';
import '@/ai/flows/generate-study-guide.ts';
import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/generate-daily-plan.ts';
import '@/ai/flows/summarize-notes.ts';
import '@/ai/flows/merge-daily-plans.ts';
import '@/ai/flows/generate-study-guide.ts';
import '@/ai/flows/generate-weekly-study-plan.ts';
import '@/ai/flows/merge-weekly-study-plan.ts';
