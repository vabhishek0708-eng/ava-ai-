'use server';

/**
 * @fileOverview Menu exploration AI agent.
 *
 * - exploreMenu - A function that handles the menu exploration process.
 * - MenuExplorationInput - The input type for the exploreMenu function.
 * - MenuExplorationOutput - The return type for the exploreMenu function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MenuExplorationInputSchema = z.object({
  query: z.string().describe('The user query about the menu.'),
});
export type MenuExplorationInput = z.infer<typeof MenuExplorationInputSchema>;

const MenuExplorationOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user query.'),
});
export type MenuExplorationOutput = z.infer<typeof MenuExplorationOutputSchema>;

export async function exploreMenu(input: MenuExplorationInput): Promise<MenuExplorationOutput> {
  return exploreMenuFlow(input);
}

const prompt = ai.definePrompt({
  name: 'menuExplorationPrompt',
  input: {schema: MenuExplorationInputSchema},
  output: {schema: MenuExplorationOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are AVA AI, a helpful restaurant chatbot assistant. A customer is asking about the menu. Respond to the following query:

{{query}}

Provide details, recommendations, and answer their questions based on the menu items available. Be friendly, fast, and reassuring. Also give suggestions if asked to. If they ask to checkout, just say you've received the request, and a waiter will assist shortly.`,
});

const exploreMenuFlow = ai.defineFlow(
  {
    name: 'exploreMenuFlow',
    inputSchema: MenuExplorationInputSchema,
    outputSchema: MenuExplorationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
