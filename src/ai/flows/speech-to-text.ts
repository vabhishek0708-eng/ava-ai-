'use server';

/**
 * @fileOverview This flow converts spoken audio into text.
 *
 * - speechToText - A function that transcribes audio.
 * - SpeechToTextInput - The input type for the speechToText function.
 * - SpeechToTextOutput - The return type for the speechToText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SpeechToTextInputSchema = z.object({
  audio: z.string().describe('The audio to transcribe, as a data URI.'),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  transcript: z.string().describe('The transcribed text.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;


const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: [{media: {url: input.audio}}],
        config: {
          temperature: 0.1,
        }
    });
    return { transcript: text };
  }
);

export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
    return speechToTextFlow(input);
}