
'use server';
/**
 * @fileOverview A simple flow to generate a beep sound using TTS.
 *
 * - generateBeepSound - A function that returns a data URI for a beep sound.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import wav from 'wav';

async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });
  
      let bufs = [] as any[];
      writer.on('error', reject);
      writer.on('data', function (d) {
        bufs.push(d);
      });
      writer.on('end', function () {
        resolve(Buffer.concat(bufs).toString('base64'));
      });
  
      writer.write(pcmData);
      writer.end();
    });
}


const BeepSoundOutputSchema = z.object({
  media: z.string().describe("A data URI of the generated beep sound in WAV format. Expected format: 'data:audio/wav;base64,<encoded_data>'."),
});

export type BeepSoundOutput = z.infer<typeof BeepSoundOutputSchema>;

const generateBeepSoundFlow = ai.defineFlow(
    {
      name: 'generateBeepSoundFlow',
      inputSchema: z.void(),
      outputSchema: BeepSoundOutputSchema,
    },
    async () => {
      const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
        },
        prompt: "beep",
      });
      if (!media) {
        throw new Error('no media returned from TTS model');
      }
      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      const wavBase64 = await toWav(audioBuffer);
      return {
        media: 'data:audio/wav;base64,' + wavBase64,
      };
    }
);

export async function generateBeepSound(): Promise<BeepSoundOutput> {
    return generateBeepSoundFlow();
}
