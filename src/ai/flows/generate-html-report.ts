'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a detailed HTML validation report using generative AI.
 *
 * - generateHtmlReport - A function that generates an HTML validation report.
 * - GenerateHtmlReportInput - The input type for the generateHtmlReport function.
 * - GenerateHtmlReportOutput - The return type for the generateHtmlReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHtmlReportInputSchema = z.object({
  title: z.string().describe('The title of the report.'),
  introduction: z.string().describe('An introductory summary of the validation.'),
  dataSummary: z.string().describe('A summary of the data used in the validation.'),
  scores: z.record(z.number()).describe('A record of scores for different criteria.'),
  explanations: z.record(z.string()).describe('A record of explanations for the scores.'),
  assumptions: z.array(z.string()).describe('A list of assumptions made during the validation.'),
  diagramDataUri: z
    .string()
    .describe(
      "A data URI representing a conceptual diagram, that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateHtmlReportInput = z.infer<typeof GenerateHtmlReportInputSchema>;

const GenerateHtmlReportOutputSchema = z.object({
  htmlReport: z.string().describe('The generated HTML report as a string.'),
});
export type GenerateHtmlReportOutput = z.infer<typeof GenerateHtmlReportOutputSchema>;

export async function generateHtmlReport(input: GenerateHtmlReportInput): Promise<GenerateHtmlReportOutput> {
  return generateHtmlReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHtmlReportPrompt',
  input: {schema: GenerateHtmlReportInputSchema},
  output: {schema: GenerateHtmlReportOutputSchema},
  prompt: `You are an expert report generator, skilled in creating visually appealing and informative HTML reports.

You will receive data, scores, explanations, assumptions, and a conceptual diagram to integrate into the report.

Create a detailed HTML report based on the following information:

Title: {{{title}}}
Introduction: {{{introduction}}}
Data Summary: {{{dataSummary}}}
Scores: {{#each scores}} {{@key}}: {{{this}}} {{/each}}
Explanations: {{#each explanations}} {{@key}}: {{{this}}} {{/each}}
Assumptions: {{#each assumptions}}} {{{this}}} {{/each}}
Diagram: {{media url=diagramDataUri}}

Ensure the report is well-structured, easy to read, and includes the conceptual diagram. Return only valid HTML.
`,
});

const generateHtmlReportFlow = ai.defineFlow(
  {
    name: 'generateHtmlReportFlow',
    inputSchema: GenerateHtmlReportInputSchema,
    outputSchema: GenerateHtmlReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
