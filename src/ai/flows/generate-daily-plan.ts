
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
    time: z.string().describe('The time for the activity in a tight format, e.g., "05:30-06:00".'),
    activity: z.string().describe('The description of the activity.'),
    suggestions: z.string().optional().describe('Actionable tips, reminders, or suggestions for the activity.'),
  })).describe('A detailed list of activities for the day, broken into small, specific time blocks.'),
});
export type GenerateDailyPlanOutput = z.infer<typeof GenerateDailyPlanOutputSchema>;

export async function generateDailyPlan(input: GenerateDailyPlanInput): Promise<GenerateDailyPlanOutput> {
  return generateDailyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyPlanPrompt',
  input: {schema: GenerateDailyPlanInputSchema},
  output: {schema: GenerateDailyPlanOutputSchema},
  prompt: `You are a world-class personal productivity assistant and scheduler for students.

  Your task is to generate a highly detailed, minute-by-minute daily plan that is both aspirational and realistic. You must account for all fixed events, tasks, user preferences, and the unstated realities of a student's life (like travel time, meals, and the need for breaks).

  **Rules of Engagement:**
  1.  **Start from Wake-Up:** The plan must begin the moment the user should wake up. If they say "I want to wake up early," you must infer a reasonable time (e.g., 05:30) that allows them to prepare for their first commitment.
  2.  **Granularity is Key:** Break the day into small, specific time blocks (e.g., 15, 30, or 60 minutes). Avoid large, vague blocks like "Work on assignment." Instead, break it down: "Brainstorm essay outline," "Research keywords," "Write first draft of intro."
  3.  **Actionable Suggestions:** For each activity, you MUST provide a "suggestions" field with a concrete, helpful tip. For example, for "Go to gym," suggest "Focus on cardio and core today." For "Lunch," suggest "Eat something light to avoid post-meal drowsiness."
  4.  **Integrate Everything:** Seamlessly weave together the fixed timetable, high-priority tasks, scheduled study blocks, and the user's personal description of their ideal day.
  5.  **Be a Realist:** Acknowledge travel time between locations. Schedule short breaks between intense focus sessions. Include time for all three meals (Breakfast, Lunch, Dinner) and personal admin.
  6.  **Heavily Weight User Preferences:** The user's 'Desired Day Description' is the most important input. If they want a "relaxed morning," schedule lighter, more enjoyable activities then. If they want a "super productive afternoon," schedule their most demanding tasks during that time.
  7.  **Chronological Order:** The final output must be in chronological order.

  **Fixed Class Timetable for Today:**
  {{{timetable}}}

  **Tasks for Today:**
  {{{tasks}}}

  **Scheduled Study Blocks for Today:**
  {{{scheduledStudy}}}

  **User's Desired Day Description:**
  {{{desiredDayDescription}}}

  Generate the hyper-detailed, minute-by-minute daily plan now.
  `,
});

const generateDailyPlanFlow = ai.defineFlow(
  {
    name: 'generateDailyPlanFlow',
    inputSchema: GenerateDailyPlanInputSchema,
    outputSchema: GenerateDailyPlanOutputSchema,
  },
  async input => {
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (error: any) {
        attempt++;
        if (attempt >= maxRetries) {
          console.error('Final attempt failed:', error);
          throw new Error('The AI model is currently overloaded. Please try again in a few moments.');
        }
        console.log(`Attempt ${attempt} failed. Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    throw new Error('The AI model failed to respond after multiple attempts.');
  }
);
