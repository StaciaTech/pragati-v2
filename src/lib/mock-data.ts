
import type { ValidationReport } from '@/ai/schemas';
import { ROLES, type Role } from './constants';

export const MOCK_INNOVATOR_USER = {
  id: 'innovator-001',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  password: 'innovatorpass',
  isEmailVerified: true,
  isAccountLocked: false,
  credits: 5,
  college: 'Pragati University',
  role: 'Innovator',
  hasPsychometricAnalysis: false, // New property
};

export const MOCK_PSYCHOMETRIC_PROFILES: Record<string, {
    riskAppetite: 'High' | 'Moderate' | 'Low';
    workStyle: 'Collaborative' | 'Independent';
    motivation: 'Impact' | 'Financial' | 'Innovation';
    strengths: string[];
    weaknesses: string[];
    profileType: string;
    generalAnalysis: string;
    domainFit: string;
    expertiseFit: string;
    successFactors: string;
}> = {
    'innovator-001': {
        riskAppetite: 'High',
        workStyle: 'Collaborative',
        motivation: 'Impact',
        strengths: ['Resilience', 'Creativity', 'Strategic Thinking'],
        weaknesses: ['Over-optimism', 'Delegation'],
        profileType: 'Visionary Builder',
        generalAnalysis: 'This innovator is driven by a strong desire to make a tangible impact. They are resilient and creative, but may need support in managing expectations and building a team.',
        domainFit: 'Well-suited for EdTech and HealthTech where a user-centric, impact-first approach is crucial.',
        expertiseFit: 'Could excel in Product Management and Strategy roles. Would benefit from a co-founder with strong operational experience.',
        successFactors: 'Success hinges on building a complementary team to handle operational details and maintaining a realistic product roadmap.'
    },
     'INV002': {
        riskAppetite: 'Moderate',
        workStyle: 'Independent',
        motivation: 'Innovation',
        strengths: ['Analytical Skills', 'Technical Proficiency', 'Problem-Solving'],
        weaknesses: ['Public Speaking', 'Marketing'],
        profileType: 'Technical Specialist',
        generalAnalysis: 'A deep-tech innovator who thrives on solving complex problems. Their strength is in building the product, but they require support on the business and marketing fronts.',
        domainFit: 'Perfectly suited for domains like AI, Blockchain, and complex B2B SaaS solutions.',
        expertiseFit: 'Strong fit for a CTO or Lead Architect role. Needs a business-oriented co-founder to drive commercialization.',
        successFactors: 'Finding a strong business co-founder is critical. The technology must be translated into a clear value proposition for the market.'
    }
};

export const CLUSTER_WEIGHTS = {
  "Core Idea & Innovation": 0.20,
  "Market & Commercial Opportunity": 0.25,
  "Execution & Operations": 0.15,
  "Business Model & Strategy": 0.15,
  "Team & Organizational Health": 0.10,
  "External Environment & Compliance": 0.10,
  "Risk & Future Outlook": 0.05,
};

export const PARAMETER_WEIGHTS: Record<string, Record<string, number>> = {
  "Core Idea & Innovation": {
    "Novelty & Uniqueness": 0.30,
    "Problem-Solution Fit & Market Need": 0.45,
    "User Experience (UX) & Usability Potential": 0.25,
  },
  "Market & Commercial Opportunity": {
    "Market Validation": 0.40,
    "Geographic Specificity (India)": 0.30,
    "Product-Market Fit": 0.30,
  },
  "Execution & Operations": {
    "Technical Feasibility": 0.40,
    "Operational Viability": 0.30,
    "Scalability Potential": 0.30,
  },
  "Business Model & Strategy": {
    "Financial Viability": 0.60,
    "Defensibility": 0.40,
  },
  "Team & Organizational Health": {
    "Founder-Fit": 0.60,
    "Culture/Values": 0.40,
  },
  "External Environment & Compliance": {
    "Regulatory (India)": 0.40,
    "Sustainability (ESG)": 0.30,
    "Ecosystem Support (India)": 0.30,
  },
  "Risk & Future Outlook": {
    "Risk Assessment": 0.40,
    "Investor Attractiveness": 0.30,
    "Academic/National Alignment": 0.30,
  },
};

