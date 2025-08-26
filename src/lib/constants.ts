
import { Home, LayoutGrid, Lightbulb, Settings, Users, Shield, FileText, PlusCircle, MessageSquare, CreditCard, LifeBuoy, BrainCircuit, Briefcase, BarChart3, Receipt, User, Bell, ListChecks, CalendarDays, BarChart, FilePieChart } from "lucide-react";

export const ROLES = {
  INNOVATOR: "Innovator",
  PRINCIPAL: "College Principal Admin",
  COORDINATOR: "TTC Coordinator",
  SUPER_ADMIN: "Super Admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const NAV_LINKS: Record<
  Role,
  {
    title: string;
    label?: string;
    icon: React.ElementType;
    href: string;
    subItems?: { title: string; href: string, icon: React.ElementType }[];
  }[]
> = {
  [ROLES.INNOVATOR]: [
    {
      title: "Dashboard",
      icon: Home,
      href: `/dashboard?role=${ROLES.INNOVATOR}`,
    },
    {
      title: "Founder Analysis",
      icon: User,
      href: `/dashboard/psychometric-analysis?role=${ROLES.INNOVATOR}`,
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
        title: "Request Credits",
        icon: CreditCard,
        href: `/dashboard/request-credits?role=${ROLES.INNOVATOR}`,
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
      title: "Plan & Payment",
      icon: Receipt,
      href: `/dashboard/principal/plan-payment?role=${ROLES.PRINCIPAL}`,
    },
    {
      title: "College Analytics",
      icon: BarChart3,
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
      icon: BarChart3,
      href: `/dashboard/coordinator/analytics?role=${ROLES.COORDINATOR}`,
    },
    {
        title: "Logs & Requests",
        icon: FileText,
        href: `/dashboard/coordinator/logs?role=${ROLES.COORDINATOR}`,
    },
  ],
  [ROLES.SUPER_ADMIN]: [
    {
      title: "Dashboard",
      icon: Home,
      href: `/dashboard/admin?role=${ROLES.SUPER_ADMIN}`,
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
        icon: BarChart3,
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
  ],
};
