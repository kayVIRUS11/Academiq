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
  timetable: z.string().describe('The user’s fixed class timetable for the day.'),
  tasks: z.string().describe('The user’s tasks for the day, including deadlines and priorities.'),
  scheduledStudy: z.string().describe('The study sessions already scheduled for the day from the weekly plan.'),
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

  Your task is to generate a detailed, hour-by-hour daily plan that integrates the student's fixed classes, their tasks, their scheduled study blocks, and their personal preferences for the day.

  Rules:
  1.  **Fixed Events:** The classes from the 'Timetable' are fixed and cannot be moved.
  2.  **Scheduled Study:** The study blocks from 'Scheduled Study' are high-priority. Integrate them into the plan at their suggested times, but you can adjust the exact start/end times slightly to create a logical flow.
  3.  **Tasks:** Fit the items from the 'Tasks' list into the available time slots. Prioritize 'High' priority tasks.
  4.  **User Preferences:** Heavily weigh the user's 'Desired Day Description' to shape the schedule (e.g., if they want a relaxed morning, schedule lighter tasks then).
  5.  **Be Realistic:** Include breaks, meals (lunch, dinner), and some downtime. A student cannot be productive from 8am to 10pm without breaks.
  6.  **Chronological Order:** The final output must be in chronological order.

  **Fixed Class Timetable for Today:**
  {{{timetable}}}

  **Tasks for Today:**
  {{{tasks}}}

  **Scheduled Study Blocks for Today:**
  {{{scheduledStudy}}}

  **User's Desired Day Description:**
  {{{desiredDayDescription}}}

  Generate the cohesive, hour-by-hour daily plan now.
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