export const SUB_PARAMETER_DEFINITIONS = {
  "Core Idea & Innovation": {
    parameters: {
      "Novelty & Uniqueness": {
        subParameters: {
          "Originality": { weight: 0.60, objective: "To determine if the core idea is genuinely new, a significant improvement, or a disruptive concept compared to existing solutions globally." },
          "Differentiation": { weight: 0.40, objective: "To identify how the proposed solution stands out from direct and indirect competitors, highlighting its unique selling propositions (USPs)." }
        }
      },
      "Problem-Solution Fit & Market Need": {
        subParameters: {
          "Problem Clarity & Severity": { weight: 0.20, objective: "To gauge the intensity and prevalence of the problem being addressed for the target users/customers." },
          "Target Audience Identification & Definition": { weight: 0.15, objective: "To clearly define the specific demographic, professional role, and context of the primary target users." },
          "Customer Pain Points Validation": { weight: 0.20, objective: "To validate that the identified pain points are genuinely experienced and severe enough for customers to seek and pay for a solution." },
          "Solution Efficacy": { weight: 0.20, objective: "To evaluate how well the proposed product or service truly solves the identified problem, meeting user needs and expectations." },
          "Customer Willingness to Pay": { weight: 0.15, objective: "To assess the target customers' readiness and ability to pay for the proposed solution." },
          "Jobs-to-Be-Done (JTBD) Alignment": { weight: 0.10, objective: "To ensure the solution aligns with the fundamental 'jobs' customers are trying to get done, including functional, emotional, and social aspects." }
        }
      },
      "User Experience (UX) & Usability Potential": {
        subParameters: {
          "Intuitive Design": { weight: 0.60, objective: "To assess how easy and natural it is for users to understand, learn, and interact with the product or service without extensive training." },
          "Accessibility Compliance": { weight: 0.40, objective: "To ensure the product adheres to standards that make it usable by people with disabilities, promoting inclusivity and legal compliance." }
        }
      }
    }
  },
  "Market & Commercial Opportunity": {
    parameters: {
      "Market Validation": {
        subParameters: {
          "Market Size (TAM)": { weight: 0.60, objective: "To estimate the total potential revenue if 100% of the target market adopted the solution (TAM), the portion accessible (SAM), and the realistic share obtainable (SOM)." },
          "Competitive Intensity": { weight: 0.40, objective: "To analyze the number, size, and aggressiveness of existing competitors in the market." }
        }
      },
      "Geographic Specificity (India)": {
        subParameters: {
          "Regulatory Landscape": { weight: 0.50, objective: "To understand the legal and policy environment in India that affects the project's operation, including licensing, data, and industry-specific laws." },
          "Infrastructure Readiness": { weight: 0.50, objective: "To evaluate if the necessary physical and digital infrastructure is adequately developed in India to support the solution." }
        }
      },
      "Product-Market Fit": {
        subParameters: {
          "User Engagement": { weight: 0.50, objective: "To predict how deeply and frequently users will interact with the product or service after initial adoption." },
          "Retention Potential": { weight: 0.50, objective: "To estimate the likelihood of users continuing to use the product over an extended period." }
        }
      }
    }
  },
  "Execution & Operations": {
    parameters: {
      "Technical Feasibility": {
        subParameters: {
          "Technology Maturity": { weight: 0.50, objective: "To assess the stability, reliability, and widespread adoption of the core technologies proposed for the solution, and identify associated R&D risks." },
          "Scalability & Performance": { weight: 0.50, objective: "To determine if the technical architecture and underlying systems can efficiently handle increasing user numbers, data volumes, or transaction loads." }
        }
      },
      "Operational Viability": {
        subParameters: {
          "Resource Availability": { weight: 0.50, objective: "To check if the necessary human talent (skilled professionals), financial capital, and material supplies are readily accessible to execute the project." },
          "Process Efficiency": { weight: 0.50, objective: "To evaluate how streamlined and optimized the internal processes (e.g., AI model training, content generation, customer service, delivery) will be, minimizing waste and maximizing output." }
        }
      },
      "Scalability Potential": {
        subParameters: {
          "Business Model Scalability": { weight: 0.50, objective: "To assess if the revenue model allows revenue to grow disproportionately faster than costs as the business expands." },
          "Market Expansion Potential": { weight: 0.50, objective: "To identify how easily the product/service can be introduced into new geographic markets, demographics, or use cases beyond the initial target." }
        }
      }
    }
  },
  "Business Model & Strategy": {
    parameters: {
      "Financial Viability": {
        subParameters: {
          "Revenue Stream Diversity": { weight: 0.50, objective: "To identify how many distinct and sustainable ways the project plans to generate income." },
          "Profitability & Margins": { weight: 0.50, objective: "To project the percentage of revenue that turns into profit after accounting for all costs (gross and net margins)." }
        }
      },
      "Defensibility": {
        subParameters: {
          "Intellectual Property (IP)": { weight: 0.50, objective: "To assess the strength and breadth of legal protection for the project's unique innovations." },
          "Network Effects": { weight: 0.50, objective: "To determine if the value of the product or service increases for existing users as more new users join." }
        }
      }
    }
  },
  "Team & Organizational Health": {
    parameters: {
      "Founder-Fit": {
        subParameters: {
          "Relevant Experience": { weight: 0.50, objective: "To evaluate if the founding team possesses direct, hands-on experience in the industry, technology, or business model proposed." },
          "Complementary Skills": { weight: 0.50, objective: "To assess if the team has a balanced mix of essential skills (e.g., technical, business development, marketing, operations) needed for holistic execution." }
        }
      },
      "Culture/Values": {
        subParameters: {
          "Mission Alignment": { weight: 0.50, objective: "To understand how deeply the team members' personal values and goals resonate with the project's core mission and purpose." },
          "Diversity & Inclusion": { weight: 0.50, objective: "To assess the presence of diverse perspectives (gender, ethnicity, background, thought) within the team and a commitment to inclusive practices." }
        }
      }
    }
  },
  "External Environment & Compliance": {
    parameters: {
      "Regulatory (India)": {
        subParameters: {
          "Data Privacy Compliance": { weight: 0.50, objective: "To ensure the project's handling of user data adheres to relevant Indian data protection laws (e.g., DPDP Act) and international standards." },
          "Sector-Specific Compliance": { weight: 0.50, objective: "To verify adherence to regulations unique to the project's industry in India (e.g., UGC for EdTech, specific AI guidelines)." }
        }
      },
      "Sustainability (ESG)": {
        subParameters: {
          "Environmental Impact": { weight: 0.50, objective: "To assess the project's footprint on the natural environment (e.g., carbon emissions, waste generation, resource consumption)." },
          "Social Impact (SDGs)": { weight: 0.50, objective: "To evaluate how the project contributes to or impacts the United Nations Sustainable Development Goals (SDGs) and broader social well-being." }
        }
      },
      "Ecosystem Support (India)": {
        subParameters: {
          "Government & Institutional Support": { weight: 0.50, objective: "To identify potential assistance from government programs, incubators, accelerators, or other institutional bodies in India." },
          "Investor & Partner Landscape": { weight: 0.50, objective: "To understand the availability and appetite of investors (VCs, angels) and potential strategic partners for the project in India." }
        }
      }
    }
  },
  "Risk & Future Outlook": {
    parameters: {
      "Risk Assessment": {
        subParameters: {
          "Technical Risks": { weight: 0.34, objective: "To identify potential challenges and failure points related to the technology development, implementation, or long-term maintenance." },
          "Market Risks": { weight: 0.33, objective: "To assess external uncertainties that could negatively impact the project's market success." },
          "Operational Risks": { weight: 0.33, objective: "To identify potential failures in the day-to-day running of the business." }
        }
      },
      "Investor Attractiveness": {
        subParameters: {
          "ROI Potential": { weight: 0.50, objective: "To estimate the potential return on investment for financiers." },
          "Exit Strategy Feasibility": { weight: 0.50, objective: "To identify clear and attractive paths for investors to realize a return on their investment." }
        }
      },
      "Academic/National Alignment": {
        subParameters: {
          "Research Synergy": { weight: 0.50, objective: "To assess if the project contributes new knowledge, methods, or insights that can advance academic research." },
          "National Priority Alignment": { weight: 0.50, objective: "To determine how well the project aligns with broader national policies and initiatives in India." }
        }
      }
    }
  }
};

