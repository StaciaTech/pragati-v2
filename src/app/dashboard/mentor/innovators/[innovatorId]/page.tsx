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
import { ArrowLeft, Mail, School, CreditCard, Loader2 } from "lucide-react";
import { STATUS_COLORS } from "@/lib/data/platform";
import { ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

export default function MentorInnovatorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const innovatorId = params.innovatorId as string;
  const role = searchParams.get("role") || ROLES.MENTOR;

  // ✅ Fetch innovator details
  const { data: innovatorData, isLoading } = useQuery({
    queryKey: ["mentor-innovator-detail", innovatorId],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(
        `${apiUrl}/api/mentors/innovators/${innovatorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data.data;
    },
    enabled: !!innovatorId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!innovatorData) {
    return <p>Innovator not found.</p>;
  }

  const { profile, mentoredIdeas, consultationHistory } = innovatorData;

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link href={`/dashboard/mentor/innovators?role=${role}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Innovators
        </Link>
      </Button>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center justify-between">
            <span>{profile.name}</span>
            <Badge variant={profile.isActive ? "default" : "destructive"}>
              {profile.isActive ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
          <CardDescription>Innovator Profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{profile.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {profile.college?.name || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {profile.creditQuota || 0} Credits
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentored Ideas Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mentored Ideas</CardTitle>
          <CardDescription>
            A list of all ideas you are mentoring for {profile.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mentoredIdeas.length > 0 ? (
                mentoredIdeas.map((idea: any) => (
                  <TableRow
                    key={idea._id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/ideas/${idea._id}?role=${role}`)
                    }
                  >
                    <TableCell className="font-medium">{idea.title}</TableCell>
                    <TableCell>{idea.domain || "N/A"}</TableCell>
                    <TableCell>
                      {idea.submittedAt
                        ? new Date(idea.submittedAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(STATUS_COLORS[idea.status] || "")}>
                        {idea.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {idea.overallScore ? idea.overallScore.toFixed(1) : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" size="sm" asChild>
                        <Link
                          href={`/dashboard/ideas/${idea._id}?role=${role}`}
                        >
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No ideas mentored for this innovator.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Consultation History */}
      <Card>
        <CardHeader>
          <CardTitle>Consultation History</CardTitle>
          <CardDescription>
            A log of all consultations with {profile.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Idea</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultationHistory.length > 0 ? (
                consultationHistory.map((consultation: any) => (
                  <TableRow
                    key={consultation._id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/dashboard/mentor/consultations?role=${role}`
                      )
                    }
                  >
                    <TableCell>{consultation.ideaTitle}</TableCell>
                    <TableCell>
                      {consultation.scheduledAt
                        ? new Date(consultation.scheduledAt).toLocaleString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(STATUS_COLORS[consultation.status] || "")}
                      >
                        {consultation.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No consultation history.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
