"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Loader2,
  PieChart as PieChartIcon,
  Target,
  Percent,
  History,
  Share2,
  Download,
  Copy,
} from "lucide-react";
import { STATUS_COLORS } from "@/lib/data/platform";
import { ROLES, type Role } from "@/lib/constants";
import type { ValidationReport } from "@/ai/schemas";
import { useToast } from "@/hooks/use-toast";
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  FacebookIcon,
  LinkedInIcon,
  TwitterIcon,
  WhatsAppIcon,
  MailIcon,
} from "@/components/social-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_TEAM_MEMBER_USERS } from "@/lib/data/auth";
import { useUserIdeas } from "@/hooks/useUserIdeas";

type Idea = {
  id: string;
  title: string;
  description: string;
  collegeId: string;
  collegeName: string;
  domain: string;
  innovatorName: string;
  innovatorEmail: string;
  status: string;
  dateSubmitted: string;
  version: string;
  report?: ValidationReport | null;
  clusterWeights?: Record<string, number>;
  feedback?: {
    overall: string;
    details: { aspect: string; score: number; comment: string }[];
  } | null;
  consultationStatus: string;
  consultationDate: string | null;
  consultationTime: string | null;
  ttcAssigned: string | null;
  overallScore?: number;
};

const mockHistory = [
  { version: "V1.0", date: "2024-01-15", status: "Approved", score: 88 },
  { version: "V0.9", date: "2024-01-10", status: "Moderate", score: 72 },
  { version: "V0.8", date: "2024-01-05", status: "Rejected", score: 45 },
];

const ActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
  } = props as PieSectorDataItem & {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
    value: number;
    payload: any;
  };

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={-4}
        textAnchor="middle"
        fill={fill}
        className="text-2xl font-bold"
      >
        {value}
      </text>
      <text
        x={cx}
        y={cy}
        dy={16}
        textAnchor="middle"
        fill="hsl(var(--muted-foreground))"
        className="text-sm"
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