export const SCORING_RUBRIC = {
  "100-85": "Excellent: Strong evidence, highly aligned with success factors, minimal risk, clear advantage.",
  "84-70": "Good: Positive evidence, generally aligned, minor areas for improvement/risk.",
  "69-50": "Moderate: Mixed evidence, some clear challenges/risks, requires attention.",
  "49-25": "Weak: Significant gaps, major challenges/risks, requires substantial rework.",
  "24-1": "Poor: No evidence, fundamental flaws, highly problematic, major red flags.",
  "N/A": "Not Applicable: The sub-parameter is not relevant to this specific idea."
};


export const VALIDATION_OUTCOMES = {
  "Approved": {
    "range": "85-100",
    "recommendation": "Rocket Fuel! This idea is cleared for launch. Let's make it happen!"
  },
  "Moderate": {
    "range": "50-84",
    "recommendation": "Diamond in the Rough! There's solid potential here. Polish it up with the feedback and resubmit."
  },
  "Rejected": {
    "range": "0-49",
    "recommendation": "Back to the Lab! A great learning opportunity. Rethink the core concept and come back stronger."
  }
};

export const MOCK_CLUSTER_DEFINITIONS = SUB_PARAMETER_DEFINITIONS;

export const INITIAL_CLUSTER_WEIGHTS = {
  "Core Idea & Innovation": 20,
  "Market & Commercial Opportunity": 25,
  "Execution & Operations": 15,
  "Business Model & Strategy": 15,
  "Team & Organizational Health": 10,
  "External Environment & Compliance": 10,
  "Risk & Future Outlook": 5,
};

