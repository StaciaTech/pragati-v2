"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Logo from "../vencorplogo.png";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV_LINKS, ROLES, type Role } from "@/lib/constants";
import { MOCK_INNOVATOR_USER } from "@/lib/data/auth";
import { MOCK_TTCS, MOCK_COLLEGES } from "@/lib/data/organization";
import { MOCK_CONSULTATIONS } from "@/lib/data/platform";
import { CreditCard, LogOut, CalendarDays, LifeBuoy } from "lucide-react";
import { Notifications } from "@/components/notifications";
import { Suspense } from "react";
import { HydrationSafeContent } from "@/components/hydration-safe-content";
import { UniversalSearch } from "@/components/universal-search";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { UserNav } from "@/components/user-nav";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUserProfile } from "@/hooks/useUserProfile";
import Image from "next/image";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: user } = useUserProfile();

  const searchParams = useSearchParams();
  const role = (searchParams.get("role") as Role) || ROLES.INNOVATOR;

  const navLinks = NAV_LINKS[role] || [];

  const getCredits = () => {
    if (role === ROLES.INNOVATOR) {
      return MOCK_INNOVATOR_USER.credits;
    }
    if (role === ROLES.COORDINATOR) {
      const userTTC = MOCK_TTCS[0];
      const college = MOCK_COLLEGES.find((c) => c.id === userTTC.collegeId);
      return college?.creditsAvailable || 0;
    }
    return null;
  };

  const getCreditRequestLink = () => {
    if (role === ROLES.INNOVATOR) {
      return `/dashboard/request-credits?role=${role}`;
    }
    if (role === ROLES.COORDINATOR) {
      return `/dashboard/coordinator/logs?role=${role}`;
    }
    return "#";
  };

  const credits = getCredits();
  const upcomingConsultations = MOCK_CONSULTATIONS.filter(
    (c) => c.status === "Scheduled"
  ).length;

  // INNOVATOR: "Innovator",
  // PRINCIPAL: "College Principal Admin",
  // COORDINATOR: "TTC Coordinator",
  // SUPER_ADMIN: "Super Admin",
  // MENTOR: "Mentor",
  // TEAM_MEMBER: "Team Member",
  // INTERNAL_MENTOR: "Internal Mentor",

  const displayRole = () => {
    switch (role) {
      case "innovator":
        return "Innovator";
      case "college_admin":
        return "College Principal Admin";
      case "ttc_coordinator":
        return "TTC Coordinator";
      case "super_admin":
        return "Super Admin";
      case "mentor":
        return "Mentor";
      case "team_member":
        return "Team Member";
      case "internal_mentor":
        return "Internal Mentor";
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon" className="group/sidebar">
        <SidebarHeader>
          <Link
            href={`/dashboard?role=${role}`}
            className="flex h-23 items-center rounded-md p-2 transition-all duration-300 ease-in-out group-data-[state=collapsed]/sidebar:justify-center group-data-[state=expanded]/sidebar:justify-start"
          >
            <Image
              src={Logo}
              alt="PragatiAI Logo"
              className="h-5 w-11 object-contain transition-transform duration-300 ease-in-out group-data-[state=collapsed]/sidebar:scale-125 group-data-[state=expanded]/sidebar:scale-150"
              priority
            />
            <span className="flex-1 overflow-hidden whitespace-nowrap text-lg font-semibold text-sidebar-foreground transition-all duration-300 ease-in-out group-data-[state=collapsed]/sidebar:w-0 group-data-[state=collapsed]/sidebar:ml-0 group-data-[state=collapsed]/sidebar:opacity-0 group-data-[state=collapsed]/sidebar:invisible group-data-[state=expanded]/sidebar:py-1 group-data-[state=expanded]/sidebar:w-auto group-data-[state=expanded]/sidebar:ml-4 group-data-[state=expanded]/sidebar:opacity-100 group-data-[state=expanded]/sidebar:visible group-data-[state=expanded]/sidebar:py-4">
              PragatiAI
            </span>
          </Link>
          <div className="flex w-full justify-end pr-32">
            <SidebarSeparator className="w-0" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navLinks.map((link) => (
              <SidebarMenuItem key={link.title}>
                <SidebarMenuButton
                  asChild
                  isActive={
                    pathname === new URL(link.href, "http://a").pathname
                  }
                >
                  <Link href={link.href}>
                    <div className="w-10 h-4 flex justify-center items-center shrink-0 transition-all duration-300 ease-in-out group-data-[state=collapsed]/sidebar:scale-100 group-data-[state=expanded]/sidebar:scale-110">
                      <link.icon className="w-5 h-6" />
                    </div>
                    <span className="flex-1 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out group-data-[state=collapsed]/sidebar:w-0 group-data-[state=collapsed]/sidebar:ml-1 group-data-[state=collapsed]/sidebar:opacity-0 group-data-[state=collapsed]/sidebar:invisible group-data-[state=expanded]/sidebar:w-auto group-data-[state=expanded]/sidebar:ml-1 group-data-[state=expanded]/sidebar:opacity-100 group-data-[state=expanded]/sidebar:visible">
                      {link.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarSeparator className="mb-2" />
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  href={`/dashboard/support?role=${role}`}
                  className="flex items-center gap-3 min-w-0"
                >
                  <div className="w-5 shrink-0 flex items-center justify-center transition-all duration-200 ease-in-out group-data-[state=collapsed]/sidebar:scale-100 group-data-[state=expanded]/sidebar:scale-110">
                    <LifeBuoy className="w-5 h-5" />
                  </div>
                  <span className="flex-1 overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out group-data-[state=collapsed]/sidebar:w-0 group-data-[state=collapsed]/sidebar:ml-0 group-data-[state=collapsed]/sidebar:opacity-0 group-data-[state=collapsed]/sidebar:invisible group-data-[state=expanded]/sidebar:w-auto group-data-[state=expanded]/sidebar:ml-1 group-data-[state=expanded]/sidebar:opacity-100 group-data-[state=expanded]/sidebar:visible">
                    Support
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/" className="flex items-center gap-3 min-w-0">
                  <div className="w-5 shrink-0 flex items-center justify-center transition-all duration-200 ease-in-out group-data-[state=collapsed]/sidebar:scale-100 group-data-[state=expanded]/sidebar:scale-110">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="flex-1 overflow-hidden whitespace-nowrap transition-all duration-200 ease-in-out group-data-[state=collapsed]/sidebar:w-0 group-data-[state=collapsed]/sidebar:ml-0 group-data-[state=collapsed]/sidebar:opacity-0 group-data-[state=collapsed]/sidebar:invisible group-data-[state=expanded]/sidebar:w-auto group-data-[state=expanded]/sidebar:ml-1 group-data-[state=expanded]/sidebar:opacity-100 group-data-[state=expanded]/sidebar:visible">
                    Log Out
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/0 bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <SidebarTrigger className="sm:hidden" />
          <div className="hidden md:block text-lg font-semibold">
            {displayRole()} Portal
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 sm:gap-4">
            <UniversalSearch role={role} />
            {(role === ROLES.INNOVATOR || role === ROLES.COORDINATOR) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="text-white bg-gradient-to-r from-purple-500 to-indigo-500"
                      asChild
                    >
                      <Link href={getCreditRequestLink()}>
                        <CreditCard className="size-5" />
                        {credits !== null && (
                          <span className="ml-2 hidden sm:inline">
                            {user?.creditQuota} Credits
                          </span>
                        )}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {role === ROLES.INNOVATOR
                        ? "Request More Credits"
                        : "View Available Credits"}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="relative"
                    >
                      <Link href={`/dashboard/consultations?role=${role}`}>
                        <CalendarDays className="h-5 w-5" />
                        {upcomingConsultations > 0 && (
                          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                        )}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Consultations</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Notifications role={role} />
            <ThemeToggle />
            <UserNav />
          </div>
        </header>
        <div className="h-[2px] ml-4 w-[calc(100%-2rem)] bg-gradient-to-r from-primary via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-background-pan" />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <Breadcrumbs />
          <div className="mt-4">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// This is the correct layout component for the dashboard route
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReactQueryProvider>
        <ProtectedRoute>
          <HydrationSafeContent>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
          </HydrationSafeContent>
        </ProtectedRoute>
      </ReactQueryProvider>
    </Suspense>
  );
}
