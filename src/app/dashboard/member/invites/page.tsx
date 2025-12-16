"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Loader2,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MentorRequest {
  _id: string;
  requestId: string;
  draftId: string;
  draftTitle: string;
  innovatorId: string;
  innovatorName: string;
  innovatorEmail: string;
  innovatorPhone?: string;
  innovatorCollege?: string;
  mentorId: string;
  mentorName: string;
  mentorEmail: string;
  status: "pending" | "accepted" | "rejected";
  domain?: string;
  questions?: string;
  rejectionReason?: string;
  respondedAt?: string;
  createdAt: string;
  daysAgo?: number;
  isPending?: boolean;
  isAccepted?: boolean;
  isRejected?: boolean;
}

interface MentorStats {
  overview: {
    totalRequests: number;
    pendingRequests: number;
    acceptedRequests: number;
    rejectedRequests: number;
    processedRequests: number;
    activeMentorships: number;
  };
  performance: {
    acceptanceRate: number;
    averageResponseTime: {
      hours: number;
      display: string;
    };
  };
  recentActivity: {
    last30Days: {
      requests: number;
      accepted: number;
    };
  };
}

interface TeamInvitation {
  _id: string;
  ideaId: string;
  ideaTitle: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
  inviteeEmail: string;
  inviteeName: string;
  status: "pending" | "accepted" | "rejected";
  type: "existing_user" | "new_account";
  createdAt: string;
  respondedAt?: string;
}

type RequestType = MentorRequest | TeamInvitation;