const MOCK_SAMPLE_REPORT: ValidationReport = {
  ideaId: 'IDEA-001',
  validationId: 'VALID-001-001',
  reportId: 'REPID-001-001-20240721',
  ideaName: 'AI-Powered Smart Farming',
  ideaConcept: 'An intelligent system using AI to optimize crop yield and detect diseases early.',
  overallScore: 76,
  validationOutcome: 'Moderate',
  recommendationText: 'Diamond in the Rough! There\'s solid potential here. Polish it up with the feedback and resubmit.',
  submissionDate: '2024-07-21',
  pptUrl: 'https://placehold.co/400x200/A0C4FF/1E2A38?text=Mock+PPT',
  sections: {
    executiveSummary: {
      ideaName: 'AI-Powered Smart Farming',
      concept: 'An intelligent system using AI to optimize crop yield and detect diseases early.',
      overallScore: 76,
      validationOutcome: 'Moderate',
      recommendation: 'Diamond in the Rough! There\'s solid potential here. Polish it up with the feedback and resubmit.',
      reportGeneratedOn: '2024-07-21',
    },
    pragatiAIServiceProcess: {
      title: '2.0 Pragati AI Service Process',
      description: 'The Pragati AI service is designed as a seamless, intuitive, and iterative journey for its users, leveraging AI at every critical juncture.',
      sections: [
        {
          heading: '2.1 User Journey & AI Integration:',
          content: 'The user journey begins with onboarding, where the AI uses NLP to refine the initial problem statement. It then synthesizes data for insights, offers personalized guidance, and learns from user feedback. A human-in-the-loop system allows for escalation on complex queries, ensuring quality and trust.'
        }
      ]
    },
    competitiveLandscape: {
      title: '3.0 Competitive Landscape',
      description: 'The market for academic and innovation support is diverse, comprising both traditional and emerging players. Pragati AI aims to carve a unique niche by blending AI\'s scalability with the depth of consultancy.',
      sections: [
        {
          heading: '3.1 Key Competitor Categories:',
          content: 'Key competitors include Traditional Human Consultancies (high cost, not scalable), Generic AI Tools (lack domain specificity), and Specialized EdTech Platforms (often focus on content, not personalized guidance). Pragati AI\'s advantage lies in its targeted, scalable, and data-driven consultancy model for the Indian context.'
        },
        {
          heading: '3.2 Pragati AI\'s Competitive Advantage:',
          content: 'The primary competitive advantage is the AI-driven, India-centric, holistic, and scalable approach that provides affordable, high-quality guidance on demand.'
        }
      ]
    },
    projectEvaluationFramework: {
      title: '4.0 Project Evaluation Framework & Viability Assessment',
      description: 'Our evaluation of AI-Powered Smart Farming employs a rigorous, multi-faceted scoring system to provide a comprehensive and quantifiable assessment of its viability.',
      sections: [
        {
          heading: '4.1 Scoring Rubric',
          content: 'Each sub-parameter is scored on a scale of 1 to 100.'
        },
        {
          heading: '4.2 Weightage Structure',
          subsections: [
            {
              subheading: 'A. Cluster Weightage (Total 100%)',
              content: 'Cluster weights are assigned based on their strategic importance. For instance, Market & Commercial Opportunity holds the highest weightage at 25% because market validation is critical for success.'
            },
            {
              subheading: 'B. Parameter Weightage',
              content: 'Within each cluster, parameters are weighted. For example, in Core Idea & Innovation, Problem-Solution Fit is weighted highest at 45%.'
            },
            {
              subheading: 'C. Sub-Parameter Weightage',
              content: 'Each parameter is further broken down into weighted sub-parameters to allow for granular analysis.'
            }
          ]
        },
        {
          heading: '4.3 Scoring Calculation Flow (Weighted Average)',
          content: 'The overall viability score is a weighted average of all sub-parameter scores, scaled to a final 1-100 score, providing a holistic assessment.'
        },
        {
          heading: '4.4 Validation Thresholds',
          content: 'Scores from 85-100 are Approved, 50-84 are Moderate, and 0-49 are Rejected, each with a corresponding action plan.'
        }
      ]
    },
    detailedEvaluation: {
      title: 'Detailed Viability Assessment',
      description: 'Here is the granular breakdown of the scores for each sub-parameter.',
      clusters: {
        "Core Idea & Innovation": {
          "Novelty & Uniqueness": {
            "Originality": { assignedScore: 80, whatWentWell: "The use of AI for early disease detection is not entirely new, but the proposed model for Indian crop types shows significant improvement over existing generic solutions.", whatCanBeImproved: "Further clarify the unique aspects of the AI model compared to competitors.", assumptions: ["The AI model can be trained effectively on diverse Indian agricultural data."] },
            "Differentiation": { assignedScore: 60, whatWentWell: "The scalability of the solution is a good differentiator.", whatCanBeImproved: "The key differentiator will be the accuracy and accessibility of the AI, which needs more emphasis.", assumptions: ["The service can be delivered at a cost-effective price point for Indian farmers."] }
          },
          "Problem-Solution Fit & Market Need": {
            "Problem Clarity & Severity": { assignedScore: 90, whatWentWell: "Crop loss due to disease is a severe and well-documented problem in India, causing significant financial distress to farmers.", whatCanBeImproved: "No major improvements needed.", assumptions: [] },
            "Target Audience Identification & Definition": { assignedScore: 80, whatWentWell: "The target audience (small to medium-scale farmers in specific regions) is well-defined.", whatCanBeImproved: "A more detailed go-to-market strategy for reaching them would be beneficial.", assumptions: ["Digital literacy among the target audience is sufficient for app usage."] },
            "Customer Pain Points Validation": { assignedScore: 80, whatWentWell: "The pain points are clearly validated by numerous agricultural reports. The solution directly addresses the need for timely and accurate information.", whatCanBeImproved: "No major improvements needed.", assumptions: [] },
            "Solution Efficacy": { assignedScore: 65, whatWentWell: "The potential efficacy is high.", whatCanBeImproved: "It depends heavily on the AI model's real-world accuracy, which is yet to be proven at scale.", assumptions: ["Sufficient high-quality, labeled image data is available for training."] },
            "Customer Willingness to Pay": { assignedScore: 60, whatWentWell: "A subscription model is proposed.", whatCanBeImproved: "Farmers are traditionally price-sensitive. A freemium or subscription model needs to demonstrate clear ROI to gain traction.", assumptions: ["The economic benefits of using the app will outweigh its cost."] },
            "Jobs-to-Be-Done (JTBD) Alignment": { assignedScore: 80, whatWentWell: "The solution aligns well with the farmer's core 'job' of protecting their yield and maximizing income.", whatCanBeImproved: "No major improvements needed.", assumptions: [] }
          },
          "User Experience (UX) & Usability Potential": {
            "Intuitive Design": { assignedScore: 80, whatWentWell: "A simple, image-based interface has high potential for intuitive use, even with varying literacy levels.", whatCanBeImproved: "Consider offline capabilities.", assumptions: ["The app will be available in multiple regional languages."] },
            "Accessibility Compliance": { assignedScore: 60, whatWentWell: "The concept is inclusive.", whatCanBeImproved: "Accessibility for users with disabilities has not been explicitly addressed but is a crucial consideration for a wide-reaching public service.", assumptions: [] }
          }
        },
        "Market & Commercial Opportunity": {
          "Market Validation": {
            "Market Size (TAM)": { "assignedScore": 95, "whatWentWell": "The Indian agriculture market is vast, with millions of farmers. The Total Addressable Market is exceptionally large.", "whatCanBeImproved": "No major improvements needed.", "assumptions": [] },
            "Competitive Intensity": { "assignedScore": 60, "whatWentWell": "The submission acknowledges competitors.", "whatCanBeImproved": "The agritech space has several well-funded players and government initiatives, making the competitive landscape moderately intense. A clearer strategy to outperform them is needed.", "assumptions": [] }
          },
          "Geographic Specificity (India)": {
            "Regulatory Landscape": { "assignedScore": 80, "whatWentWell": "Government policies are generally supportive of agritech.", "whatCanBeImproved": "There are no major regulatory hurdles, but data privacy laws for farmer data must be followed closely.", "assumptions": [] },
            "Infrastructure Readiness": { "assignedScore": 65, "whatWentWell": "Smartphone penetration is high.", "whatCanBeImproved": "Rural internet connectivity can be inconsistent, which might affect real-time AI analysis. An offline strategy is important.", "assumptions": ["The app can function in low-bandwidth or offline modes."] }
          },
          "Product-Market Fit": {
            "User Engagement": { "assignedScore": 80, "whatWentWell": "If the AI provides accurate and timely advice, engagement potential is high as farming is a daily activity.", "whatCanBeImproved": "Gamification or community features could boost engagement further.", "assumptions": ["The app provides tangible, recurring value."] },
            "Retention Potential": { "assignedScore": 80, "whatWentWell": "Retention will be high if the service proves reliable and leads to increased crop yield and income.", "whatCanBeImproved": "No major improvements needed.", "assumptions": [] }
          }
        },
        "Execution & Operations": {
          "Technical Feasibility": {
            "Technology Maturity": { "assignedScore": 80, "whatWentWell": "Image recognition and machine learning are mature technologies.", "whatCanBeImproved": "The primary challenge is adapting them to specific Indian agricultural contexts.", "assumptions": ["The team has access to the required AI/ML expertise."] },
            "Scalability & Performance": { "assignedScore": 80, "whatWentWell": "The cloud-based architecture is inherently scalable, capable of serving millions of users with proper design.", "whatCanBeImproved": "Cost management at scale needs to be considered.", "assumptions": ["Cloud infrastructure costs are managed effectively."] }
          },
          "Operational Viability": {
            "Resource Availability": { "assignedScore": 60, "whatWentWell": "The plan acknowledges the need for data.", "whatCanBeImproved": "Access to high-quality, localized agricultural data for training is a significant challenge and a critical resource. A clear data acquisition strategy is needed.", "assumptions": ["Partnerships with agricultural research institutes can be formed."] },
            "Process Efficiency": { "assignedScore": 90, "whatWentWell": "The AI-driven process is vastly more efficient than manual inspection or traditional extension services.", "whatCanBeImproved": "No major improvements needed.", "assumptions": [] }
          },
          "Scalability Potential": {
            "Business Model Scalability": { "assignedScore": 80, "whatWentWell": "The business model is highly scalable, as serving an additional user has a low marginal cost.", "whatCanBeImproved": "No major improvements needed.", "assumptions": [] },
            "Market Expansion Potential": { "assignedScore": 90, "whatWentWell": "The model can be expanded to different crops, regions, and even other countries with similar agricultural profiles.", "whatCanBeImproved": "No major improvements needed.", "assumptions": [] }
          }
        },
        "Business Model & Strategy": {
          "Financial Viability": {
            "Revenue Stream Diversity": { "assignedScore": 65, "whatWentWell": "A subscription model is proposed.", "whatCanBeImproved": "The model relies primarily on a subscription model. Diversifying with data analytics for institutions or a marketplace for supplies could strengthen it.", "assumptions": [] },
            "Profitability & Margins": { "assignedScore": 60, "whatWentWell": "The long-term vision is profitable.", "whatCanBeImproved": "Profitability depends on achieving a large scale of paid users to cover the initial R&D and ongoing cloud costs. Financial projections are needed.", "assumptions": [] }
          },
          "Defensibility": {
            "Intellectual Property (IP)": { "assignedScore": 40, "whatWentWell": "N/A", "whatCanBeImproved": "The core AI algorithms may be hard to patent. Defensibility will likely come from proprietary data and brand trust rather than IP.", "assumptions": [] },
            "Network Effects": { "assignedScore": 80, "whatWentWell": "Strong network effects are possible: more user data improves the AI, which attracts more users, creating a virtuous cycle.", "whatCanBeImproved": "No major improvements needed.", "assumptions": ["Users consent to their anonymized data being used for model improvement."] }
          }
        },
        "Team & Organizational Health": {
          "Founder-Fit": {
            "Relevant Experience": { "assignedScore": 75, "whatWentWell": "The team's background in technology is strong.", "whatCanBeImproved": "More deep-domain agricultural expertise would be beneficial.", "assumptions": ["The team can hire or partner with agricultural experts."] },
            "Complementary Skills": { "assignedScore": 60, "whatWentWell": "The team has strong tech skills.", "whatCanBeImproved": "The team is tech-heavy and would benefit from adding skills in rural marketing, sales, and agricultural policy.", "assumptions": [] }
          },
          "Culture/Values": {
            "Mission Alignment": { "assignedScore": 90, "whatWentWell": "The team shows strong alignment with a mission to use technology for social good and empower farmers.", "whatCanBeImproved": "No major improvements needed.", "assumptions": [] },
            "Diversity & Inclusion": { "assignedScore": 60, "whatWentWell": "This is acknowledged as important.", "whatCanBeImproved": "Ensuring the AI model is trained on data that is inclusive of all regions and farming communities is a critical challenge to address.", "assumptions": [] }
          }
        },
        "External Environment & Compliance": {
          "Regulatory (India)": {
            "Data Privacy Compliance": { "assignedScore": 65, "whatWentWell": "Awareness of data privacy is mentioned.", "whatCanBeImproved": "Adherence to India's data privacy laws (DPDP Act) is crucial and requires careful implementation for handling farmer data.", "assumptions": ["Legal counsel will be sought for compliance."] },
            "Sector-Specific Compliance": { "assignedScore": 80, "whatWentWell": "There are no major sector-specific regulations that would block this idea. Alignment with government digital agriculture initiatives is a plus.", "whatCanBeImproved": "No major improvements needed.", "assumptions": [] }
          },
          "Sustainability (ESG)": {
            "Environmental Impact": { "assignedScore": 90, "whatWentWell": "The idea has a strong positive environmental impact by promoting targeted pesticide use and improving resource management.", "whatCanBeImproved": "No major improvements needed.", "assumptions": [] },
            "Social Impact (SDGs)": { "assignedScore": 90, "whatWentWell": "Directly aligns with SDGs for Zero Hunger (SDG 2), and Industry, Innovation, and Infrastructure (SDG 9).", "whatCanBeImproved": "No major improvements needed.", "assumptions": [] }
          },
          "Ecosystem Support (India)": {
            "Government & Institutional Support": { "assignedScore": 80, "whatWentWell": "High potential for support from government initiatives like Startup India and agritech incubators.", "whatCanBeImproved": "No major improvements needed.", "assumptions": ["The team will actively seek this support."] },
            "Investor & Partner Landscape": { "assignedScore": 80, "whatWentWell": "The Indian agritech sector is attracting significant investor interest, making the funding landscape favorable.", "whatCanBeImproved": "No major improvements needed.", "assumptions": ["The business model is attractive to VCs."] }
          }
        },
        "Risk & Future Outlook": {
          "Risk Assessment": {
            "Technical Risks": { "assignedScore": 65, "whatWentWell": "Risks are identified.", "whatCanBeImproved": "The primary technical risk is the AI's accuracy and reliability across diverse real-world conditions. A mitigation plan is needed.", "assumptions": [] },
            "Market Risks": { "assignedScore": 60, "whatWentWell": "Risks are identified.", "whatCanBeImproved": "Market risk includes user adoption challenges due to digital literacy and trust, and competition from other agritech players. A mitigation plan is needed.", "assumptions": [] },
            "Operational Risks": { "assignedScore": 50, "whatWentWell": "Risks are identified.", "whatCanBeImproved": "Operational risks involve building a robust data pipeline and a support system for farmers. A mitigation plan is needed.", "assumptions": [] }
          },
          "Investor Attractiveness": {
            "ROI Potential": { "assignedScore": 80, "whatWentWell": "High ROI potential if the model can achieve scale, given the large market size and scalable tech.", "whatCanBeImproved": "No major improvements needed.", "assumptions": [] },
            "Exit Strategy Feasibility": { "assignedScore": 80, "whatWentWell": "A clear exit path exists through acquisition by larger agritech or agriculture input companies.", "whatCanBeImproved": "No major improvements needed.", "assumptions": [] }
          },
          "Academic/National Alignment": {
            "Research Synergy": { "assignedScore": 85, "whatWentWell": "Strong potential for collaboration with agricultural universities for research and data.", "whatCanBeImproved": "No major improvements needed.", "assumptions": [] },
            "National Priority Alignment": { "assignedScore": 90, "whatWentWell": "The idea aligns perfectly with national priorities of increasing agricultural productivity and farmer income.", "whatCanBeImproved": "No major improvements needed.", "assumptions": [] }
          }
        }
      }
    },
    conclusion: {
      title: '5.0 Conclusion',
      content: 'AI-Powered Smart Farming presents a compelling vision for leveraging AI to serve the critical needs of India\'s agricultural sector. Its core idea demonstrates good originality and targets clear problems within a vast market. However, the project currently stands at a "MODERATE" viability level due to challenges in data acquisition, competitive intensity, and ensuring real-world AI efficacy. With a focused pilot program and strategic partnerships, it has strong potential to become a highly viable and impactful venture.'
    },
    recommendations: {
      title: '6.0 Recommendations',
      description: 'To elevate the project\'s viability, the following strategic recommendations are crucial:',
      items: [
        'Initiate a pilot program in partnership with a local agricultural university to gather high-quality, localized training data and validate the AI model\'s efficacy in a controlled environment.',
        'Develop a tiered business model (e.g., freemium) to build a large user base while offering premium, value-added services to larger farms or FPOs to ensure financial sustainability.',
        'Focus on building a strong brand and community around the app to create a moat, as the core technology may be difficult to defend with patents alone.'
      ]
    },
    appendix: {
      title: '7.0 Appendix / Glossary',
      items: [
        'TAM: Total Addressable Market',
        'SDG: Sustainable Development Goals',
        'FPO: Farmer Producer Organisation'
      ]
    }
  }
};


