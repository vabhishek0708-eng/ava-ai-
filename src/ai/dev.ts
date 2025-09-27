import { config } from 'dotenv';
config();

import '@/ai/flows/menu-exploration.ts';
import '@/ai/flows/handle-duplicate-checkout.ts';
import '@/ai/flows/dish-details.ts';
import '@/ai/flows/speech-to-text.ts';