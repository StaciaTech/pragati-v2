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
import { Check, X, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MentorRequest {
  _id: string;
  draftId: string;
  draftTitle: string;
  innovatorId: string;
  innovatorName: string;
  innovatorEmail: string;
  mentorId: string;
  mentorName: string;
  mentorEmail: string;
  status: "pending" | "accepted" | "rejected";
  message: string;
  requestedAt: string;
  respondedAt?: string;
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
  const roleParam = searchParams.get("role"); // "team_member", "mentor", or "internal_mentor"

  // ✅ Determine which API to call based on role
  const isMentor = roleParam === "mentor" || roleParam === "internal_mentor";
  const isTeamMember = roleParam === "team_member";

  // ✅ Fetch pending requests (mentor or team invitations)
  const { data: pendingResp, isLoading: loadingPending } = useQuery({
    queryKey: ["requests", "pending", roleParam],
    queryFn: async () => {
      if (isMentor) {
        // Mentor requests API
        const { data } = await axios.get(
          `${apiUrl}/api/mentors/my-requests?status=pending`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
      } else if (isTeamMember) {
        // Team invitations API
        const { data } = await axios.get(
          `${apiUrl}/api/teams/my-invitations?status=pending`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
      }
      return { data: [] };
    },
    enabled: !!roleParam, // Only fetch if role is specified
  });

  // ✅ Fetch all requests (for history)
  const { data: allRequestsResp, isLoading: loadingAll } = useQuery({
    queryKey: ["requests", "all", roleParam],
    queryFn: async () => {
      if (isMentor) {
        const { data } = await axios.get(`${apiUrl}/api/mentors/my-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      } else if (isTeamMember) {
        const { data } = await axios.get(`${apiUrl}/api/teams/my-invitations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      }
      return { data: [] };
    },
    enabled: !!roleParam,
  });

  // ✅ Accept request mutation
  const acceptMutation = useMutation({
    mutationFn: async (requestId: string) => {
      console.log("requestId", requestId);
      if (isMentor) {
        // Mentor accept
        const { data } = await axios.post(
          `${apiUrl}/api/mentors/request/${requestId}/accept`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
      } else if (isTeamMember) {
        // Team invitation accept
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
        // Mentor reject
        const { data } = await axios.post(
          `${apiUrl}/api/mentors/request/${requestId}/reject`,
          { reason: reason || "Unable to mentor at this time" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
      } else if (isTeamMember) {
        // Team invitation reject
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
    console.log("requestId", requestId);
    acceptMutation.mutate(requestId);
  };

  const handleReject = (requestId: string) => {
    rejectMutation.mutate({ requestId });
  };

  const pendingRequests = pendingResp?.data || [];
  const allRequests = allRequestsResp?.data || [];
  const pastRequests = allRequests.filter(
    (r: RequestType) => r.status !== "pending"
  );

  // ✅ Get appropriate title based on role
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

  const RequestList = ({
    list,
    isPending,
    isLoading,
  }: {
    list: RequestType[];
    isPending: boolean;
    isLoading: boolean;
  }) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading requests...</span>
        </div>
      );
    }

    if (list.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No {isPending ? "pending" : "past"} requests.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {list.map((request) => {
          // Type guard to determine if it's a mentor request or team invitation
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

          return (
            <Card key={request._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  {/* Left side - Sender info */}
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
                      <p className="font-semibold text-lg">{title}</p>
                      <p className="text-sm text-muted-foreground">
                        {isMentorRequest ? "Requested by" : "Invited by"}{" "}
                        <strong>{senderName}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {senderEmail} •{" "}
                        {new Date(
                          isMentorRequest
                            ? (request as MentorRequest).requestedAt
                            : (request as TeamInvitation).createdAt
                        ).toLocaleDateString()}
                      </p>

                      {/* Show message if exists (mentor requests only) */}
                      {isMentorRequest &&
                        (request as MentorRequest).message && (
                          <div className="mt-2 p-3 bg-muted rounded-md">
                            <p className="text-sm italic">
                              "{(request as MentorRequest).message}"
                            </p>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Right side - Actions or Status */}
                  <div className="ml-4">
                    {isPending ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => {
                            console.log(request);
                            handleAccept(request._id);
                          }}
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
                    ) : (
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
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // ✅ Show error if no role param
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
    <div className="container mx-auto py-8 max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
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
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              <RequestList
                list={pendingRequests}
                isPending={true}
                isLoading={loadingPending}
              />
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <RequestList
                list={pastRequests}
                isPending={false}
                isLoading={loadingAll}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