export let MOCK_IDEAS: Array<{
  id: string;
  validationId: string;
  title: string;
  description: string;
  collegeId: string;
  collegeName: string;
  domain: string;
  innovatorId: string;
  innovatorName: string;
  innovatorEmail: string;
  status: string;
  dateSubmitted: string;
  version: string;
  report: ValidationReport | null; 
  clusterWeights?: Record<string, number>; 
  feedback?: { overall: string; details: { aspect: string; score: number; comment: string }[] } | null;
  consultationStatus: string;
  consultationDate: string | null;
  consultationTime: string | null;
  ttcAssigned: string | null;
  teamId?: string;
}> = [
  {
    id: 'IDEA-001',
    validationId: 'VALID-001-001',
    title: 'AI-Powered Smart Farming',
    description: 'An intelligent system using AI to optimize crop yield and detect diseases early.',
    collegeId: 'COL001',
    collegeName: 'Pragati Institute of Technology',
    domain: 'Agriculture',
    innovatorId: 'INV001',
    innovatorName: 'Jane Doe',
    innovatorEmail: 'jane.doe@example.com',
    status: 'Approved',
    dateSubmitted: '2024-01-15',
    version: 'V1.0',
    report: {...MOCK_SAMPLE_REPORT, ideaName: 'AI-Powered Smart Farming', overallScore: 88, validationOutcome: 'Approved', recommendationText: "Rocket Fuel! This idea is cleared for launch. Let's make it happen!"},
    clusterWeights: INITIAL_CLUSTER_WEIGHTS,
    feedback: null,
    consultationStatus: 'Scheduled',
    consultationDate: '2024-07-20',
    consultationTime: '10:00',
    ttcAssigned: 'TTC_001',
    teamId: 'TEAM-001',
  },
  {
    id: 'IDEA-002',
    validationId: 'VALID-002-001',
    title: 'Decentralized Education Platform',
    description: 'A blockchain-based platform for peer-to-peer learning with verified credentials.',
    collegeId: 'COL002',
    collegeName: 'Global School of Innovation',
    domain: 'EdTech',
    innovatorId: 'INV002',
    innovatorName: 'John Smith',
    innovatorEmail: 'john.smith@example.com',
    status: 'Moderate',
    dateSubmitted: '2024-02-20',
    version: 'V1.0',
    report: {...MOCK_SAMPLE_REPORT, ideaId: 'IDEA-002', validationId: 'VALID-002-001', reportId: 'REPID-002-001-20240722', ideaName: 'Decentralized Education Platform', overallScore: 62 },
    clusterWeights: INITIAL_CLUSTER_WEIGHTS,
    feedback: null,
    consultationStatus: 'Pending',
    consultationDate: null,
    consultationTime: null,
    ttcAssigned: null,
    teamId: 'TEAM-002',
  },
   {
    id: 'IDEA-003',
    validationId: 'VALID-003-001',
    title: 'HealthTech Wearable for Seniors',
    description: 'A wearable device that monitors vital signs for elderly individuals and alerts caregivers.',
    collegeId: 'COL001',
    collegeName: 'Pragati Institute of Technology',
    domain: 'HealthTech',
    innovatorId: 'INV001',
    innovatorName: 'Jane Doe',
    innovatorEmail: 'jane.doe@example.com',
    status: 'Rejected',
    dateSubmitted: '2024-03-10',
    version: 'V1.0',
    report: {...MOCK_SAMPLE_REPORT, ideaId: 'IDEA-003', validationId: 'VALID-003-001', reportId: 'REPID-003-001-20240723', ideaName: 'HealthTech Wearable for Seniors', overallScore: 42, validationOutcome: 'Rejected', recommendationText: "Back to the Lab! A great learning opportunity. Rethink the core concept and come back stronger."},
    clusterWeights: INITIAL_CLUSTER_WEIGHTS,
    feedback: null,
    consultationStatus: 'Not Requested',
    consultationDate: null,
    consultationTime: null,
    ttcAssigned: null,
    teamId: 'TEAM-001',
  },
  {
    id: 'IDEA-004',
    validationId: 'VALID-004-001',
    title: 'Smart City Traffic Management',
    description: 'An IoT and AI-based system to optimize traffic flow in real-time.',
    collegeId: 'COL003',
    collegeName: 'Tech University Chennai',
    domain: 'Smart Cities',
    innovatorId: 'INV004',
    innovatorName: 'Arjun Kumar',
    innovatorEmail: 'arjun.k@example.com',
    status: 'Approved',
    dateSubmitted: '2024-04-05',
    version: 'V1.0',
    report: {...MOCK_SAMPLE_REPORT, ideaId: 'IDEA-004', validationId: 'VALID-004-001', reportId: 'REPID-004-001-20240724', ideaName: 'Smart City Traffic Management', overallScore: 90, validationOutcome: 'Approved', recommendationText: "Rocket Fuel! This idea is cleared for launch. Let's make it happen!"},
    clusterWeights: INITIAL_CLUSTER_WEIGHTS,
    feedback: null,
    consultationStatus: 'Completed',
    consultationDate: '2024-04-25',
    consultationTime: '11:00',
    ttcAssigned: 'TTC_002',
    teamId: 'TEAM-003',
  },
   {
    id: 'IDEA-005',
    validationId: 'VALID-005-001',
    title: 'Personalized Financial Advisor Bot',
    description: 'A FinTech chatbot that provides personalized investment advice based on user goals.',
    collegeId: 'COL001',
    collegeName: 'Pragati Institute of Technology',
    domain: 'FinTech',
    innovatorId: 'INV001',
    innovatorName: 'Jane Doe',
    innovatorEmail: 'jane.doe@example.com',
    status: 'Approved',
    dateSubmitted: '2024-05-22',
    version: 'V1.0',
    report: {...MOCK_SAMPLE_REPORT, ideaId: 'IDEA-005', validationId: 'VALID-005-001', reportId: 'REPID-005-001-20240725', ideaName: 'Financial Advisor Bot', overallScore: 80, validationOutcome: 'Moderate'},
    clusterWeights: INITIAL_CLUSTER_WEIGHTS,
    feedback: null,
    consultationStatus: 'Pending',
    consultationDate: null,
    consultationTime: null,
    ttcAssigned: 'TTC_001',
    teamId: 'TEAM-001',
  },
   {
    id: 'IDEA-006',
    validationId: 'VALID-006-001',
    title: 'Renewable Energy Grid Optimizer',
    description: 'AI model to predict energy production from solar/wind and optimize grid distribution.',
    collegeId: 'COL002',
    collegeName: 'Global School of Innovation',
    domain: 'Renewable Energy',
    innovatorId: 'INV002',
    innovatorName: 'Priya Singh',
    innovatorEmail: 'priya.s@example.com',
    status: 'Moderate',
    dateSubmitted: '2024-06-30',
    version: 'V1.0',
    report: {...MOCK_SAMPLE_REPORT, ideaId: 'IDEA-006', validationId: 'VALID-006-001', reportId: 'REPID-006-001-20240726', ideaName: 'Grid Optimizer', overallScore: 70, validationOutcome: 'Moderate'},
    clusterWeights: INITIAL_CLUSTER_WEIGHTS,
    feedback: null,
    consultationStatus: 'Not Requested',
    consultationDate: null,
    consultationTime: null,
    ttcAssigned: null,
    teamId: 'TEAM-002',
  },
];

