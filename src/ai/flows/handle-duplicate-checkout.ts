'use server';

/**
 * @fileOverview This flow handles duplicate checkout requests by informing the user that their request has been received.
 *
 * - handleDuplicateCheckout - A function that handles duplicate checkout requests.
 * - HandleDuplicateCheckoutInput - The input type for the handleDuplicateCheckout function.
 * - HandleDuplicateCheckoutOutput - The return type for the handleDuplicateCheckout function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HandleDuplicateCheckoutInputSchema = z.object({
  numberOfCheckoutAttempts: z
    .number()
    .describe('The number of times the user has attempted to checkout.'),
});
export type HandleDuplicateCheckoutInput = z.infer<
  typeof HandleDuplicateCheckoutInputSchema
>;

const HandleDuplicateCheckoutOutputSchema = z.object({
  message: z
    .string()
    .describe(
      'A polite message informing the user that their request has been received and a waiter will assist shortly.'
    ),
});
export type HandleDuplicateCheckoutOutput = z.infer<
  typeof HandleDuplicateCheckoutOutputSchema
>;

export async function handleDuplicateCheckout(
  input: HandleDuplicateCheckoutInput
): Promise<HandleDuplicateCheckoutOutput> {
  return handleDuplicateCheckoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'handleDuplicateCheckoutPrompt',
  input: {schema: HandleDuplicateCheckoutInputSchema},
  output: {schema: HandleDuplicateCheckoutOutputSchema},
  prompt: `You are a polite and helpful restaurant chatbot. The user has clicked the checkout button {{numberOfCheckoutAttempts}} times. Respond with a message informing the user that their request has been received and a waiter will assist shortly. Do not apologize. Do not ask for confirmation. Do not make small talk. The message should be no longer than 2 sentences.`,
});

const handleDuplicateCheckoutFlow = ai.defineFlow(
  {
    name: 'handleDuplicateCheckoutFlow',
    inputSchema: HandleDuplicateCheckoutInputSchema,
    outputSchema: HandleDuplicateCheckoutOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
