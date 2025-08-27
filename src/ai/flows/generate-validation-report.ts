

'use server';

/**
 * @fileOverview AI flow that generates a comprehensive validation report for a submitted idea.
 * This flow now orchestrates multiple calls to a simpler AI evaluation flow,
 * one for each evaluation dinner, to build the full report.
 *
 * - generateValidationReport - A function that generates the validation report.
 */

import {ai} from '@/ai/genkit';
import {
  CLUSTER_WEIGHTS,
  PARAMETER_WEIGHTS,
  SUB_PARAMETER_DEFINITIONS,
  MOCK_IDEAS,
} from '@/lib/mock-data';
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
  // For now, we will return a modified version of the mock report.
  // The complex generation logic can be re-enabled later.
  const templateReport = MOCK_IDEAS[0].report;
  if (!templateReport) {
      throw new Error("Mock report template not found.");
  }

  const overallScore = Math.floor(Math.random() * 50 + 50); // Random score between 50-100

  return {
      ...templateReport,
      ideaName: input.ideaName,
      overallScore: overallScore,
      outcome: overallScore > 80 ? "High Potential" : overallScore > 60 ? "Moderate" : "Needs Improvement",
      input: {
        user_idea: input.ideaConcept,
        ai_understanding: "AI's understanding of the