export let MOCK_CONSULTATIONS = [
  {
    id: 'CONS-001',
    ideaId: 'IDEA-001',
    innovatorId: 'INV001',
    title: 'Discussion on MVP for Smart Farming',
    date: '2024-07-20',
    time: '10:00 AM',
    mentor: 'Dr. Emily White',
    status: 'Scheduled',
    milestones: ['MVP Scope Defined', 'Tech Stack Selection'],
    files: ['MVP_Proposal_V1.pdf'],
  },
  {
    id: 'CONS-002',
    ideaId: 'IDEA-002',
    innovatorId: 'INV002',
    title: 'Market Strategy Review for EdTech',
    date: '2024-07-18',
    time: '02:00 PM',
    mentor: 'Prof. Alex Green',
    status: 'Completed',
    milestones: ['Business Model Refined'],
    files: ['Market_Analysis_Feedback.pdf'],
  },
];

export let MOCK_CREDIT_REQUESTS: {
    id: string;
    requesterType: 'College' | 'TTC' | 'Innovator';
    requesterId: string;
    requesterName: string;
    amount: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    date: string;
    purpose: string;
}[] = [
  { id: 'CR-COL-001', requesterType: 'College', requesterId: 'COL001', requesterName: 'Pragati Institute of Technology', amount: 50, status: 'Pending', date: '2024-07-10', purpose: 'Bulk credits for new semester' },
  { id: 'CR-TTC-001', requesterType: 'TTC', requesterId: 'TTC_001', requesterName: 'Dr. Priya Sharma', amount: 20, status: 'Pending', date: '2024-07-14', purpose: 'Credits for upcoming innovator batch' },
  { id: 'CR-INV-001', requesterType: 'Innovator', requesterId: 'innovator-001', requesterName: 'Jane Doe', amount: 1, status: 'Pending', date: '2024-07-15', purpose: 'Need 1 credit for new idea submission' },
  { id: 'CR-INV-002', requesterType: 'Innovator', requesterId: 'INV002', requesterName: 'John Smith', amount: 5, status: 'Approved', date: '2024-07-12', purpose: 'Resubmission of project' },
];

