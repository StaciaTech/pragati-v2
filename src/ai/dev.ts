import { config } from 'dotenv';
config();

import '@/ai/flows/generate-validation-report.ts';
import '@/ai/flows/summarize-validation-data.ts';
import '@/ai/flows/generate-html-report.ts';
import '@/ai/flows/generate-evaluation.ts';
