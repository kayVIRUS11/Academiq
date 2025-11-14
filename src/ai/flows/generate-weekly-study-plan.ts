
'use server';

/**
 * @fileOverview An AI tool that creates a weekly study plan based on courses, their units, and the class timetable.
 *
 * - generateWeeklyStudyPlan - A function that generates the study plan.
 * - GenerateWeeklyStudyPlanInput - The input type for the function.
 * - GenerateWeeklyStudyPlanOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { TimetableEntry, Course } from '@/lib/types';


const CourseSchema = z.object({
    id: z.string(),
    name: z.string(),
    courseCode: z.string(),
    instructor: z.string().optional(),
    color: z.string(),
    units: z.number(),
});

const TimetableEntrySchema = z.object({
    id: z.string(),
    courseId: z.string(),
    day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    startTime: z.string(),
    endTime: z.string(),
    location: z.string().optional(),
});


const GenerateWeeklyStudyPlanInputSchema = z.object({
  courses: z.array(CourseSchema).describe('The list of all courses the student is taking.'),
  timetable: z.array(TimetableEntrySchema).describe("The student's fixed class timetable for the week."),
});
export type GenerateWeeklyStudyPlanInput = z.infer<typeof GenerateWeeklyStudyPlanInputSchema>;

const GenerateWeeklyStudyPlanOutputSchema = z.object({
  weeklyPlan: z.array(z.object({
      day: z.string(),
      time: z.string().describe("Suggested time slot, e.g., '15:00 - 17:00'"),
      course: z.string().describe("The name of the course to study."),
      activity: z.string().describe("A brief suggestion for the study activity, e.g., 'Review lecture notes' or 'Problem set'"),
  })).describe("The suggested weekly study schedule."),
});
export type GenerateWeeklyStudyPlanOutput = z.infer<typeof GenerateWeeklyStudyPlanOutputSchema>;

export async function generateWeeklyStudyPlan(input: GenerateWeeklyStudyPlanInput): Promise<GenerateWeeklyStudyPlanOutput> {
  return generateWeeklyStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeeklyStudyPlanPrompt',
  input: { schema: GenerateWeeklyStudyPlanInputSchema },
  output: { schema: GenerateWeeklyStudyPlanOutputSchema },
  prompt: `You are an expert academic advisor creating a balanced weekly study plan for a university student.

  Your task is to generate a recommended study schedule for the entire week (Monday to Sunday).

  Analyze the student's courses and their fixed class timetable. Create study blocks in the free time slots.

  Rules:
  1.  **Prioritize by Weight:** Allocate more study time to courses with higher 'units'. A 4-unit course should get roughly twice the study time of a 2-unit course.
  2.  **Find Free Time:** Identify empty slots in the student's timetable. These are opportunities for study sessions.
  3.  **Be Realistic:** Suggest reasonable study block lengths, typically 1-2 hours. Avoid scheduling study sessions late at night or during typical meal times unless necessary.
  4.  **Spread it Out:** Distribute study sessions for a single course throughout the week. Avoid cramming all study time for one course into a single day.
  5.  **Be Specific:** For each study block, suggest a course to focus on and a brief, actionable activity (e.g., "Review lecture notes," "Work on assignment," "Read Chapter 3").
  6.  **Chronological Order:** The final output for each day should be in chronological order.

  **Student's Courses (with units):**
  {{#each courses}}
  - {{this.name}} ({{this.units}} units)
  {{/each}}

  **Student's Class Timetable:**
  {{#each timetable}}
  - {{this.day}}: {{this.startTime}} - {{this.endTime}}
  {{/each}}

  Generate the recommended weekly study plan now.
  `,
});

const generateWeeklyStudyPlanFlow = ai.defineFlow(
  {
    name: 'generateWeeklyStudyPlanFlow',
    inputSchema: GenerateWeeklyStudyPlanInputSchema,
    outputSchema: GenerateWeeklyStudyPlanOutputSchema,
  },
  async (input) => {
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const { output } = await prompt(input);
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