export let MOCK_COLLEGES = [
  { id: 'COL001', name: 'Pragati Institute of Technology', principalEmail: 'principal.pit@pragati.com', ttcLimit: 5, creditsAvailable: 100, currentPlanId: 'PLAN001-M', status: 'Active' },
  { id: 'COL002', name: 'Global School of Innovation', principalEmail: 'principal.gsi@pragati.com', ttcLimit: 3, creditsAvailable: 75, currentPlanId: 'PLAN001-M', status: 'Active' },
  { id: 'COL003', name: 'Tech University Chennai', principalEmail: 'principal.tuc@pragati.com', ttcLimit: 7, creditsAvailable: 120, currentPlanId: 'PLAN002-Y', status: 'Inactive' },
];

export let MOCK_PLANS = [
  // Monthly Plans
  { id: 'PLAN001-M', name: 'Essential Monthly', pricePerCredit: 500, minCredits: 20, totalAmount: 10000, features: ['20 Idea Submissions', 'Basic Feedback', '5 TTCs'], enabled: true, interval: 'monthly' },
  { id: 'PLAN002-M', name: 'Advance Monthly', pricePerCredit: 490, minCredits: 50, totalAmount: 24500, features: ['50 Idea Submissions', 'Detailed Feedback', '10 TTCs', '2 Consultations'], enabled: true, interval: 'monthly' },
  { id: 'PLAN003-M', name: 'Advance Pro Monthly', pricePerCredit: 475, minCredits: 100, totalAmount: 47500, features: ['Unlimited Idea Submissions', 'Premium Feedback', '15 TTCs', 'Unlimited Consultations'], enabled: true, interval: 'monthly' },

  // Yearly Plans (with a discount)
  { id: 'PLAN001-Y', name: 'Essential Yearly', pricePerCredit: 450, minCredits: 240, totalAmount: 108000, features: ['240 Idea Submissions', 'Basic Feedback', '5 TTCs', '10% Discount'], enabled: true, interval: 'yearly' },
  { id: 'PLAN002-Y', name: 'Advance Yearly', pricePerCredit: 440, minCredits: 600, totalAmount: 264000, features: ['600 Idea Submissions', 'Detailed Feedback', '10 TTCs', '24 Consultations', '12% Discount'], enabled: true, interval: 'yearly' },
  { id: 'PLAN003-Y', name: 'Advance Pro Yearly', pricePerCredit: 425, minCredits: 1200, totalAmount: 510000, features: ['Unlimited Idea Submissions', 'Premium Feedback', '15 TTCs', 'Unlimited Consultations', '15% Discount'], enabled: true, interval: 'yearly' },
  
  // Enterprise Plan (same for both intervals)
  { id: 'PLAN004-E', name: 'Enterprises', pricePerCredit: 0, minCredits: 0, totalAmount: 0, features: ['Custom Limits', 'Dedicated Support', 'Tailored Solutions', 'Contact Us for Pricing'], enabled: true, interval: 'monthly' },
  { id: 'PLAN004-E', name: 'Enterprises', pricePerCredit: 0, minCredits: 0, totalAmount: 0, features: ['Custom Limits', 'Dedicated Support', 'Tailored Solutions', 'Contact Us for Pricing'], enabled: true, interval: 'yearly' },
];


