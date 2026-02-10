"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Idea {
  _id: string;
  title: string;
  concept: string;
  domain?: string;
  ownerId?: string;
  mentorId?: string;
  mentorStatus?: string;
  mentorRequestStatus?: string;
  createdAt: string;
  updatedAt: string;
  sharedWith?: string[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500",
  accepted: "bg-green-500",
  rejected: "bg-red-500",
  draft: "bg-gray-500",
};

export default function AssignedIdeasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = localStorage.getItem("token");

  // ✅ Get role from URL params
  const roleParam = searchParams.get("role"); // "team_member", "mentor", or "internal_mentor"

  // ✅ Determine which API to call based on role
  const isMentor = roleParam === "mentor" || roleParam === "internal_mentor";
  const isTeamMember = roleParam === "team_member";

  // ✅ Fetch assigned ideas based on role
  const {
    data: ideasResp,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["assigned-ideas", roleParam],
    queryFn: async () => {
      if (isMentor) {
        // Mentor's assigned ideas API
        const { data } = await axios.get(`${apiUrl}/api/mentors/my-ideas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      } else if (isTeamMember) {
        // Team member's shared ideas API
        const { data } = await axios.get(`${apiUrl}/api/teams/shared-ideas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      }
      return { data: [] };
    },
    enabled: !!roleParam, // Only fetch if role is specified
  });

  const myIdeas = ideasResp?.data || [];

  const getStatus = (idea: Idea) => {
    if (isMentor) {
      return idea.mentorRequestStatus || idea.mentorStatus || "pending";
    }
    return "active"; // Team members don't have status field
  };

  const getDomain = (idea: Idea) => {
    return idea.domain || "Not specified";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ✅ Get appropriate title based on role
  const getTitle = () => {
    if (isMentor) return "My Assigned Ideas";
    if (isTeamMember) return "Shared Ideas";
    return "Ideas";
  };

  const getDescription = () => {
    if (isMentor) return "Ideas where you have been assigned as a mentor.";
    if (isTeamMember)
      return "Ideas where you have been invited as a team member.";
    return "Your assigned ideas.";
  };

  const getEmptyMessage = () => {
    if (isMentor)
      return "You have not been assigned to any ideas yet. Innovators will send you mentorship requests.";
    if (isTeamMember)
      return "You have not been invited to any ideas yet. Innovators will send you team invitations.";
    return "No ideas found.";
  };

  // ✅ Show error if no role param
  if (!roleParam) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Loading your assigned ideas...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load ideas. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        {myIdeas.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getEmptyMessage()}</AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Domain</TableHead>
                {isMentor && <TableHead>Status</TableHead>}
                <TableHead>
                  {isMentor ? "Assigned Date" : "Invited Date"}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myIdeas.map((idea: Idea) => (
                <TableRow
                  key={idea._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    router.push(
                      `/dashboard/ideas/details?id=${idea._id}&role=${roleParam}`,
                    )
                  }
                >
                  <TableCell className="font-medium">{idea.title}</TableCell>
                  <TableCell>{getDomain(idea)}</TableCell>
                  {isMentor && (
                    <TableCell>
                      <Badge className={STATUS_COLORS[getStatus(idea)]}>
                        {getStatus(idea).charAt(0).toUpperCase() +
                          getStatus(idea).slice(1)}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>{formatDate(idea.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="link"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={`/dashboard/ideas/details?id=${idea._id}&role=${roleParam}`}
                      >
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
