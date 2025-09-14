'use server';

/**
 * @fileOverview An AI tool that uses the user's timetable, tasks, and a description of their desired day to generate a detailed hour-by-hour daily plan.
 *
 * - generateDailyPlan - A function that generates a detailed daily plan.
 * - GenerateDailyPlanInput - The input type for the generateDailyPlan function.
 * - GenerateDailyPlanOutput - The return type for the generateDailyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyPlanInputSchema = z.object({
  timetable: z.string().describe('The user’s timetable for the day.'),
  tasks: z.string().describe('The user’s tasks for the day, including deadlines and priorities.'),
  desiredDayDescription: z
    .string()
    .describe('The user’s description of their desired day, including preferences and goals.'),
});
export type GenerateDailyPlanInput = z.infer<typeof GenerateDailyPlanInputSchema>;

const GenerateDailyPlanOutputSchema = z.object({
  dailyPlan: z.array(z.object({
    time: z.string().describe('The time for the activity, e.g., "09:00 - 10:30".'),
    activity: z.string().describe('The description of the activity.'),
  })).describe('A detailed list of activities for the day.'),
});
export type GenerateDailyPlanOutput = z.infer<typeof GenerateDailyPlanOutputSchema>;

export async function generateDailyPlan(input: GenerateDailyPlanInput): Promise<GenerateDailyPlanOutput> {
  return generateDailyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyPlanPrompt',
  input: {schema: GenerateDailyPlanInputSchema},
  output: {schema: GenerateDailyPlanOutputSchema},
  prompt: `You are a personal productivity assistant that helps students create a detailed daily plan.

  Using the student's timetable, tasks, and description of their desired day, generate a detailed hour-by-hour daily plan that optimizes their productivity.

  Timetable: {{{timetable}}}
  Tasks: {{{tasks}}}
  Desired Day Description: {{{desiredDayDescription}}}

  Generate the output as a structured list of activities with a time and description for each.
  `,
});

const generateDailyPlanFlow = ai.defineFlow(
  {
    name: 'generateDailyPlanFlow',
    inputSchema: GenerateDailyPlanInputSchema,
    outputSchema: GenerateDailyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