export default function RequestsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = localStorage.getItem("token");

  // ✅ Get role from URL params
  const roleParam = searchParams.get("role");

  // ✅ State for filters and pagination
  const [historyPage, setHistoryPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  // ✅ Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setHistoryPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ✅ Determine which API to call based on role
  const isMentor = roleParam === "mentor" || roleParam === "internal_mentor";
  const isTeamMember = roleParam === "team_member";

  // ✅ Fetch pending requests
  const { data: pendingResp, isLoading: loadingPending } = useQuery({
    queryKey: ["requests", "pending", roleParam],
    queryFn: async () => {
      if (isMentor) {
        const { data } = await axios.get(
          `${apiUrl}/api/mentors/my-requests?status=pending`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
      } else if (isTeamMember) {
        const { data } = await axios.get(
          `${apiUrl}/api/teams/my-invitations?status=pending`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
      }
      return { data: [] };
    },
    enabled: !!roleParam,
  });

  // ✅ Fetch history with filters and pagination (NEW - uses history API)
  const { data: historyResp, isLoading: loadingHistory } = useQuery({
    queryKey: [
      "requests",
      "history",
      roleParam,
      historyPage,
      statusFilter,
      debouncedSearch,
    ],
    queryFn: async () => {
      if (isMentor) {
        const params = new URLSearchParams({
          page: historyPage.toString(),
          limit: "10",
          status: statusFilter,
        });
        if (debouncedSearch) {
          params.append("search", debouncedSearch);
        }

        const { data } = await axios.get(
          `${apiUrl}/api/mentors/my-requests-history?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
      } else if (isTeamMember) {
        // Keep existing team invitations logic
        const { data } = await axios.get(`${apiUrl}/api/teams/my-invitations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter on client side for team members (no history API yet)
        const filtered = data.data.filter((r: RequestType) => {
          if (statusFilter !== "all" && r.status !== statusFilter) return false;
          return true;
        });
        return {
          data: filtered,
          pagination: {
            page: 1,
            limit: filtered.length,
            total: filtered.length,
            pages: 1,
          },
        };
      }
      return { data: [], pagination: {} };
    },
    enabled: !!roleParam,
  });

  // ✅ Fetch mentor stats (NEW)
  const { data: statsResp } = useQuery({
    queryKey: ["mentor-stats", roleParam],
    queryFn: async () => {
      if (isMentor) {
        const { data } = await axios.get(`${apiUrl}/api/mentors/my-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      }
      return null;
    },
    enabled: isMentor,
  });

  // ✅ Accept request mutation
  const acceptMutation = useMutation({
    mutationFn: async (requestId: string) => {
      if (isMentor) {
        const { data } = await axios.post(
          `${apiUrl}/api/mentors/request/${requestId}/accept`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
      } else if (isTeamMember) {
        const { data } = await axios.post(
          `${apiUrl}/api/teams/invitation/${requestId}/accept`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-stats"] });
      toast({
        title: "Request Accepted ✓",
        description: isMentor
          ? "You have accepted the mentorship request."
          : "You have accepted the team invitation.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Accept Failed",
        description: error.response?.data?.error || "Failed to accept request.",
      });
    },
  });

  // ✅ Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: async ({
      requestId,
      reason,
    }: {
      requestId: string;
      reason?: string;
    }) => {
      if (isMentor) {
        const { data } = await axios.post(
          `${apiUrl}/api/mentors/request/${requestId}/reject`,
          { reason: reason || "Unable to mentor at this time" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
      } else if (isTeamMember) {
        const { data } = await axios.post(
          `${apiUrl}/api/teams/invitation/${requestId}/reject`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-stats"] });
      toast({
        title: "Request Declined",
        description: isMentor
          ? "You have declined the mentorship request."
          : "You have declined the team invitation.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Decline Failed",
        description:
          error.response?.data?.error || "Failed to decline request.",
      });
    },
  });

  const handleAccept = (requestId: string) => {
    acceptMutation.mutate(requestId);
  };

  const handleReject = (requestId: string) => {
    rejectMutation.mutate({ requestId });
  };

  const pendingRequests = pendingResp?.data || [];
  const historyRequests = historyResp?.data || [];
  const pagination = historyResp?.pagination || {};
  const stats: MentorStats | null = statsResp?.data || null;

  const getTitle = () => {
    if (isMentor) return "Mentorship Requests";
    if (isTeamMember) return "Team Invitations";
    return "Requests";
  };

  const getDescription = () => {
    if (isMentor)
      return "Manage mentorship requests from innovators who want your guidance.";
    if (isTeamMember)
      return "Manage team collaboration invitations from innovators.";
    return "Manage your pending requests.";
  };

  // ✅ Stats Dashboard Component (NEW)
  const StatsOverview = () => {
    if (!isMentor || !stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                <p className="text-2xl font-bold">
                  {stats.performance.acceptanceRate}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Avg Response Time
                </p>
                <p className="text-2xl font-bold">
                  {stats.performance.averageResponseTime.display}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Mentorships
                </p>
                <p className="text-2xl font-bold">
                  {stats.overview.activeMentorships}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">
                  {stats.overview.totalRequests}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ✅ Pending Requests List
  const PendingRequestList = () => {
    if (loadingPending) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading requests...</span>
        </div>
      );
    }

    if (pendingRequests.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No pending requests.</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {pendingRequests.map((request: RequestType) => {
          const isMentorRequest = "draftTitle" in request;
          const title = isMentorRequest
            ? (request as MentorRequest).draftTitle
            : (request as TeamInvitation).ideaTitle;
          const senderName = isMentorRequest
            ? (request as MentorRequest).innovatorName
            : (request as TeamInvitation).inviterName;
          const senderEmail = isMentorRequest
            ? (request as MentorRequest).innovatorEmail
            : (request as TeamInvitation).inviteeEmail;
          const questions = isMentorRequest
            ? (request as MentorRequest).questions
            : null;
          const domain = isMentorRequest
            ? (request as MentorRequest).domain
            : null;

          return (
            <Card key={request._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${senderName}.png`}
                        alt={senderName}
                      />
                      <AvatarFallback>
                        {senderName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-lg">{title}</p>
                        {domain && <Badge variant="secondary">{domain}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isMentorRequest ? "Requested by" : "Invited by"}{" "}
                        <strong>{senderName}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {senderEmail} •{" "}
                        {new Date(
                          isMentorRequest
                            ? (request as MentorRequest).createdAt
                            : (request as TeamInvitation).createdAt
                        ).toLocaleDateString()}
                      </p>

                      {questions && (
                        <div className="mt-2 p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium mb-1">
                            Questions from Innovator:
                          </p>
                          <p className="text-sm italic">"{questions}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleAccept(request._id)}
                        disabled={acceptMutation.isPending}
                      >
                        {acceptMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(request._id)}
                        disabled={rejectMutation.isPending}
                      >
                        {rejectMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // ✅ History List with Filters (NEW)
  const HistoryRequestList = () => {
    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by innovator or idea title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setHistoryPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loadingHistory && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading history...</span>
          </div>
        )}

        {/* Empty State */}
        {!loadingHistory && historyRequests.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No history found.{" "}
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters."
                : ""}
            </AlertDescription>
          </Alert>
        )}

        {/* History Items */}
        {!loadingHistory && historyRequests.length > 0 && (
          <>
            <div className="space-y-3">
              {historyRequests.map((request: MentorRequest) => (
                <Card key={request._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${request.innovatorName}.png`}
                            alt={request.innovatorName}
                          />
                          <AvatarFallback>
                            {request.innovatorName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {request.draftTitle}
                            </p>
                            {request.domain && (
                              <Badge variant="outline" className="text-xs">
                                {request.domain}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <strong>{request.innovatorName}</strong>
                            {request.innovatorCollege &&
                              ` • ${request.innovatorCollege}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.respondedAt).toLocaleDateString(
                              "en-GB"
                            )}
                          </p>

                          {/* Rejection reason */}
                          {request.status === "rejected" &&
                            request.rejectionReason && (
                              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/10 rounded border border-red-200 dark:border-red-800">
                                <p className="text-xs font-medium text-red-800 dark:text-red-400">
                                  Rejection reason: {request.rejectionReason}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>

                      <Badge
                        variant={
                          request.status === "accepted"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {request.status === "accepted"
                          ? "✓ Accepted"
                          : "✗ Declined"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.pages} (
                  {pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrev || loadingHistory}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryPage((p) => p + 1)}
                    disabled={!pagination.hasNext || loadingHistory}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (!roleParam) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Missing role parameter. Please specify role (team_member, mentor, or
            internal_mentor) in URL.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats Overview (Mentors Only) */}
          <StatsOverview />

          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pending
                {pendingRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history">
                History
                {pagination.total > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {pagination.total}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              <PendingRequestList />
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <HistoryRequestList />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
