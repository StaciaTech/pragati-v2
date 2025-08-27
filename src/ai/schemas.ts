
/**
 * @fileOverview This file defines the shared Zod schemas and TypeScript types for AI flows.
 * Separating schemas into their own file avoids Next.js server action export errors.
 */

import { z } from 'zod';

// Input Schema for the validation report generator
export const GenerateValidationReportInputSchema = z.object({
  ideaId: z.string().describe("The unique ID of the idea being validated."),
  validationId: z.string().describe("The unique ID for this specific validation attempt."),
  ideaName: z.string().describe('The name of the idea.'),
  ideaConcept: z.string().describe('The detailed concept of the idea.'),
  category: z.string().describe('The category or domain of the idea.'),
  institution: z.string().describe('The institution submitting the idea.'),
});
export type GenerateValidationReportInput = z.infer<
  typeof GenerateValidationReportInputSchema
>;

// Schemas for the detailed report structure
const SubParameterEvaluationSchema = z.object({
  assignedScore: z.number().int().min(1).max(100).describe("Score from 1-100"),
  whatWentWell: z.string().describe("Concise explanation of what was done well for this parameter (1-3 sentences)."),
  whatCanBeImproved: z.string().describe("Concise explanation of what can be improved for this parameter (1-3 sentences)."),
  assumptions: z.array(z.string()).describe("List of assumptions made for this evaluation"),
});
export type SubParameterEvaluation = z.infer<typeof SubParameterEvaluationSchema>;


// Simplified schemas to reduce complexity for the AI model
export const DetailedEvaluationClustersSchema = z.object({
  "Core Idea & Innovation": z.object({
    "Novelty & Uniqueness": z.object({ "Originality": SubParameterEvaluationSchema, "Differentiation": SubParameterEvaluationSchema }),
    "Problem-Solution Fit & Market Need": z.object({ "Problem Clarity & Severity": SubParameterEvaluationSchema, "Target Audience Identification & Definition": SubParameterEvaluationSchema, "Customer Pain Points Validation": SubParameterEvaluationSchema, "Solution Efficacy": SubParameterEvaluationSchema, "Customer Willingness to Pay": SubParameterEvaluationSchema, "Jobs-to-Be-Done (JTBD) Alignment": SubParameterEvaluationSchema }),
    "User Experience (UX) & Usability Potential": z.object({ "Intuitive Design": SubParameterEvaluationSchema, "Accessibility Compliance": SubParameterEvaluationSchema })
  }),
  "Market & Commercial Opportunity": z.object({
    "Market Validation": z.object({ "Market Size (TAM)": SubParameterEvaluationSchema, "Competitive Intensity": SubParameterEvaluationSchema }),
    "Geographic Specificity (India)": z.object({ "Regulatory Landscape": SubParameterEvaluationSchema, "Infrastructure Readiness": SubParameterEvaluationSchema }),
    "Product-Market Fit": z.object({ "User Engagement": SubParameterEvaluationSchema, "Retention Potential": SubParameterEvaluationSchema })
  }),
  "Execution & Operations": z.object({
      "Technical Feasibility": z.object({ "Technology Maturity": SubParameterEvaluationSchema, "Scalability & Performance": SubParameterEvaluationSchema }),
      "Operational Viability": z.object({ "Resource Availability": SubParameterEvaluationSchema, "Process Efficiency": SubParameterEvaluationSchema }),
      "Scalability Potential": z.object({ "Business Model Scalability": SubParameterEvaluationSchema, "Market Expansion Potential": SubParameterEvaluationSchema })
  }),
  "Business Model & Strategy": z.object({
    "Financial Viability": z.object({ "Revenue Stream Diversity": SubParameterEvaluationSchema, "Profitability & Margins": SubParameterEvaluationSchema }),
    "Defensibility": z.object({ "Intellectual Property (IP)": SubParameterEvaluationSchema, "Network Effects": SubParameterEvaluationSchema })
  }),
  "Team & Organizational Health": z.object({
    "Founder-Fit": z.object({ "Relevant Experience": SubParameterEvaluationSchema, "Complementary Skills": SubParameterEvaluationSchema }),
    "Culture/Values": z.object({ "Mission Alignment": SubParameterEvaluationSchema, "Diversity & Inclusion": SubParameterEvaluationSchema })
  }),
  "External Environment & Compliance": z.object({
    "Regulatory (India)": z.object({ "Data Privacy Compliance": SubParameterEvaluationSchema, "Sector-Specific Compliance": SubParameterEvaluationSchema }),
    "Sustainability (ESG)": z.object({ "Environmental Impact": SubParameterEvaluationSchema, "Social Impact (SDGs)": SubParameterEvaluationSchema }),
    "Ecosystem Support (India)": z.object({ "Government & Institutional Support": SubParameterEvaluationSchema, "Investor & Partner Landscape": SubParameterEvaluationSchema })
  }),
  "Risk & Future Outlook": z.object({
    "Risk Assessment": z.object({ "Technical Risks": SubParameterEvaluationSchema, "Market Risks": SubParameterEvaluationSchema, "Operational Risks": SubParameterEvaluationSchema }),
    "Investor Attractiveness": z.object({ "ROI Potential": SubParameterEvaluationSchema, "Exit Strategy Feasibility": SubParameterEvaluationSchema }),
    "Academic/National Alignment": z.object({ "Research Synergy": SubParameterEvaluationSchema, "National Priority Alignment": SubParameterEvaluationSchema })
  })
});
export type DetailedEvaluationClusters = z.infer<typeof DetailedEvaluationClustersSchema>;

