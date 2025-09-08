import type { Role } from "../constants";
import { ROLES } from "../constants";

export const MOCK_DOMAINS_WITH_SUBDOMAINS = [
  {
    name: "HealthTech",
    subDomains: ["Telemedicine", "Wearables", "Diagnostics", "PharmaTech"],
  },
  {
    name: "EdTech",
    subDomains: [
      "K-12",
      "Higher Education",
      "Corporate Learning",
      "Skill Development",
    ],
  },
  {
    name: "FinTech",
    subDomains: ["Payments", "Lending", "InsurTech", "WealthTech"],
  },
  {
    name: "Agriculture",
    subDomains: [
      "Precision Farming",
      "Supply Chain",
      "Biotechnology",
      "Farm Management",
    ],
  },
  {
    name: "Retail",
    subDomains: ["E-commerce", "Logistics", "In-store Tech", "CPG"],
  },
];

export let MOCK_CONSULTATIONS: {
  id: string;
  ideaId: string;
  innovatorId: string;
  title: string;
  date: string;
  time: string;
  mentor: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Pending" | "Rejected";
  agenda: string[];
  pointsDiscussed: string[];
  actionItems: { task: string; owner: string; dueDate: string }[];
  nextSteps: string;
  reportUrl: string;
  milestones: string[];
  files: string[];
}[] = [
  {
    id: "CONS-001",
    ideaId: "IDEA-001",
    innovatorId: "INV001",
    title: "Discussion on MVP for Smart Farming",
    date: "2024-07-20",
    time: "10:00 AM",
    mentor: "Dr. Emily White",
    status: "Scheduled",
    agenda: [
      "Review MVP feature list",
      "Finalize tech stack",
      "Set 2-week sprint goals",
    ],
    pointsDiscussed: [],
    actionItems: [],
    nextSteps: "",
    reportUrl: "",
    milestones: ["Finalize tech stack", "Define 2-week sprint goals"],
    files: ["pitch_deck_v2.pdf", "market_research.docx"],
  },
  {
    id: "CONS-002",
    ideaId: "IDEA-002",
    innovatorId: "INV002",
    title: "Market Strategy Review for EdTech",
    date: "2024-07-18",
    time: "02:00 PM",
    mentor: "Prof. Alex Green",
    status: "Completed",
    agenda: [
      "Analyze competitor landscape",
      "Define target user persona",
      "Brainstorm go-to-market strategies",
    ],
    pointsDiscussed: [
      "Current market is saturated with generic learning platforms.",
      "Opportunity exists in vocational and skill-based training for Tier-2/3 cities.",
      "Initial target persona should be young adults aged 18-24 seeking job-ready skills.",
    ],
    actionItems: [
      {
        task: "Conduct survey with 50 potential users from target demographic.",
        owner: "John Smith",
        dueDate: "2024-08-01",
      },
      {
        task: "Develop a low-fidelity prototype of the core user journey.",
        owner: "John Smith",
        dueDate: "2024-08-15",
      },
    ],
    nextSteps:
      "Next meeting scheduled for 2024-08-20 to review survey results and prototype feedback.",
    reportUrl: "/mock-report.pdf",
    milestones: [],
    files: ["competitor_analysis.xlsx", "user_persona_map.pdf"],
  },
  {
    id: "CONS-003",
    ideaId: "IDEA-004",
    innovatorId: "INV004",
    title: "Smart City Traffic Management - Next Steps",
    date: "2024-08-05",
    time: "11:00 AM",
    mentor: "Dr. Anjali Rao",
    status: "Pending", // Pending Super Admin approval
    agenda: ["Finalize pilot program details", "Identify key city partners"],
    pointsDiscussed: [],
    actionItems: [],
    nextSteps: "",
    reportUrl: "",
    milestones: [],
    files: [],
  },
  {
    id: "CONS-004",
    ideaId: "IDEA-004",
    innovatorId: "INV004",
    title: "Follow-up on City Partners",
    date: "2024-08-15",
    time: "03:00 PM",
    mentor: "Dr. Anjali Rao",
    status: "Pending", // Pending Super Admin approval
    agenda: ["Review partner proposals"],
    pointsDiscussed: [],
    actionItems: [],
    nextSteps: "",
    reportUrl: "",
    milestones: [],
    files: [],
  },
];

export let MOCK_CREDIT_REQUESTS: {
  id: string;
  requesterType: "College" | "TTC" | "Innovator";
  requesterId: string;
  requesterName: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
  purpose: string;
}[] = [
  {
    id: "CR-COL-001",
    requesterType: "College",
    requesterId: "COL001",
    requesterName: "Pragati Institute of Technology",
    amount: 50,
    status: "Pending",
    date: "2024-07-10",
    purpose: "Bulk credits for new semester",
  },
  {
    id: "CR-TTC-001",
    requesterType: "TTC",
    requesterId: "TTC_001",
    requesterName: "Dr. Priya Sharma",
    amount: 20,
    status: "Pending",
    date: "2024-07-14",
    purpose: "Credits for upcoming innovator batch",
  },
  {
    id: "CR-INV-001",
    requesterType: "Innovator",
    requesterId: "innovator-001",
    requesterName: "Jane Doe",
    amount: 1,
    status: "Pending",
    date: "2024-07-15",
    purpose: "Need 1 credit for new idea submission",
  },
  {
    id: "CR-INV-002",
    requesterType: "Innovator",
    requesterId: "INV002",
    requesterName: "John Smith",
    amount: 5,
    status: "Approved",
    date: "2024-07-12",
    purpose: "Resubmission of project",
  },
];