export let MOCK_TTCS = [
  { id: 'TTC_001', name: 'Dr. Priya Sharma', email: 'priya.sharma@pragati.com', collegeId: 'COL001', expertise: ['AI', 'Machine Learning'], maxConsultations: 3, currentConsultations: 1, status: 'Active' },
  { id: 'TTC_002', name: 'Mr. Rahul Verma', email: 'rahul.verma@pragati.com', collegeId: 'COL001', expertise: ['Blockchain', 'FinTech'], maxConsultations: 2, currentConsultations: 0, status: 'Active' },
  { id: 'TTC_003', name: 'Ms. Sneha Reddy', email: 'sneha.reddy@pragati.com', collegeId: 'COL002', expertise: ['Robotics', 'IoT'], maxConsultations: 4, currentConsultations: 0, status: 'Inactive' },
];

export let MOCK_INNOVATORS = [
  { id: 'INV001', name: 'Jane Doe', email: 'jane.doe@example.com', collegeId: 'COL001', credits: 50, status: 'Active', hasPsychometricAnalysis: true, teamId: 'TEAM-001' },
  { id: 'INV002', name: 'John Smith', email: 'john.smith@example.com', collegeId: 'COL002', credits: 30, status: 'Active', hasPsychometricAnalysis: true, teamId: 'TEAM-002' },
  { id: 'INV003', name: 'Alice Johnson', email: 'alice.j@example.com', collegeId: 'COL001', credits: 20, status: 'Active', hasPsychometricAnalysis: false, teamId: 'TEAM-001' },
  { id: 'INV004', name: 'Bob Brown', email: 'bob.b@example.com', collegeId: 'COL001', credits: 0, status: 'Inactive', hasPsychometricAnalysis: false, teamId: 'TEAM-003' },
];

export const MOCK_PRINCIPAL_USERS = [
    { email: 'principal.pit@pragati.com', password: 'principalpass', name: 'Principal PIT', collegeId: 'COL001' },
    { email: 'principal.gsi@pragati.com', password: 'principalpass', name: 'Principal GSI', collegeId: 'COL002' },
    { email: 'principal.tuc@pragati.com', password: 'principalpass', name: 'Principal TUC', collegeId: 'COL003' },
];

export let MOCK_CREDIT_ASSIGNMENT_HISTORY = [
  { id: 1, date: '2024-07-10', ttcId: 'TTC_001', innovatorId: 'INV001', amount: 10, action: 'Assigned' },
  { id: 2, date: '2024-07-12', ttcId: 'TTC_001', innovatorId: 'INV003', amount: 5, action: 'Assigned' },
];

export let MOCK_TTC_AUDIT_TRAIL = [
  { id: 1, timestamp: '2024-07-15 11:00 AM', ttc: 'Dr. Priya Sharma', action: 'Scheduled consultation for IDEA-001' },
  { id: 2, timestamp: '2024-07-15 11:30 AM', ttc: 'Dr. Priya Sharma', action: 'Added feedback for IDEA-001' },
  { id: 3, timestamp: '2024-07-14 02:00 PM', ttc: 'Mr. Rahul Verma', action: 'Viewed Idea IDEA-002 report' },
];

export const STATUS_COLORS: { [key: string]: 'default' | 'destructive' | 'secondary' | 'outline' } = {
  Validating: 'secondary',
  Approved: 'default',
  Exemplary: 'default',
  Developing: 'secondary',
  'Needs Refinement': 'destructive',
  Slay: 'default',
  Mid: 'secondary',
  Flop: 'destructive',
  GOOD: 'default',
  Moderate: 'secondary',
  MODERATE: 'secondary',
  Rejected: 'destructive',
  'NOT RECOMMENDED': 'destructive',
  Pending: 'secondary',
  Scheduled: 'default',
  Completed: 'default',
  Active: 'default',
  Inactive: 'secondary',
  Locked: 'destructive',
  'Not Requested': 'outline',
  Cancelled: 'destructive',
};

  export const MOCK_SCORING_PRESETS = {
    "Balanced": {
      "Core Idea": 15, "Market Opportunity": 20, "Execution": 20,
      "Business Model": 15, "Team": 10, "Compliance": 10, "Risk & Strategy": 10
    },
    "Research": {
      "Core Idea": 30, "Market Opportunity": 10, "Execution": 15,
      "Business Model": 15, "Team": 10, "Compliance": 10, "Risk & Strategy": 10
    },
    "Commercialization": {
      "Core Idea": 10, "Market Opportunity": 30, "Execution": 15,
      "Business Model": 15, "Team": 10, "Compliance": 10, "Risk & Strategy": 10
    },
  };

  export const MOCK_NOTIFICATIONS: Record<Role, { id: number; title: string; description: string; read: boolean; }[]> = {
  [ROLES.INNOVATOR]: [
    { id: 1, title: 'Idea "Smart Farming" Validated', description: 'Your idea has been successfully validated with an "Approved" status.', read: false },
    { id: 2, title: 'Credit Request Approved', description: 'Your request for 5 credits has been approved by your TTC.', read: true },
    { id: 3, title: 'Upcoming Consultation', description: 'Your meeting with Dr. Emily White is scheduled for tomorrow at 10 AM.', read: false },
  ],
  [ROLES.COORDINATOR]: [
    { id: 1, title: 'New Credit Request', description: 'Innovator Jane Doe has requested 2 credits.', read: false },
    { id: 2, title: 'Consultation Scheduled', description: 'Innovator John Smith has scheduled a consultation with you.', read: true },
    { id: 3, title: 'Your Credit Request Approved', description: 'Your request for 20 credits has been approved by the Principal.', read: false },
  ],
  [ROLES.PRINCIPAL]: [
    { id: 1, title: 'New Credit Request from TTC', description: 'TTC Dr. Priya Sharma has requested 20 credits.', read: false },
    { id: 2, title: 'Plan Upgrade Recommended', description: 'Your usage is high. Consider upgrading to the Advance Pro plan.', read: true },
    { id: 3, title: 'Payment Due', description: 'Your monthly subscription payment is due next week.', read: true },
  ],
  [ROLES.SUPER_ADMIN]: [
    { id: 1, title: 'New Support Ticket #12345', description: 'A new high-priority support ticket has been opened.', read: false },
    { id: 2, title: 'System Load Normal', description: 'System performance is stable.', read: true },
  ],
};

    