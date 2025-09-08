'use server';

/**
 * @fileOverview AI flow that generates an evaluation for a single cluster of an idea.
 * This is a simpler, more focused flow that is called multiple times by the main
 * report generation flow. This avoids asking the AI model to generate a schema that is
 * too large and complex in a single call.
 *
 * - generateEvaluation - A function that generates the evaluation for one cluster.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateEvaluationInput,
  GenerateEvaluationInputSchema,
  GenerateEvaluationOutput,
} from '@/ai/schemas';
import { z } from 'zod';

function createOutputSchema(input: GenerateEvaluationInput) {
  const clusterShape = Object.entries(input.cluster.definition.parameters).reduce(
    (acc, [paramName, paramDef]) => {
      const subParamShape = Object.keys(paramDef.subParameters).reduce(
        (subAcc, subParamName) => {
          subAcc[subParamName] = z.object({
            assignedScore: z.number().int().min(1).max(100).describe('Score from 1-100'),
            whatWentWell: z.string().describe("Concise explanation of what was done well for this parameter (1-3 sentences)."),
            whatCanBeImproved: z.string().describe("Concise explanation of what can be improved for this parameter (1-3 sentences)."),
            assumptions: z.array(z.string()).describe('List of assumptions made for this evaluation'),
          });
          return subAcc;
        },
        {} as Record<string, z.ZodObject<any>>
      );
      acc[paramName] = z.object(subParamShape);
      return acc;
    },
    {} as Record<string, z.ZodObject<any>>
  );

  return z.object({
    [input.cluster.name]: z.object(clusterShape),
  });
}


// Main exported function
export async function generateEvaluation(
  input: GenerateEvaluationInput
): Promise<GenerateEvaluationOutput> {
  // Dynamically create the prompt with a schema tailored to the input cluster
  const dynamicPrompt = ai.definePrompt(
    {
      name: `evaluate${input.cluster.name.replace(/[^a-zA-Z0-9]/g, '')}Prompt`,
      input: { schema: GenerateEvaluationInputSchema },
      output: { schema: createOutputSchema(input) },
      prompt: `You are an expert AI-powered business and innovation consultant. Your goal is to provide a structured evaluation for a given innovative idea, focusing only on the cluster provided.

**Idea Details:**
Idea Name: {{ideaName}}
Concept: {{ideaConcept}}
Category: {{category}}
Institution: {{institution}}

**Evaluation Cluster to Assess:**
Cluster Name: {{cluster.name}}
Cluster Definition: {{{json cluster.definition}}}

**Instructions:**
1.  **Focus:** Evaluate the idea *only* on the sub-parameters within the cluster provided.
2.  **Output Format:** Your response MUST be a single, valid JSON object that conforms to the dynamically generated output schema for the cluster '{{cluster.name}}'. Do not add any text or formatting before or after the JSON object.
3.  **Scoring:** For each sub-parameter, assign a score from 1 to 100 (integer). Do not use 'N/A'. If a parameter is not applicable, assign a score of 60.
4.  **Justification:** For each score, you must provide:
    - 'whatWentWell': A concise explanation of the strengths of this aspect.
    - 'whatCanBeImproved': A concise, actionable suggestion for what could be improved.
    - 'assumptions': A list of any assumptions you made for this evaluation.
`,
    },
  );
  
  const { output } = await dynamicPrompt(input);

  if (!output) {
      throw new Error(`AI evaluation failed to return data for cluster ${input.cluster.name}.`);
  }

  return output;
}
