import {
  Home,
  LayoutGrid,
  Lightbulb,
  Settings,
  Users,
  Shield,
  FileText,
  PlusCircle,
  MessageSquare,
  CreditCard,
  LifeBuoy,
  BrainCircuit,
  Briefcase,
  BarChart3,
  Receipt,
  User,
  Bell,
  ListChecks,
  CalendarDays,
  BarChart,
  FilePieChart,
  Rocket,
  Bot,
  Mail,
  Send,
} from "lucide-react";

export const ROLES = {
  INNOVATOR: "innovator",
  PRINCIPAL: "college_admin",
  COORDINATOR: "ttc_coordinator",
  SUPER_ADMIN: "super_admin",
  MENTOR: "mentor",
  TEAM_MEMBER: "team_member",
  INTERNAL_MENTOR: "internal_mentor",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const NAV_LINKS: Record<
  Role,
  {
    title: string;
    label?: string;
    icon: React.ElementType;
    href: string;
    subItems?: { title: string; href: string; icon: React.ElementType }[];
  }[]
> = {
  [ROLES.INNOVATOR]: [
    {
      title: "Dashboard",
      icon: Home,
      href: `/dashboard?role=${ROLES.INNOVATOR}`,
    },
    {
      title: "Submit Idea",
      icon: PlusCircle,
      href: `/dashboard/submit?role=${ROLES.INNOVATOR}`,
    },
    {
      title: "My Ideas",
      icon: Lightbulb,
      href: `/dashboard/ideas?role=${ROLES.INNOVATOR}`,
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: `/dashboard/analytics?role=${ROLES.INNOVATOR}`,
    },
    {
      title: "Consultations",
      icon: MessageSquare,
      href: `/dashboard/consultations?role=${ROLES.INNOVATOR}`,
    },
    {
      title: "Psychometric Analysis",
      icon: BrainCircuit,
      href: `/dashboard/psychometric-analysis?role=${ROLES.INNOVATOR}`,
    },
    {
      title: "Reports",
      icon: FilePieChart,
      href: `/dashboard/reports?role=${ROLES.INNOVATOR}`,
    },
  ],
  [ROLES.PRINCIPAL]: [
    {
      title: "Dashboard",
      icon: Home,
      href: `/dashboard/principal?role=${ROLES.PRINCIPAL}`,
    },
    {
      title: "TTC Management",
      icon: Users,
      href: `/dashboard/principal/ttc-management?role=${ROLES.PRINCIPAL}`,
    },
    {
      title: "Mentor Management",
      icon: Users,
      href: `/dashboard/principal/mentors?role=${ROLES.PRINCIPAL}`,
    },
    {
      title: "Idea Management",
      icon: Lightbulb,
      href: `/dashboard/principal/ideas?role=${ROLES.PRINCIPAL}`,
    },
    {
      title: "Plan & Payment",
      icon: Receipt,
      href: `/dashboard/principal/plan-payment?role=${ROLES.PRINCIPAL}`,
    },
    {
      title: "College Analytics",
      icon: BarChart,
      href: `/dashboard/principal/analytics?role=${ROLES.PRINCIPAL}`,
    },
    {
      title: "Credit Requests",
      icon: CreditCard,
      href: `/dashboard/principal/credit-requests?role=${ROLES.PRINCIPAL}`,
    },
    {
      title: "Audit Trail",
      icon: FileText,
      href: `/dashboard/principal/audit-trail?role=${ROLES.PRINCIPAL}`,
    },
    {
      title: "Reports",
      icon: FilePieChart,
      href: `/dashboard/reports?role=${ROLES.PRINCIPAL}`,
    },
  ],
  [ROLES.COORDINATOR]: [
    {
      title: "Dashboard",
      icon: Home,
      href: `/dashboard/coordinator?role=${ROLES.COORDINATOR}`,
    },
    {
      title: "Manage Innovators",
      icon: Users,
      href: `/dashboard/coordinator/innovator-management?role=${ROLES.COORDINATOR}`,
    },
    {
      title: "Consultations",
      icon: MessageSquare,
      href: `/dashboard/coordinator/consultations?role=${ROLES.COORDINATOR}`,
    },
    {
      title: "Manage Ideas",
      icon: Lightbulb,
      href: `/dashboard/coordinator/manage-ideas?role=${ROLES.COORDINATOR}`,
    },
    {
      title: "Analytics",
      icon: BarChart,
      href: `/dashboard/coordinator/analytics?role=${ROLES.COORDINATOR}`,
    },
    {
      title: "Logs & Requests",
      icon: FileText,
      href: `/dashboard/coordinator/logs?role=${ROLES.COORDINATOR}`,
    },
    {
      title: "Reports",
      icon: FilePieChart,
      href: `/dashboard/reports?role=${ROLES.COORDINATOR}`,
    },
  ],
  [ROLES.MENTOR]: [
    {
      title: "Dashboard",
      icon: Home,
      href: `/dashboard/mentor?role=${ROLES.MENTOR}`,
    },
    {
      title: "My Innovators",
      icon: Users,
      href: `/dashboard/mentor/innovators?role=${ROLES.MENTOR}`,
    },
    {
      title: "My Consultations",
      icon: MessageSquare,
      href: `/dashboard/mentor/consultations?role=${ROLES.MENTOR}`,
    },
    {
      title: "Psychometric Analysis",
      icon: BrainCircuit,
      href: `/dashboard/psychometric-analysis?role=${ROLES.MENTOR}`,
    },
    {
      title: "Reports",
      icon: FilePieChart,
      href: `/dashboard/reports?role=${ROLES.MENTOR}`,
    },
  ],
  [ROLES.TEAM_MEMBER]: [
    {
      title: "Dashboard",
      icon: Home,
      href: `/dashboard/member?role=${ROLES.TEAM_MEMBER}`,
    },
    {
      title: "My Ideas",
      icon: Lightbulb,
      href: `/dashboard/member/my-ideas?role=${ROLES.TEAM_MEMBER}`,
    },
    {
      title: "Invites",
      icon: Mail,
      href: `/dashboard/member/invites?role=${ROLES.TEAM_MEMBER}`,
    },
    {
      title: "Psychometric Analysis",
      icon: BrainCircuit,
      href: `/dashboard/psychometric-analysis?role=${ROLES.TEAM_MEMBER}`,
    },
    {
      title: "Reports",
      icon: FilePieChart,
      href: `/dashboard/reports?role=${ROLES.TEAM_MEMBER}`,
    },
  ],
  [ROLES.INTERNAL_MENTOR]: [
    {
      title: "Dashboard",
      icon: Home,
      href: `/dashboard/member?role=${ROLES.INTERNAL_MENTOR}`,
    },
    {
      title: "My Ideas",
      icon: Lightbulb,
      href: `/dashboard/member/my-ideas?role=${ROLES.INTERNAL_MENTOR}`,
    },
    {
      title: "Invites",
      icon: Mail,
      href: `/dashboard/member/invites?role=${ROLES.INTERNAL_MENTOR}`,
    },
    {
      title: "Psychometric Analysis",
      icon: BrainCircuit,
      href: `/dashboard/psychometric-analysis?role=${ROLES.INTERNAL_MENTOR}`,
    },
    {
      title: "Reports",
      icon: FilePieChart,
      href: `/dashboard/reports?role=${ROLES.INTERNAL_MENTOR}`,
    },
  ],
  [ROLES.SUPER_ADMIN]: [
    {
      title: "Dashboard",
      icon: Home,
      href: `/dashboard/admin?role=${ROLES.SUPER_ADMIN}`,
    },
    {
      title: "God's Eye View",
      icon: Bot,
      href: `/dashboard/admin/gods-eye-view?role=${ROLES.SUPER_ADMIN}`,
    },
    {
      title: "Institution Management",
      icon: Briefcase,
      href: `/dashboard/admin/institutions?role=${ROLES.SUPER_ADMIN}`,
    },
    {
      title: "Plan Configuration",
      icon: Settings,
      href: `/dashboard/admin/plans?role=${ROLES.SUPER_ADMIN}`,
    },
    {
      title: "Idea Oversight",
      icon: Lightbulb,
      href: `/dashboard/admin/ideas?role=${ROLES.SUPER_ADMIN}`,
    },
    {
      title: "Consultation Requests",
      icon: CalendarDays,
      href: `/dashboard/admin/consultation-requests?role=${ROLES.SUPER_ADMIN}`,
    },
    {
      title: "AI Engine Control",
      icon: BrainCircuit,
      href: `/dashboard/admin/ai-engine?role=${ROLES.SUPER_ADMIN}`,
    },
    {
      title: "Innovator Insights",
      icon: User,
      href: `/dashboard/admin/innovator-insights?role=${ROLES.SUPER_ADMIN}`,
    },
    {
      title: "Advanced Analytics",
      icon: BarChart,
      href: `/dashboard/admin/analytics?role=${ROLES.SUPER_ADMIN}`,
    },
    {
      title: "Notifications",
      icon: MessageSquare,
      href: `/dashboard/admin/notifications?role=${ROLES.SUPER_ADMIN}`,
    },
    {
      title: "Security & Logs",
      icon: Shield,
      href: `/dashboard/admin/security?role=${ROLES.SUPER_ADMIN}`,
    },
    {
      title: "Reports",
      icon: FilePieChart,
      href: `/dashboard/reports?role=${ROLES.SUPER_ADMIN}`,
    },
  ],
};

export const ROADMAP_PHASES = [
  {
    name: "Phase 1: Ideation",
    trls: ["TRL 1", "TRL 2"],
    timeline: "1-2 Weeks",
    keyActivities: [
      {
        text: "Conduct market research and competitive analysis (SWOT).",
        timeline: "3-5 Days",
      },
      {
        text: "Define your value proposition and business model.",
        timeline: "2-4 Days",
      },
      {
        text: "Secure your idea with provisional patents or NDAs.",
        timeline: "5-7 Days",
      },
    ],
  },
  {
    name: "Phase 2: Prototyping",
    trls: ["TRL 3", "TRL 4"],
    timeline: "3-6 Weeks",
    keyActivities: [
      {
        text: "Create detailed product designs, mockups, and wireframes.",
        timeline: "7-10 Days",
      },
      {
        text: "Build a Proof-of-Concept (POC) or Minimum Viable Product (MVP).",
        timeline: "10-20 Days",
      },
      {
        text: "Conduct user testing with a small, targeted group.",
        timeline: "4-7 Days",
      },
    ],
  },
  {
    name: "Phase 3: Validation",
    trls: ["TRL 5", "TRL 6", "TRL 7"],
    timeline: "4-8 Weeks",
    keyActivities: [
      {
        text: "Finalize technical specifications for manufacturing (DFM).",
        timeline: "10-15 Days",
      },
      {
        text: "Launch a market test via crowdfunding or a pilot program.",
        timeline: "15-30 Days",
      },
      {
        text: "Perform live demonstrations of the product in a real-world setting.",
        timeline: "5-10 Days",
      },
    ],
  },
  {
    name: "Phase 4: Launch",
    trls: ["TRL 8"],
    timeline: "6-10 Weeks",
    keyActivities: [
      {
        text: "Establish supplier relationships and finalize production plans.",
        timeline: "20-30 Days",
      },
      {
        text: "Develop a comprehensive branding and marketing strategy.",
        timeline: "15-20 Days",
      },
      {
        text: "Execute the launch plan and monitor key performance indicators (KPIs).",
        timeline: "10-15 Days",
      },
    ],
  },
  {
    name: "Phase 5: Growth",
    trls: ["TRL 9"],
    timeline: "Ongoing",
    keyActivities: [
      {
        text: "Scale production and explore new market segments or product variations.",
        timeline: "Ongoing",
      },
      {
        text: "Continuously gather customer feedback for future iterations.",
        timeline: "Ongoing",
      },
      {
        text: "Optimize operations and streamline processes to increase efficiency.",
        timeline: "Ongoing",
      },
    ],
  },
];
