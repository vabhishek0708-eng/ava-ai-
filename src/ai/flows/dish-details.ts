'use server';

/**
 * @fileOverview This flow generates a detailed description of a dish, including ingredients and cooking process.
 *
 * - getDishDetails - A function that returns details for a given dish.
 * - DishDetailsInput - The input type for the getDishDetails function.
 * - DishDetailsOutput - The return type for the getDishDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DishDetailsInputSchema = z.object({
  dishName: z.string().describe('The name of the dish.'),
  description: z.string().describe('A brief description of the dish.'),
});
export type DishDetailsInput = z.infer<typeof DishDetailsInputSchema>;

const DishDetailsOutputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients for the dish.'),
  cookingProcess: z.array(z.string()).describe('The steps for the cooking process.'),
});
export type DishDetailsOutput = z.infer<typeof DishDetailsOutputSchema>;

const prompt = ai.definePrompt({
    name: 'dishDetailsPrompt',
    input: {schema: DishDetailsInputSchema},
    output: {schema: DishDetailsOutputSchema},
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are a world-class chef. Given the name and description of a dish, provide a list of likely ingredients and a simplified cooking process.

Dish Name: {{dishName}}
Description: {{description}}

Generate a list of ingredients and the cooking process.`,
});


const dishDetailsFlow = ai.defineFlow(
    {
        name: 'dishDetailsFlow',
        inputSchema: DishDetailsInputSchema,
        outputSchema: DishDetailsOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input);
        return output!;
    }
);

export async function getDishDetails(input: DishDetailsInput): Promise<DishDetailsOutput> {
    return dishDetailsFlow(input);
}