export let MOCK_PLANS = [
  // Monthly Plans
  {
    id: "PLAN001-M",
    name: "Essential Monthly",
    pricePerCredit: 500,
    minCredits: 20,
    totalAmount: 10000,
    features: ["20 Idea Submissions", "Basic Feedback", "5 TTCs"],
    enabled: true,
    interval: "monthly",
  },
  {
    id: "PLAN002-M",
    name: "Advance Monthly",
    pricePerCredit: 490,
    minCredits: 50,
    totalAmount: 24500,
    features: [
      "50 Idea Submissions",
      "Detailed Feedback",
      "10 TTCs",
      "2 Consultations",
    ],
    enabled: true,
    interval: "monthly",
  },
  {
    id: "PLAN003-M",
    name: "Advance Pro Monthly",
    pricePerCredit: 475,
    minCredits: 100,
    totalAmount: 47500,
    features: [
      "Unlimited Idea Submissions",
      "Premium Feedback",
      "15 TTCs",
      "Unlimited Consultations",
    ],
    enabled: true,
    interval: "monthly",
  },

  // Yearly Plans (with a discount)
  {
    id: "PLAN001-Y",
    name: "Essential Yearly",
    pricePerCredit: 450,
    minCredits: 240,
    totalAmount: 108000,
    features: [
      "240 Idea Submissions",
      "Basic Feedback",
      "5 TTCs",
      "10% Discount",
    ],
    enabled: true,
    interval: "yearly",
  },
  {
    id: "PLAN002-Y",
    name: "Advance Yearly",
    pricePerCredit: 440,
    minCredits: 600,
    totalAmount: 264000,
    features: [
      "600 Idea Submissions",
      "Detailed Feedback",
      "10 TTCs",
      "24 Consultations",
      "12% Discount",
    ],
    enabled: true,
    interval: "yearly",
  },
  {
    id: "PLAN003-Y",
    name: "Advance Pro Yearly",
    pricePerCredit: 425,
    minCredits: 1200,
    totalAmount: 510000,
    features: [
      "Unlimited Idea Submissions",
      "Premium Feedback",
      "15 TTCs",
      "Unlimited Consultations",
      "15% Discount",
    ],
    enabled: true,
    interval: "yearly",
  },

  // Enterprise Plan (same for both intervals)
  {
    id: "PLAN004-E",
    name: "Enterprises",
    pricePerCredit: 0,
    minCredits: 0,
    totalAmount: 0,
    features: [
      "Custom Limits",
      "Dedicated Support",
      "Tailored Solutions",
      "Contact Us for Pricing",
    ],
    enabled: true,
    interval: "monthly",
  },
  {
    id: "PLAN004-E",
    name: "Enterprises",
    pricePerCredit: 0,
    minCredits: 0,
    totalAmount: 0,
    features: [
      "Custom Limits",
      "Dedicated Support",
      "Tailored Solutions",
      "Contact Us for Pricing",
    ],
    enabled: true,
    interval: "yearly",
  },
];

export let MOCK_CREDIT_ASSIGNMENT_HISTORY = [
  {
    id: 1,
    date: "2024-07-10",
    ttcId: "TTC_001",
    innovatorId: "INV001",
    amount: 10,
    action: "Assigned",
  },
  {
    id: 2,
    date: "2024-07-12",
    ttcId: "TTC_001",
    innovatorId: "INV003",
    amount: 5,
    action: "Assigned",
  },
];