const CriticalRiskSchema = z.object({
    title: z.string(),
    description: z.string(),
    mitigation: z.string(),
});

const CompetitorSchema = z.object({
    competitor: z.string(),
    products: z.string(),
    features: z.string(),
    priceRange: z.string(),
    strengths: z.string(),
    weaknesses: z.string(),
});

const CogsItemSchema = z.object({
    item: z.string(),
    cost: z.string(),
});

const DetailedPricingSchema = z.object({
    cogsBreakdown: z.array(CogsItemSchema),
    manufacturingAndAssembly: z.string(),
    estimatedCogs: z.string(),
    retailPricingStrategy: z.string(),
});

const ActionPlanSchema = z.object({
    urgent: z.array(z.string()),
    highPriority: z.array(z.string()),
    midPriority: z.array(z.string()),
});

const AIAgentFindingSchema = z.object({
    title: z.string(),
    details: z.string(),
    type: z.string(),
});

const AIAgentAnalysisSchema = z.object({
    introduction: z.string(),
    findings: z.array(AIAgentFindingSchema),
});

const DetailedValidationParameterSchema = z.object({
    parameter: z.string(),
    description: z.string(),
    inference: z.string(),
    score: z.string(),
    justification: z.string(),
    suggestions: z.string().nullable(),
});

const DetailedValidationAndScoringSchema = z.object({
    "Core Idea & Product": z.array(DetailedValidationParameterSchema),
    "Market & Customers": z.array(DetailedValidationParameterSchema),
    "Execution": z.array(DetailedValidationParameterSchema),
    "Business Model": z.array(DetailedValidationParameterSchema),
    "Team": z.array(DetailedValidationParameterSchema),
    "Compliance": z.array(DetailedValidationParameterSchema),
    "Risk & Strategy": z.array(DetailedValidationParameterSchema),
});

const SourceSchema = z.object({
    text: z.string(),
    url: z.string(),
});


// Main Report Output Schema
export const ValidationReportSchema = z.object({
  ideaName: z.string(),
  preparedFor: z.string(),
  date: z.string(),
  overallScore: z.number(),
  outcome: z.string(),
  executiveSummary: z.string(),
  keyStrengths: z.array(z.string()),
  keyWeaknesses: z.array(z.string()),
  criticalRisks: z.array(CriticalRiskSchema),
  competitiveAnalysis: z.array(CompetitorSchema),
  detailedPricing: DetailedPricingSchema,
  actionPlan: ActionPlanSchema,
  detailedValidationAndScoring: DetailedValidationAndScoringSchema,
  aiAgentAnalysis: AIAgentAnalysisSchema,
  sources: z.array(SourceSchema),
  disclaimer: z.string(),
});
export type ValidationReport = z.infer<typeof ValidationReportSchema>;

// Schemas for the individual cluster evaluation flow
const SubParameterDefinitionSchema = z.object({
  weight: z.number(),
  objective: z.string(),
});
const ParameterDefinitionSchema = z.object({
  subParameters: z.record(SubParameterDefinitionSchema),
});
const ClusterDefinitionSchema = z.object({
  name: z.string(),
  definition: z.object({
    parameters: z.record(ParameterDefinitionSchema),
  }),
});

export const GenerateEvaluationInputSchema = GenerateValidationReportInputSchema.extend({
  cluster: ClusterDefinitionSchema,
});
export type GenerateEvaluationInput = z.infer<typeof GenerateEvaluationInputSchema>;

export const GenerateEvaluationOutputSchema = z.record(z.any());
export type GenerateEvaluationOutput = z.infer<typeof GenerateEvaluation