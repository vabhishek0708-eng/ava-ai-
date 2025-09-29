
'use server';

/**
 * @fileOverview This flow handles duplicate checkout requests by informing the user that their request has been received.
 *
 * - handleDuplicateCheckout - A function that handles duplicate checkout requests.
 * - HandleDuplicateCheckoutInput - The input type for the handleDuplicatecheckout function.
 * - HandleDuplicateCheckoutOutput - The return type for the handleDuplicateCheckout function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const HandleDuplicateCheckoutInputSchema = z.object({
  numberOfCheckoutAttempts: z
    .number()
    .describe('The number of times the user has attempted to checkout.'),
});
export type HandleDuplicateCheckoutInput = z.infer<typeof HandleDuplicateCheckoutInputSchema>;

const HandleDuplicateCheckoutOutputSchema = z.object({
  message: z.string().describe(
    'A polite message informing the user that their request has been received and a waiter will assist shortly.'
  ),
});
export type HandleDuplicateCheckoutOutput = z.infer<typeof HandleDuplicateCheckoutOutputSchema>;

const FALLBACK_MESSAGE =
  'We have received your request already. We are sorry for the wait time. A waiter would assist you shortly. We appreciate your patience.';

// Force the model to return JSON matching the schema
const prompt = ai.definePrompt({
  name: 'handleDuplicateCheckoutPrompt',
  input: { schema: HandleDuplicateCheckoutInputSchema },
  output: { schema: HandleDuplicateCheckoutOutputSchema },
  // Nudge the model to emit only JSON
  prompt: `
You are a polite and helpful restaurant chatbot.
Return ONLY a valid JSON object with this exact shape:

{ "message": "We have received your request already. We are sorry for the wait time. A waiter would assist you shortly. We appreciate your patience." }

No extra text, no code fences.
  `.trim(),
});

const handleDuplicateCheckoutFlow = ai.defineFlow(
  {
    name: 'handleDuplicateCheckoutFlow',
    inputSchema: HandleDuplicateCheckoutInputSchema,
    outputSchema: HandleDuplicateCheckoutOutputSchema,
  },
  async (input) => {
    // Defensive: coerce and bound the attempt count
    const attempts = Number(input?.numberOfCheckoutAttempts ?? 2);
    if (!Number.isFinite(attempts) || attempts < 2) {
      // If it’s not actually a duplicate, still respond politely
      return { message: FALLBACK_MESSAGE };
    }

    try {
      const { output } = await prompt({ numberOfCheckoutAttempts: attempts });
      // If the tool returns undefined or bad shape, fall back
      if (!output?.message) return { message: FALLBACK_MESSAGE };
      return output;
    } catch (e) {
      // Never throw up to the UI for this UX path—just return the standard line
      return { message: FALLBACK_MESSAGE };
    }
  }
);

export async function handleDuplicateCheckout(
  input: HandleDuplicateCheckoutInput
): Promise<HandleDuplicateCheckoutOutput> {
  // Safe parse to avoid Zod exceptions bubbling out
  const parsed = HandleDuplicateCheckoutInputSchema.safeParse({
    numberOfCheckoutAttempts: Number((input as any)?.numberOfCheckoutAttempts),
  });
  if (!parsed.success) return { message: FALLBACK_MESSAGE };
  return handleDuplicateCheckoutFlow(parsed.data);
}
