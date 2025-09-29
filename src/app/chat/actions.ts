'use server';

import { exploreMenu } from '@/ai/flows/menu-exploration';
import { handleDuplicateCheckout } from '@/ai/flows/handle-duplicate-checkout';
import { getDishDetails } from '@/ai/flows/dish-details';
import { speechToText } from '@/ai/flows/speech-to-text';
import { z } from 'zod';
import type { DishDetailsOutput } from '@/ai/flows/dish-details';

const sendMessageSchema = z.object({
  message: z.string().min(1),
});

type ActionResponse = {
  type: 'text' | 'menu_carousel' | 'error';
  data: string | null;
};

export async function sendMessageAction(formData: FormData): Promise<ActionResponse> {
  const parsed = sendMessageSchema.safeParse({ message: formData.get('message') });

  if (!parsed.success) {
    return { type: 'error', data: 'Invalid message.' };
  }
  const query = parsed.data.message;

  try {
    if (query.toLowerCase().includes('popular') || query.toLowerCase().includes('show me')) {
      return { type: 'menu_carousel', data: null };
    }

    const aiResponse = await exploreMenu({ query });
    return { type: 'text', data: aiResponse.response };
  } catch (error) {
    console.error(error);
    return { type: 'error', data: 'An error occurred while processing your request.' };
  }
}

const checkoutSchema = z.object({
  attempts: z.number().int().positive(),
});

export async function handleCheckoutAction(formData: FormData): Promise<ActionResponse> {
  const parsed = checkoutSchema.safeParse({ attempts: Number(formData.get('attempts')) });

  if (!parsed.success) {
    return { type: 'error', data: 'Invalid checkout attempt.' };
  }

  try {
    const aiResponse = await handleDuplicateCheckout({
      numberOfCheckoutAttempts: parsed.data.attempts,
    });
    return { type: 'text', data: aiResponse.message };
  } catch (error) {
    console.error(error);
    return { type: 'error', data: 'An error occurred during checkout.' };
  }
}

const getDishDetailsSchema = z.object({
    name: z.string(),
    description: z.string(),
});

export async function getDishDetailsAction(formData: FormData): Promise<{ error?: string, details?: DishDetailsOutput}> {
    const parsed = getDishDetailsSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
    });

    if (!parsed.success) {
        return { error: 'Invalid dish data.' };
    }

    try {
        const details = await getDishDetails({
            dishName: parsed.data.name,
            description: parsed.data.description,
        });
        return { details };
    } catch (error) {
        console.error(error);
        return { error: 'Could not fetch dish details.' };
    }
}

const speechToTextSchema = z.object({
    audio: z.string(),
});

export async function speechToTextAction(formData: FormData): Promise<{error?: string, transcript?: string}> {
    const parsed = speechToTextSchema.safeParse({
        audio: formData.get('audio'),
    });

    if (!parsed.success) {
        return { error: 'Invalid audio data.' };
    }

    try {
        const { transcript } = await speechToText({ audio: parsed.data.audio });
        return { transcript };
    } catch (error) {
        console.error(error);
        return { error: 'Could not transcribe audio.' };
    }
}
