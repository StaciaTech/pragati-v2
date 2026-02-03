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
  ArrowUpDown,
} from "lucide-react";
import { STATUS_COLORS } from "@/lib/data/platform";
import { useUserIdeas } from "@/hooks/useUserIdeas";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ROLES, type Role } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChartContainer } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
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
import { useIdeaConsultation } from "@/hooks/useConsultations";

const ConsultationStatusCell = ({ ideaId }: { ideaId: string }) => {
  const { data: consultation, isLoading } = useIdeaConsultation(ideaId);

  if (isLoading) {
    return <span className="text-muted-foreground text-xs">Loading...</span>;
  }

  if (!consultation || !consultation.status) {
    return (
      <Badge
        variant="secondary"
        className="text-muted-foreground font-normal bg-gray-100 hover:bg-gray-200"
      >
        Not Assigned
      </Badge>
    );
  }

  return (
    <div className="flex flex-col text-sm">
      {consultation.status === "Scheduled" && consultation.scheduledAt ? (
        <>
          <span className="font-semibold text-green-600">
            {new Date(consultation.scheduledAt).toLocaleDateString()}
          </span>
          <span className="text-xs text-muted-foreground">
            with {consultation.mentor?.name || "Mentor"}
            {consultation.mentor?.organization &&
              ` (${consultation.mentor.organization})`}
          </span>
        </>
      ) : (
        <Badge variant="outline" className="w-fit">
          {consultation.status}
        </Badge>
      )}
    </div>
  );
};

