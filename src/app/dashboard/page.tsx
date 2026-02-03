"use client";

import * as React from "react";
import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  Award,
  Clock,
  MoreVertical,
  Loader2,
  PlusCircle,
  Lightbulb,
  CreditCard,
  BarChart3,
  Star,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES, type Role } from "@/lib/constants";
import { MOCK_INNOVATOR_USER } from "@/lib/data/auth";
import { MOCK_IDEAS } from "@/lib/data/ideas";
import { STATUS_COLORS } from "@/lib/data/platform";
import type { ValidationReport } from "@/ai/schemas";
import { useToast } from "@/hooks/use-toast";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Sector,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserIdeas } from "@/hooks/useUserIdeas";

type Idea = (typeof MOCK_IDEAS)[0];

const chartConfig = {
  ideas: {
    label: "Ideas",
    color: "hsl(var(--chart-1))",
  },
  approved: {
    label: "Approved",
    color: "hsl(var(--color-approved))",
  },
  moderate: {
    label: "Moderate",
    color: "hsl(var(--color-moderate))",
  },
  rejected: {
    label: "Rejected",
    color: "hsl(var(--color-rejected))",
  },
};

const mockHistory = [
  { version: "V1.0", date: "2024-01-15", status: "Approved", score: 88 },
  { version: "V0.9", date: "2024-01-10", status: "Moderate", score: 72 },
  { version: "V0.8", date: "2024-01-05", status: "Rejected", score: 45 },
];

const quotes = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
  },
  {
    text: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller",
  },
];