export let MOCK_TTC_AUDIT_TRAIL: {
  id: number;
  logId: string;
  timestamp: string;
  actor: string;
  action: string;
  category:
    | "User Management"
    | "Idea Lifecycle"
    | "Credit Transactions"
    | "Consultations"
    | "System";
}[] = [
  {
    id: 1,
    logId: "0xa1b2c3d4",
    timestamp: "2024-07-15 11:00 AM",
    actor: "Dr. Priya Sharma",
    action: "Scheduled consultation for IDEA-001",
    category: "Consultations",
  },
  {
    id: 2,
    logId: "0xb2c3d4e5",
    timestamp: "2024-07-15 11:30 AM",
    actor: "Dr. Priya Sharma",
    action: "Added feedback for IDEA-001",
    category: "Idea Lifecycle",
  },
  {
    id: 3,
    logId: "0xc3d4e5f6",
    timestamp: "2024-07-14 02:00 PM",
    actor: "Mr. Rahul Verma",
    action: "Viewed Idea IDEA-002 report",
    category: "Idea Lifecycle",
  },
  {
    id: 4,
    logId: "0xd4e5f6g7",
    timestamp: "2024-07-13 09:00 AM",
    actor: "Principal PIT",
    action: "Approved 20 credits for Dr. Priya Sharma",
    category: "Credit Transactions",
  },
  {
    id: 5,
    logId: "0xe5f6g7h8",
    timestamp: "2024-07-12 04:00 PM",
    actor: "Dr. Priya Sharma",
    action: "Activated innovator Alice Johnson",
    category: "User Management",
  },
  {
    id: 6,
    logId: "0xf6g7h8i9",
    timestamp: "2024-07-11 10:00 AM",
    actor: "System",
    action: "Idea IDEA-006 submitted by Priya Singh",
    category: "Idea Lifecycle",
  },
  {
    id: 7,
    logId: "0xg7h8i9j0",
    timestamp: "2024-07-10 05:00 PM",
    actor: "Principal PIT",
    action: "Deactivated TTC Ms. Sneha Reddy",
    category: "User Management",
  },
  {
    id: 8,
    logId: "0xh8i9j0k1",
    timestamp: "2024-07-09 03:00 PM",
    actor: "Dr. Priya Sharma",
    action: "Rejected credit request from Bob Brown",
    category: "Credit Transactions",
  },
];

export const MOCK_NOTIFICATIONS: Record<
  Role,
  { id: number; title: string; description: string; read: boolean }[]
> = {
  [ROLES.INNOVATOR]: [
    {
      id: 1,
      title: 'Idea "Smart Farming" Validated',
      description:
        'Your idea has been successfully validated with an "Approved" status.',
      read: false,
    },
    {
      id: 2,
      title: "Credit Request Approved",
      description: "Your request for 5 credits has been approved by your TTC.",
      read: true,
    },
    {
      id: 3,
      title: "Upcoming Consultation",
      description:
        "Your meeting with Dr. Emily White is scheduled for tomorrow at 10 AM.",
      read: false,
    },
  ],
  [ROLES.COORDINATOR]: [
    {
      id: 1,
      title: "New Credit Request",
      description: "Innovator Jane Doe has requested 2 credits.",
      read: false,
    },
    {
      id: 2,
      title: "Consultation Scheduled",
      description:
        "Innovator John Smith has scheduled a consultation with you.",
      read: true,
    },
    {
      id: 3,
      title: "Your Credit Request Approved",
      description:
        "Your request for 20 credits has been approved by the Principal.",
      read: false,
    },
  ],
  [ROLES.PRINCIPAL]: [
    {
      id: 1,
      title: "New Credit Request from TTC",
      description: "TTC Dr. Priya Sharma has requested 20 credits.",
      read: false,
    },
    {
      id: 2,
      title: "Plan Upgrade Recommended",
      description:
        "Your usage is high. Consider upgrading to the Advance Pro plan.",
      read: false,
    },
    {
      id: 3,
      title: "Payment Due",
      description: "Your monthly subscription payment is due next week.",
      read: true,
    },
  ],
  [ROLES.SUPER_ADMIN]: [
    {
      id: 1,
      title: "New Support Ticket #12345",
      description: "A new high-priority support ticket has been opened.",
      read: false,
    },
    {
      id: 2,
      title: "System Load Normal",
      description: "System performance is stable.",
      read: true,
    },
    {
      id: 3,
      title: "New Consultation Request",
      description:
        "Mentor Dr. Anjali Rao has scheduled a consultation for idea IDEA-004. Awaiting your approval.",
      read: false,
    },
  ],
  [ROLES.MENTOR]: [
    {
      id: 1,
      title: "New Idea Assigned",
      description: 'You have been assigned to "AI-Powered Smart Farming".',
      read: false,
    },
    {
      id: 2,
      title: "Consultation Approved",
      description:
        "Your consultation request for IDEA-004 has been approved by the Super Admin.",
      read: true,
    },
  ],
  [ROLES.TEAM_MEMBER]: [],
  [ROLES.INTERNAL_MENTOR]: [],
};

export const STATUS_COLORS: { [key: string]: string } = {
  Validating: "bg-gray-500 text-white",
  Approved: "bg-green-500 text-white",
  approved: "bg-green-500 text-white",
  Slay: "bg-green-500 text-white",
  Mid: "bg-orange-500 text-white",
  Flop: "bg-red-500 text-white",
  GOOD: "bg-green-500 text-white",
  Moderate: "bg-orange-500 text-white",
  MODERATE: "bg-orange-500 text-white",
  Rejected: "bg-red-500 text-white",
  declined: "bg-red-500 text-white",
  "NOT RECOMMENDED": "bg-red-500 text-white",
  Pending: "bg-blue-500 text-white",
  Scheduled: "bg-indigo-500 text-white",
  Completed: "bg-green-600 text-white",
  Active: "bg-green-500 text-white",
  Inactive: "bg-gray-500 text-white",
  Locked: "bg-red-600 text-white",
  "Not Requested": "bg-gray-400 text-white",
  Cancelled: "bg-gray-500 text-white",
};