export default function IdeasPage() {
  const {
    data: ideas,
    isLoading: ideaLoading,
    error: ideaErrors,
  } = useUserIdeas();

  const [allIdeas, setAllIdeas] = React.useState<Idea[]>([]);
  const [myIdeas, setMyIdeas] = React.useState<Idea[]>([]);
  const [sharedIdeas, setSharedIdeas] = React.useState<Idea[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("my-workspace");

  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [domainFilter, setDomainFilter] = React.useState("all");

  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [selectedIdea, setSelectedIdea] = React.useState<Idea | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") as Role) || ROLES.INNOVATOR;

  const [activeIndex, setActiveIndex] = React.useState(0);
  const onPieEnter = React.useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );

  React.useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await fetch("/api/ideas");
        if (!response.ok) {
          throw new Error("Failed to fetch ideas");
        }
        const data = await response.json();
        setAllIdeas(data);

        // Logic to determine which ideas to show based on role
        let myIdeasData: Idea[] = [];
        let sharedIdeasData: Idea[] = [];

        if (role === ROLES.INNOVATOR) {
          myIdeasData = data.filter(
            (idea: Idea) => idea.innovatorName === "Jane Doe"
          );
          sharedIdeasData = data
            .filter((idea: Idea) => idea.innovatorName !== "Jane Doe")
            .slice(0, 2); // Mock sharing
        } else if (
          role === ROLES.TEAM_MEMBER ||
          role === ROLES.INTERNAL_MENTOR
        ) {
          // For team members/internal mentors, "My Workspace" is empty, "Shared" are ideas they're on
          const user = MOCK_TEAM_MEMBER_USERS[0]; // mock
          sharedIdeasData = data.filter(
            (idea: Idea) => idea.id === "IDEA-001" || idea.id === "IDEA-003"
          ); // Mock being on a team
        }

        setMyIdeas(myIdeasData);
        setSharedIdeas(sharedIdeasData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdeas();
  }, [role]);

  const ideasForCurrentTab =
    activeTab === "my-workspace" ? myIdeas : sharedIdeas;
  const filteredIdeas = React.useMemo(() => {
    let filtered = ideasForCurrentTab;
    if (searchTerm) {
      filtered = filtered.filter((idea) =>
        idea.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (idea) =>
          (idea.report?.validationOutcome || idea.status) === statusFilter
      );
    }
    if (domainFilter !== "all") {
      filtered = filtered.filter((idea) => idea.domain === domainFilter);
    }
    return filtered;
  }, [ideasForCurrentTab, searchTerm, statusFilter, domainFilter]);

  const handleShareClick = (idea: Idea) => {
    setSelectedIdea(idea);
    setShareDialogOpen(true);
  };

  const handleCopyLink = () => {
    if (!selectedIdea) return;
    const link = `${window.location.origin}/dashboard/ideas/${selectedIdea.id}?role=${ROLES.INNOVATOR}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: "A shareable link to the report has been copied.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Feature In Development",
      description: `Downloading for idea ${selectedIdea?.id} is not yet implemented.`,
    });
  };

  const handleTrackHistory = (idea: Idea) => {
    setSelectedIdea(idea);
    setHistoryDialogOpen(true);
  };

  const handleResubmit = (idea: Idea) => {
    const ideaData = {
      title: idea.title,
      description: idea.description,
      domain: idea.domain,
      weights: idea.clusterWeights,
    };
    const newSearchParams = new URLSearchParams();
    newSearchParams.set("idea", JSON.stringify(ideaData));
    if (role) {
      newSearchParams.set("role", role);
    }
    router.push(`/dashboard/submit?${newSearchParams.toString()}`);
  };

  const getOverallScore = (idea: Idea) => {
    if (idea.report) {
      return idea.report.overallScore.toFixed(1);
    }
    return "N/A";
  };

  const getStatus = (idea: Idea) => {
    return idea.report?.validationOutcome || idea.status;
  };

  const uniqueDomains = [...new Set(allIdeas.map((idea) => idea.domain))];
  const uniqueStatuses = [...new Set(allIdeas.map((idea) => getStatus(idea)))];

  const totalIdeas = ideas?.length;
  const approvedIdeas = ideas?.filter(
    (i) => getStatus(i) === "approved"
  ).length;

  const approvedCount = ideas?.filter(
    (item) => item.status.toLowerCase() === "approved"
  ).length;
  const approvalRate = totalIdeas > 0 ? (approvedCount / totalIdeas) * 100 : 0;
  const validatedIdeas = myIdeas.filter((i) => i.report?.overallScore);
  const totalScoreSum = ideas?.reduce(
    (sum, item) => sum + item.overallScore,
    0
  );

  const averageScore = totalIdeas > 0 ? totalScoreSum / totalIdeas : 0;

  const statusCounts = myIdeas.reduce((acc, idea) => {
    const status = getStatus(idea);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = [
    {
      name: "Approved",
      value: statusCounts.Approved || 0,
      fill: "hsl(var(--color-approved))",
    },
    {
      name: "Moderate",
      value: statusCounts.Moderate || 0,
      fill: "hsl(var(--color-moderate))",
    },
    {
      name: "Rejected",
      value: statusCounts.Rejected || 0,
      fill: "hsl(var(--color-rejected))",
    },
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10 text-red-500">
          <p>Error: {error}</p>
        </div>
      );
    }

    if (ideas?.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No ideas to display in this workspace.
          </p>
          {activeTab === "my-workspace" && role === ROLES.INNOVATOR && (
            <Button asChild className="mt-4">
              <Link href={`/dashboard/submit?role=${ROLES.INNOVATOR}`}>
                Submit Your First Idea
              </Link>
            </Button>
          )}
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Idea ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Score</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ideas.map((idea) => {
            const status = getStatus(idea);
            const score = idea.report ? idea.report.overallScore : null;
            const numericScore = score;
            return (
              <TableRow key={idea._id} className="group">
                <TableCell
                  className="font-medium cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/ideas/${idea._id}?role=${role}`)
                  }
                >
                  {idea._id}
                </TableCell>
                <TableCell
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/ideas/${idea._id}?role=${role}`)
                  }
                >
                  {idea.ideaName}
                </TableCell>
                <TableCell
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/ideas/${idea._id}?role=${role}`)
                  }
                >
                  {new Date(idea.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/ideas/${idea._id}?role=${role}`)
                  }
                >
                  <Badge className={STATUS_COLORS[idea.status]}>
                    {idea.status}
                  </Badge>
                </TableCell>
                <TableCell
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/ideas/${idea._id}?role=${role}`)
                  }
                >
                  {idea.overallScore ? idea.overallScore.toFixed(1) : "N/A"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShareClick(idea)}
                          >
                            <Share2 className="h-4 w-4" />
                            <span className="sr-only">Share</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Share</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTrackHistory(idea)}
                          >
                            <History className="h-4 w-4" />
                            <span className="sr-only">History</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View History</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() =>
                            router.push(
                              `/dashboard/ideas/${idea._id}?role=${role}`
                            )
                          }
                        >
                          View Full Report
                        </DropdownMenuItem>
                        {status === "Moderate" && (
                          <DropdownMenuItem
                            onSelect={() => handleResubmit(idea)}
                          >
                            Resubmit
                          </DropdownMenuItem>
                        )}
                        {status === "Approved" && (
                          <DropdownMenuItem
                            onSelect={() =>
                              router.push(
                                `/dashboard/consultations?role=${role}&ideaId=${idea._id}`
                              )
                            }
                          >
                            Schedule Consultation
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const shareUrl = selectedIdea
    ? encodeURIComponent(
        `${window.location.origin}/dashboard/ideas/${selectedIdea._id}?role=${ROLES.INNOVATOR}`
      )
    : "";
  const shareText = selectedIdea
    ? encodeURIComponent(
        `Check out my idea report for "${selectedIdea.title}" on PragatiAI!`
      )
    : "";

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Ideas Dashboard</h1>

        {role === ROLES.INNOVATOR && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Ideas
                </CardTitle>
                <PieChartIcon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ideas?.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Approval Rate
                </CardTitle>
                <Percent className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {approvalRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
                <Target className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {averageScore.toFixed(1)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>All Submitted Ideas</CardTitle>
              <CardDescription>
                Search, filter, and manage all your ideas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="my-workspace"
                className="w-full"
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="my-workspace">My Workspace</TabsTrigger>
                  <TabsTrigger value="shared-with-me">
                    Shared with Me
                  </TabsTrigger>
                </TabsList>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                  <Input
                    placeholder="Search by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {uniqueStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={domainFilter} onValueChange={setDomainFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by domain..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Domains</SelectItem>
                      {uniqueDomains.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <TabsContent value="my-workspace">
                  {renderContent()}
                </TabsContent>
                <TabsContent value="shared-with-me">
                  {renderContent()}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Idea Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={ActiveShape}
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>History for: {selectedIdea?.title}</DialogTitle>
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
                  <TableCell>{item.score.toFixed(1)}</TableCell>
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

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Report: {selectedIdea?.title}</DialogTitle>
            <DialogDescription>
              Share your idea report with others via link or PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Input
                id="link"
                value={`${window.location.origin}/dashboard/ideas/${selectedIdea?._id}?role=${ROLES.INNOVATOR}`}
                readOnly
              />
              <Button
                type="button"
                size="sm"
                className="px-3"
                onClick={handleCopyLink}
              >
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Anyone with this link will be able to view the report.
            </p>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium text-center text-muted-foreground">
                Quick Share
              </p>
              <div className="flex justify-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="icon">
                        <a
                          href={`https://api.whatsapp.com/send?text=${shareText} ${shareUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <WhatsAppIcon className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>WhatsApp</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="icon">
                        <a
                          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <TwitterIcon className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>X / Twitter</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="icon">
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FacebookIcon className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Facebook</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="icon">
                        <a
                          href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${encodeURIComponent(
                            selectedIdea?.title || ""
                          )}&summary=${shareText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <LinkedInIcon className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>LinkedIn</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="icon">
                        <a
                          href={`mailto:?subject=${encodeURIComponent(
                            selectedIdea?.title || ""
                          )}&body=${shareText} ${shareUrl}`}
                        >
                          <MailIcon className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Email</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
            <Button type="button" variant="secondary" onClick={handleDownload}>
              <Download className="mr-2" />
              Export as PDF
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