function getDashboardPath(role: Role) {
  switch (role) {
    case ROLES.INNOVATOR:
      return "/dashboard";
    case ROLES.INDIVIDUAL_INNOVATOR:
      return "/dashboard";
    case ROLES.COORDINATOR:
      return "/dashboard/coordinator";
    case ROLES.PRINCIPAL:
      return "/dashboard/principal";
    case ROLES.SUPER_ADMIN:
      return "/dashboard/admin";
    case ROLES.MENTOR:
      return "/dashboard/mentor";
    case ROLES.TEAM_MEMBER:
      return "/dashboard/member";
    case ROLES.INTERNAL_MENTOR:
      return "/dashboard/member";
    default:
      return "/dashboard";
  }
}

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const role = (searchParams.get("role") as Role) || ROLES.INNOVATOR;
  const { data: ideas, isLoading, error } = useUserIdeas();
  const { data: user } = useUserProfile();
  console.log(user);
  console.log("printed");

  console.log(ideas);

  // const [ideas, setIdeas] = useState<Idea[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState("Welcome back");
  const [quote, setQuote] = useState(quotes[0]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedIdeaForHistory, setSelectedIdeaForHistory] =
    useState<Idea | null>(null);
  const [selectedAction, setSelectedAction] = useState<{
    action?: () => void;
    title?: string;
    description?: string;
  }>({});

  useEffect(() => {
    // Simulate fetching data for the logged-in innovator
    // const userIdeas = MOCK_IDEAS.filter(
    //   (idea) => idea.innovatorEmail === MOCK_INNOVATOR_USER.email
    // );
    // setIdeas(userIdeas);
    // setIsLoading(false);

    // Set time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Set a random quote
    setQuote(quotes[Math.floor(Math.random() * quotes?.length)]);
  }, []);

  const totalIdeas = ideas?.length;
  const validatedIdeas = ideas?.filter((idea) => idea.report?.overallScore);
  const averageScore =
    ideas?.length > 0
      ? ideas.reduce((acc, item) => acc + item.overallScore, 0) / ideas?.length
      : 0;
  const approvedCount = ideas?.filter(
    (item) => item.status?.toLowerCase() === "approved"
  )?.length;

  const approvalRate = totalIdeas > 0 ? (approvedCount / totalIdeas) * 100 : 0;

  // const submissionTrendData = React.useMemo(() => {
  //   const trends: { [key: string]: number } = {};
  //   const sortedIdeas = [...ideas].sort(
  //     (a, b) =>
  //       new Date(a.dateSubmitted).getTime() -
  //       new Date(b.dateSubmitted).getTime()
  //   );

  //   sortedIdeas.forEach((idea) => {
  //     const month = new Date(idea.dateSubmitted).toLocaleString("default", {
  //       month: "short",
  //       year: "2-digit",
  //     });
  //     trends[month] = (trends[month] || 0) + 1;
  //   });
  //   return Object.entries(trends).map(([name, ideas]) => ({ name, ideas }));
  // }, [ideas]);

  const submissionTrendData = React.useMemo(() => {
    if (!Array.isArray(ideas)) return []; // prevent runtime crash

    const trends: { [key: string]: number } = {};
    const sortedIdeas = [...ideas].sort(
      (a, b) =>
        new Date(a.dateSubmitted).getTime() -
        new Date(b.dateSubmitted).getTime()
    );

    sortedIdeas.forEach((idea) => {
      const month = new Date(idea.dateSubmitted).toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      trends[month] = (trends[month] || 0) + 1;
    });

    return Object.entries(trends).map(([name, ideas]) => ({ name, ideas }));
  }, [ideas]);

  const handleActionConfirm = useCallback(() => {
    if (selectedAction.action) {
      selectedAction.action();
    }
    setDialogOpen(false);
  }, [selectedAction]);

  const openConfirmationDialog = useCallback(
    (action: () => void, title: string, description: string) => {
      setSelectedAction({ action, title, description });
      setDialogOpen(true);
    },
    []
  );

  const handleDownload = useCallback(
    (ideaId: string) => {
      openConfirmationDialog(
        () =>
          toast({
            title: "Feature In Development",
            description: `Downloading for idea ${ideaId} is not yet implemented.`,
          }),
        "Confirm Download",
        "Are you sure you want to download the report for this idea?"
      );
    },
    [openConfirmationDialog, toast]
  );

  const handleTrackHistory = useCallback((idea: Idea) => {
    setSelectedIdeaForHistory(idea);
    setHistoryDialogOpen(true);
  }, []);

  const handleResubmit = useCallback(
    (idea: Idea) => {
      const ideaData = {
        title: idea.title,
        description: idea.description,
        domain: idea.domain,
        weights: idea.clusterWeights,
      };
      const query = new URLSearchParams({
        idea: JSON.stringify(ideaData),
      }).toString();
      router.push(`/dashboard/submit?${query}`);
    },
    [router]
  );

  if (role !== ROLES.INNOVATOR && role !== ROLES.INDIVIDUAL_INNOVATOR) {
    const roleDashboardPath = getDashboardPath(role);
    useEffect(() => {
      if (roleDashboardPath !== "/dashboard") {
        router.push(`${roleDashboardPath}?role=${role}`);
      }
    }, [router, roleDashboardPath, role]);

    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // const user = MOCK_INNOVATOR_USER;

  const getOverallScore = (idea: Idea) => {
    if (idea.report) {
      return idea?.report?.overallScore?.toFixed(1);
    }
    return "N/A";
  };

  const getStatus = (idea: Idea) => {
    return idea.report?.validationOutcome || idea.status;
  };

  const getScoreColor = (score: number | string) => {
    const numericScore = Number(score);
    if (isNaN(numericScore)) return "text-muted-foreground";
    if (numericScore >= 85) return "text-green-600";
    if (numericScore >= 50) return "text-orange-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <Card className="w-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg border-0 relative overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 h-full w-full animate-wavy-bounce-1 rounded-full bg-gradient-to-br from-[#FF00CC] to-[#333399] opacity-30 blur-3xl filter" />
          <div className="absolute -bottom-1/4 -right-1/4 h-full w-full animate-wavy-bounce-2 rounded-full bg-gradient-to-tl from-[#F472B6] to-[#06B6D4] opacity-20 blur-3xl filter" />
          <div className="relative z-10">
            <CardHeader>
              <CardTitle className="text-3xl text-white">
                {greeting}, {user?.name}!
              </CardTitle>
              <CardDescription className="text-primary-foreground/80 italic">
                "{quote.text}" - {quote.author}
              </CardDescription>
            </CardHeader>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card
            className="border-purple-500 border-indigo-500 bg-[length:200%_auto] animate-background-pan cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() =>
              router.push(`/dashboard/analytics?role=${ROLES.INNOVATOR}`)
            }
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Submissions
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIdeas}</div>
              <p className="text-xs text-muted-foreground">
                ideas submitted all time
              </p>
            </CardContent>
          </Card>
          <Card
            className="border-purple-500 border-indigo-500 bg-[length:200%_auto] animate-background-pan cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() =>
              router.push(`/dashboard/analytics?role=${ROLES.INNOVATOR}`)
            }
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Average Score
              </CardTitle>
              <Star className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageScore?.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                across all validated ideas
              </p>
            </CardContent>
          </Card>
          <Card
            className="border-purple-500 border-indigo-500 bg-[length:200%_auto] animate-background-pan cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() =>
              router.push(`/dashboard/analytics?role=${ROLES.INNOVATOR}`)
            }
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Approval Rate
              </CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {approvalRate?.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                of ideas have been approved
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild className="w-full">
              <Link href={`/dashboard/submit?role=${ROLES.INNOVATOR}`}>
                <PlusCircle /> Submit New Idea
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/dashboard/ideas?role=${ROLES.INNOVATOR}`}>
                <Lightbulb /> View All Ideas
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/dashboard/request-credits?role=${ROLES.INNOVATOR}`}>
                <CreditCard /> Request Credits
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/dashboard/consultations?role=${ROLES.INNOVATOR}`}>
                <MessageSquare /> Schedule Consultation
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card
            className="lg:col-span-3 border-purple-500 border-indigo-500 bg-[length:200%_auto] animate-background-pan cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() =>
              router.push(`/dashboard/analytics?role=${ROLES.INNOVATOR}`)
            }
          >
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>
                A summary of your submission trends and outcomes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={submissionTrendData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      cursor={true}
                      content={
                        <ChartTooltipContent
                          contentStyle={{
                            background: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                          }}
                          labelClassName="font-bold"
                        />
                      }
                    />
                    <Bar
                      dataKey="ideas"
                      fill="hsl(var(--chart-1))"
                      radius={4}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-purple-500 border-indigo-500 bg-[length:200%_auto] animate-background-pan">
              <CardHeader>
                <CardTitle>My Recent Ideas</CardTitle>
                <CardDescription>
                  A quick look at your most recent ideas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ideas?.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">
                      You haven't submitted any ideas yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ideas?.slice(0, 3).map((idea) => {
                      const status = getStatus(idea);
                      const score = getOverallScore(idea);
                      const numericScore = idea.report?.overallScore ?? null;
                      return (
                        <Card
                          key={idea._id}
                          className="group transition-all hover:shadow-md cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/dashboard/ideas/${idea._id}?role=${ROLES.INNOVATOR}`
                            )
                          }
                        >
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex-1 space-y-1 overflow-hidden">
                              <p className="font-semibold text-sm truncate">
                                {idea.ideaName}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>
                                  {" "}
                                  {new Date(
                                    idea.createdAt
                                  ).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Award className="w-3 h-3" />
                                  <span
                                    className={cn(
                                      "font-medium",
                                      getScoreColor(getOverallScore(idea))
                                    )}
                                  >
                                    {idea.overallScore?.toFixed(2) || "00"}
                                  </span>
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={cn(
                                  STATUS_COLORS[idea.status],
                                  "hidden sm:inline-flex"
                                )}
                              >
                                {idea.status}
                              </Badge>
                              <div
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                      <span className="sr-only">
                                        More actions
                                      </span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onSelect={() =>
                                        router.push(
                                          `/dashboard/ideas/${idea._id}?role=${ROLES.INNOVATOR}`
                                        )
                                      }
                                    >
                                      View Report
                                    </DropdownMenuItem>
                                    {numericScore !== null &&
                                      numericScore < 85 && (
                                        <DropdownMenuItem
                                          onSelect={() => handleResubmit(idea)}
                                        >
                                          Resubmit
                                        </DropdownMenuItem>
                                      )}
                                    {numericScore !== null &&
                                      numericScore >= 85 && (
                                        <DropdownMenuItem
                                          onSelect={() =>
                                            router.push(
                                              `/dashboard/consultations?role=${ROLES.INNOVATOR}&ideaId=${idea._id}`
                                            )
                                          }
                                        >
                                          Schedule Consultation
                                        </DropdownMenuItem>
                                      )}
                                    <DropdownMenuItem
                                      onSelect={() => handleDownload(idea._id)}
                                    >
                                      Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onSelect={() => handleTrackHistory(idea)}
                                    >
                                      Track History
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedAction.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAction.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleActionConfirm}>
              Yes, continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              History for: {selectedIdeaForHistory?.title}
            </DialogTitle>
            <DialogDescription>
              Showing the version history and outcomes for this idea.
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHistory.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.version}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[item.status]}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item?.score?.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <DashboardPageContent />
    </Suspense>
  );
}