type SortOrder = "asc" | "desc";

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
  } = props;

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
  const { data: ideas = [], isLoading, error: ideaError } = useUserIdeas();
  console.log("Ideas from API:", ideas);

  const { data: profileData } = useUserProfile();
  const profile = profileData;
  console.log("Profile data:", profileData);

  const [activeTab, setActiveTab] = React.useState("my-workspace");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [domainFilter, setDomainFilter] = React.useState("all");
  const [sortField, setSortField] = React.useState<SortField>("date");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");

  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [selectedIdea, setSelectedIdea] = React.useState<any | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") as Role) || ROLES.INNOVATOR;

  const [activeIndex, setActiveIndex] = React.useState(0);
  const onPieEnter = React.useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex],
  );

  // ============ WORKSPACE LOGIC - SIMPLIFIED ✅ ============
  const myIdeas = React.useMemo(() => {
    // ✅ Use isOwner flag from backend
    return ideas.filter((idea: any) => idea.isOwner === true);
  }, [ideas]);

  const sharedIdeas = React.useMemo(() => {
    // ✅ Use isOwner flag from backend
    return ideas.filter((idea: any) => idea.isOwner === false);
  }, [ideas]);

  console.log("My Ideas count:", myIdeas.length);
  console.log("Shared Ideas count:", sharedIdeas.length);

  // ============ CURRENT TAB IDEAS ============
  const ideasForCurrentTab =
    activeTab === "my-workspace" ? myIdeas : sharedIdeas;

  // ============ UNIQUE VALUES FOR FILTERS ============
  const uniqueDomains = React.useMemo(() => {
    return [
      ...new Set(ideasForCurrentTab.map((idea: any) => idea.domain)),
    ].filter(Boolean);
  }, [ideasForCurrentTab]);

  const uniqueStatuses = React.useMemo(() => {
    return [
      ...new Set(ideasForCurrentTab.map((idea: any) => idea.status)),
    ].filter(Boolean);
  }, [ideasForCurrentTab]);

  // ============ FILTERING ============
  const filteredIdeas = React.useMemo(() => {
    let filtered = [...ideasForCurrentTab];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (idea: any) =>
          idea.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.concept?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((idea: any) => idea.status === statusFilter);
    }

    // Domain filter
    if (domainFilter !== "all") {
      filtered = filtered.filter((idea: any) => idea.domain === domainFilter);
    }

    return filtered;
  }, [ideasForCurrentTab, searchTerm, statusFilter, domainFilter]);

  // ============ SORTING ============
  const sortedIdeas = React.useMemo(() => {
    const sorted = [...filteredIdeas];

    sorted.sort((a: any, b: any) => {
      let compareA: any;
      let compareB: any;

      switch (sortField) {
        case "date":
          compareA = new Date(a.createdAt).getTime();
          compareB = new Date(b.createdAt).getTime();
          break;
        case "title":
          compareA = a.title?.toLowerCase() || "";
          compareB = b.title?.toLowerCase() || "";
          break;
        case "score":
          compareA = a.overallScore || 0;
          compareB = b.overallScore || 0;
          break;
        case "status":
          compareA = a.status?.toLowerCase() || "";
          compareB = b.status?.toLowerCase() || "";
          break;
        default:
          return 0;
      }

      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredIdeas, sortField, sortOrder]);

  // ============ STATISTICS (Only for My Ideas) ============
  const totalIdeas = myIdeas.length;
  const approvedCount = myIdeas.filter(
    (i: any) => i.status === "approved",
  ).length;
  const approvalRate = totalIdeas > 0 ? (approvedCount / totalIdeas) * 100 : 0;

  const totalScoreSum = myIdeas.reduce(
    (sum: number, item: any) => sum + (item.overallScore || 0),
    0,
  );
  const averageScore = totalIdeas > 0 ? totalScoreSum / totalIdeas : 0;

  // ============ PIE CHART DATA (Only for My Ideas) ============
  const statusCounts = myIdeas.reduce((acc: any, idea: any) => {
    const status = idea.status || "pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusData = [
    {
      name: "Approved",
      value: statusCounts.approved || 0,
      fill: "hsl(var(--color-approved))",
    },
    {
      name: "Improvise",
      value: statusCounts.improvise || 0,
      fill: "hsl(var(--color-moderate))",
    },
    {
      name: "Rejected",
      value: statusCounts.rejected || 0,
      fill: "hsl(var(--color-rejected))",
    },
    {
      name: "Pending",
      value: statusCounts.pending || 0,
      fill: "hsl(var(--muted))",
    },
  ];

  // ============ HANDLERS ============
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleShareClick = (idea: any) => {
    setSelectedIdea(idea);
    setShareDialogOpen(true);
  };

  const handleCopyLink = () => {
    if (!selectedIdea) return;
    const link = `${window.location.origin}/dashboard/ideas/${selectedIdea._id}?role=${role}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: "A shareable link to the idea has been copied.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Feature In Development",
      description: "PDF download is not yet implemented.",
    });
  };

  const handleTrackHistory = (idea: any) => {
    setSelectedIdea(idea);
    setHistoryDialogOpen(true);
  };

  const handleResubmit = (idea: any) => {
    router.push(`/dashboard/submit?ideaId=${idea._id}&role=${role}`);
  };

  // ============ RENDER TABLE ============
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (ideaError) {
      return (
        <div className="text-center py-10 text-red-500">
          <p>Error loading ideas</p>
        </div>
      );
    }

    if (sortedIdeas.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all" || domainFilter !== "all"
              ? "No ideas match your filters."
              : activeTab === "my-workspace"
                ? "No ideas created yet."
                : "No ideas shared with you yet."}
          </p>
          {activeTab === "my-workspace" &&
            role === ROLES.INNOVATOR &&
            !searchTerm && (
              <Button asChild className="mt-4">
                <Link href={`/dashboard/submit?role=${role}`}>
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
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("title")}
                className="hover:bg-transparent p-0 h-auto font-medium"
              >
                Title
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("date")}
                className="hover:bg-transparent p-0 h-auto font-medium"
              >
                Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("status")}
                className="hover:bg-transparent p-0 h-auto font-medium"
              >
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Consultation</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("score")}
                className="hover:bg-transparent p-0 h-auto font-medium"
              >
                Score
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedIdeas.map((idea: any) => (
            <TableRow key={idea._id} className="group">
              <TableCell
                className="font-medium cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/ideas/${idea._id}?role=${role}`)
                }
              >
                {idea._id.substring(0, 8)}...
              </TableCell>
              <TableCell
                className="cursor-pointer font-medium"
                onClick={() =>
                  router.push(`/dashboard/ideas/${idea._id}?role=${role}`)
                }
              >
                {idea.title || idea.ideaName}
              </TableCell>
              <TableCell
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/ideas/${idea._id}?role=${role}`)
                }
              >
                {new Date(idea.createdAt).toLocaleDateString("en-GB")}
              </TableCell>
              <TableCell
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/ideas/${idea._id}?role=${role}`)
                }
              >
                <Badge className={STATUS_COLORS[idea.status] || ""}>
                  {idea.status}
                </Badge>
              </TableCell>
              <TableCell>
                <ConsultationStatusCell ideaId={idea._id} />
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
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Share</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTrackHistory(idea)}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View History</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() =>
                          router.push(
                            `/dashboard/ideas/${idea._id}?role=${role}`,
                          )
                        }
                      >
                        View Full Report
                      </DropdownMenuItem>
                      {idea.status === "improvise" && idea.isOwner && (
                        <DropdownMenuItem onSelect={() => handleResubmit(idea)}>
                          Resubmit
                        </DropdownMenuItem>
                      )}
                      {idea.status === "approved" && (
                        <DropdownMenuItem
                          onSelect={() =>
                            router.push(
                              `/dashboard/consultations?role=${role}&ideaId=${idea._id}`,
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
          ))}
        </TableBody>
      </Table>
    );
  };

  const shareUrl = selectedIdea
    ? encodeURIComponent(
        `${window.location.origin}/dashboard/ideas/${selectedIdea._id}?role=${role}`,
      )
    : "";
  const shareText = selectedIdea
    ? encodeURIComponent(
        `Check out my idea: "${selectedIdea.title}" on PragatiAI!`,
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
                <div className="text-2xl font-bold">{totalIdeas}</div>
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
                  <TabsTrigger value="my-workspace">
                    My Workspace ({myIdeas.length})
                  </TabsTrigger>
                  <TabsTrigger value="shared-with-me">
                    Shared with Me ({sharedIdeas.length})
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

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>History for: {selectedIdea?.title}</DialogTitle>
            <DialogDescription>
              Version history coming soon...
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share: {selectedIdea?.title}</DialogTitle>
            <DialogDescription>
              Share your idea with others via link or social media.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Input
                id="link"
                value={`${window.location.origin}/dashboard/ideas/${selectedIdea?._id}?role=${role}`}
                readOnly
              />
              <Button
                type="button"
                size="sm"
                className="px-3"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
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
                          href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}`}
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
                            selectedIdea?.title || "",
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
