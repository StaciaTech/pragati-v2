
'use server';

/**
 * @fileOverview AI flow that generates a comprehensive validation report for a submitted idea.
 * This flow now orchestrates multiple calls to a simpler AI evaluation flow,
 * one for each evaluation cluster, to build the full report.
 *
 * - generateValidationReport - A function that generates the validation report.
 */

import {ai} from '@/ai/genkit';
import {
  CLUSTER_WEIGHTS,
  PARAMETER_WEIGHTS,
  SUB_PARAMETER_DEFINITIONS,
} from '@/lib/data/reports';
import {
  GenerateValidationReportInput,
  GenerateValidationReportInputSchema,
  ValidationReport,
  ValidationReportSchema,
  DetailedEvaluationClusters,
} from '@/ai/schemas';
import { generateEvaluation } from './generate-evaluation';


// Main exported function
export async function generateValidationReport(
  input: GenerateValidationReportInput
): Promise<ValidationReport> {
  return generateValidationReportFlow(input);
}

// Main Genkit Flow
const generateValidationReportFlow = ai.defineFlow(
  {
    name: 'generateValidationReportFlow',
    inputSchema: GenerateValidationReportInputSchema,
    outputSchema: ValidationReportSchema,
  },
  async (input) => {
    console.log("Starting detailed evaluation generation for idea:", input.ideaName);
    
    // Step 1: Generate the detailed evaluation by calling the simpler flow for each cluster
    const clusterNames = Object.keys(SUB_PARAMETER_DEFINITIONS) as (keyof DetailedEvaluationClusters)[];
    const evaluationPromises = clusterNames.map(clusterName => 
      generateEvaluation({
        ...input,
        cluster: {
          name: clusterName,
          definition: SUB_PARAMETER_DEFINITIONS[clusterName],
        },
      })
    );

    const evaluationResults = await Promise.all(evaluationPromises);

    const detailedEvaluationClusters = evaluationResults.reduce((acc, result) => {
      acc = { ...acc, ...result };
      return acc;
    }, {} as DetailedEvaluationClusters);


    if (!detailedEvaluationClusters) {
      throw new Error("AI evaluation failed to return the detailed evaluation data.");
    }
    
    // Step 2: Calculate the overall score in code, not in the prompt
    let totalWeightedScore = 0;
    let totalWeightUsed = 0;

    for (const clusterName in SUB_PARAMETER_DEFINITIONS) {
        if (!CLUSTER_WEIGHTS[clusterName as keyof typeof CLUSTER_WEIGHTS]) continue;

        const clusterDef = SUB_PARAMETER_DEFINITIONS[clusterName as keyof typeof SUB_PARAMETER_DEFINITIONS];
        if (!clusterDef || !clusterDef.parameters) continue;

        for (const paramName in clusterDef.parameters) {
            const paramDef = clusterDef.parameters[paramName as keyof typeof clusterDef.parameters];
            const paramWeights = PARAMETER_WEIGHTS[clusterName as keyof typeof PARAMETER_WEIGHTS];

            if (!paramWeights || !paramWeights[paramName] || !paramDef.subParameters) continue;
            
            for (const subParamName in paramDef.subParameters) {
                const subParamDef = paramDef.subParameters[subParamName as keyof typeof paramDef.subParameters];

                const clusterData = detailedEvaluationClusters[clusterName as keyof typeof detailedEvaluationClusters];
                const paramData = clusterData ? (clusterData as any)[paramName] : undefined;
                const scoreData = paramData ? paramData[subParamName] : undefined;


                if (scoreData && typeof scoreData.assignedScore === 'number') {
                    const weight = (subParamDef.weight || 0) * (paramWeights[paramName] || 0) * (CLUSTER_WEIGHTS[clusterName as keyof typeof CLUSTER_WEIGHTS] || 0);
                    totalWeightedScore += scoreData.assignedScore * weight;
                    totalWeightUsed += weight;
                }
            }
        }
    }
    
    const overallScore = totalWeightUsed > 0 ? (totalWeightedScore / totalWeightUsed) : 0;
    
    // Step 3: Determine outcome based on the calculated score
    const validationOutcome = 
        overallScore >= 85 ? "Slay" : 
        overallScore >= 50 ? "Mid" : 
        "Flop";
        
    const recommendationText = 
        validationOutcome === "Slay" ? "Rocket Fuel! This idea is cleared for launch. Let's make it happen!" :
        validationOutcome === "Mid" ? "Diamond in the Rough! There's solid potential here. Polish it up with the feedback and resubmit." :
        "Back to the Lab! A great learning opportunity. Rethink the core concept and come back stronger.";


    // Step 4: Construct the full report object
    const report: ValidationReport = {
        ideaId: input.ideaId,
        validationId: input.validationId,
        reportId: '', // This will be populated by the API route
        ideaName: input.ideaName,
        ideaConcept: input.ideaConcept,
        overallScore: overallScore,
        validationOutcome: validationOutcome,
        recommendationText: recommendationText,
        submissionDate: new Date().toISOString().split('T')[0],
        pptUrl: '', // Optional, can be added later
        sections: {
            executiveSummary: {
                ideaName: input.ideaName,
                concept: input.ideaConcept,
                overallScore: overallScore,
                validationOutcome: validationOutcome,
                recommendation: recommendationText,
                reportGeneratedOn: new Date().toISOString().split('T')[0],
            },
            pragatiAIServiceProcess: {
                title: "Pragati AI Service Process",
                description: "This report was generated using Pragati AI's automated validation engine.",
                sections: [{ heading: "AI Evaluation", content: "The AI analyzed the idea based on a predefined framework." }],
            },
            competitiveLandscape: {
                title: "Competitive Landscape",
                description: "A brief overview of the competitive environment.",
                sections: [{ heading: "Key Competitors", content: "To be filled based on market research." }],
            },
            projectEvaluationFramework: {
                title: "Project Evaluation Framework",
                description: "The framework used for this evaluation.",
                sections: [{ heading: "Scoring Model", content: "A weighted scoring model across multiple clusters was used." }],
            },
            detailedEvaluation: {
                title: "Detailed Viability Assessment",
                description: "A granular breakdown of scores for each sub-parameter.",
                clusters: detailedEvaluationClusters,
            },
            conclusion: {
                title: "Conclusion",
                content: `Based on the evaluation, the idea '${input.ideaName}' shows ${validationOutcome.toLowerCase()} potential. The overall score is ${overallScore.toFixed(2)}/100.`,
            },
            recommendations: {
                title: "Recommendations",
                description: "Next steps based on the validation outcome.",
                items: [recommendationText],
            },
            appendix: {
                title: "Appendix",
                items: ["Glossary of terms can be added here."],
            },
        },
    };

    console.log(`Report generated for Idea ${input.ideaId}. Overall Score: ${report.overallScore}, Outcome: ${report.validationOutcome}`);
    return report;
  }
);
