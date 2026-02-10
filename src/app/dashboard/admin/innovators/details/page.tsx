"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
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
import {
  ArrowLeft,
  User,
  Mail,
  School,
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-500 text-white",
  under_review: "bg-yellow-500 text-white",
  approved: "bg-green-500 text-white",
  rejected: "bg-red-500 text-white",
  draft: "bg-gray-500 text-white",
  pending: "bg-yellow-500 text-white",
  accepted: "bg-green-500 text-white",
  Active: "bg-green-500 text-white",
  Inactive: "bg-red-500 text-white",
};

interface Idea {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  overallScore?: number;
  validationOutcome?: string;
}

interface Consultation {
  _id: string;
  ideaTitle?: string;
  mentorName?: string;
  mentorEmail?: string;
  requestedAt: string;
  status: string;
}

interface InnovatorProfile {
  innovator: {
    _id: string;
    name: string;
    email: string;
    isActive: boolean;
    creditQuota?: number;
    collegeId?: string;
  };
  college?: {
    _id: string;
    collegeName: string;
    email: string;
  } | null;
  ideas: Idea[];
  consultations: Consultation[];
  stats: {
    totalIdeas: number;
    totalConsultations: number;
    credits: number;
  };
}

export default function AdminInnovatorDetailPage() {
  // const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const innovatorId = searchParams.get("id") || "";
  const role = searchParams.get("role") || ROLES.SUPER_ADMIN;

  // ✅ Fetch Innovator Profile
  const {
    data: profileResp,
    isLoading,
    error,
  } = useQuery<InnovatorProfile>({
    queryKey: ["innovator-profile", innovatorId],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(
        `${apiUrl}/api/admin/innovators/${innovatorId}/profile`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data.data;
    },
    enabled: !!innovatorId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading innovator profile...</span>
      </div>
    );
  }

  if (error || !profileResp) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load innovator profile. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const { innovator, college, ideas, consultations, stats } = profileResp;

  const getOverallScore = (idea: Idea) => {
    if (idea.overallScore !== null && idea.overallScore !== undefined) {
      return idea.overallScore.toFixed(1);
    }
    return "N/A";
  };

  const getStatus = (idea: Idea) => {
    return idea.validationOutcome || idea.status;
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link href={`/dashboard/admin/gods-eye-view?role=${role}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to God's Eye View
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center justify-between">
            <span>{innovator.name}</span>
            <Badge
              className={cn(
                STATUS_COLORS[innovator.isActive ? "Active" : "Inactive"],
              )}
            >
              {innovator.isActive ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
          <CardDescription>Innovator Profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{innovator.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {college?.collegeName || "No college assigned"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {stats.credits} Credits
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Ideas</CardTitle>
              <CardDescription>
                A list of all ideas submitted by {innovator.name}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Date Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ideas.length > 0 ? (
                    ideas.map((idea) => (
                      <TableRow
                        key={idea._id}
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/dashboard/ideas/details?id=${idea._id}&role=${role}`,
                          )
                        }
                      >
                        <TableCell className="font-mono text-xs">
                          {idea._id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          {idea.title}
                        </TableCell>
                        <TableCell>
                          {new Date(idea.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(STATUS_COLORS[getStatus(idea)])}>
                            {getStatus(idea)}
                          </Badge>
                        </TableCell>
                        <TableCell>{getOverallScore(idea)}</TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="link" size="sm" asChild>
                            <Link
                              href={`/dashboard/ideas/details?id=${idea._id}&role=${role}`}
                            >
                              View Report
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No ideas submitted yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consultation History</CardTitle>
              <CardDescription>
                A log of all consultations requested by {innovator.name}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Idea</TableHead>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultations.length > 0 ? (
                    consultations.map((consultation) => (
                      <TableRow key={consultation._id}>
                        <TableCell>
                          {consultation.ideaTitle || "Untitled"}
                        </TableCell>
                        <TableCell>
                          {consultation.mentorName || "Unknown"}
                          {consultation.mentorEmail && (
                            <p className="text-xs text-muted-foreground">
                              {consultation.mentorEmail}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(
                            consultation.requestedAt,
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(STATUS_COLORS[consultation.status])}
                          >
                            {consultation.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No consultation history.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
