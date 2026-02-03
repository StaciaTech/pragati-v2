"use client";

import * as React from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ROLES } from "@/lib/constants";
import { useUserIdeas } from "@/hooks/useUserIdeas";
import { ScoreDisplay } from "@/components/score-display";
import { Skeleton } from "@/components/ui/skeleton";

export default function PrincipalIdeaManagementPage() {
  const {
    data: ideasResponse,
    isLoading: ideaLoading,
    error: ideaErrors,
  } = useUserIdeas();
  console.log(ideasResponse);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [filterDomain, setFilterDomain] = React.useState("all");

  // Extract ideas from response
  const ideas = ideasResponse || [];

  // Get unique statuses and domains
  const uniqueStatuses = [...new Set(ideas.map((idea: any) => idea.status))];
  const uniqueDomains = [
    ...new Set(ideas.map((idea: any) => idea.domain).filter(Boolean)),
  ];

  // Filter ideas
  const filteredIdeas = ideas.filter((idea: any) => {
    const matchesSearch =
      idea.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      idea.status?.toLowerCase() === filterStatus.toLowerCase();

    const matchesDomain =
      filterDomain === "all" || idea.domain === filterDomain;

    return matchesSearch && matchesStatus && matchesDomain;
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "approved" || statusLower === "accepted")
      return "bg-green-500";
    if (statusLower === "pending" || statusLower === "submitted")
      return "bg-yellow-500";
    if (statusLower === "rejected" || statusLower === "declined")
      return "bg-red-500";
    return "bg-gray-500";
  };

  // Loading state
  if (ideaLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>College Idea Management</CardTitle>
          <CardDescription>Loading ideas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (ideaErrors) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>College Idea Management</CardTitle>
          <CardDescription className="text-red-500">
            Failed to load ideas: {ideaErrors.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>College Idea Management</CardTitle>
        <CardDescription>
          Review and monitor all ideas submitted within your institution.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="Search by Title or Innovator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status..." />
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
          <Select value={filterDomain} onValueChange={setFilterDomain}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Domain..." />
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

        {/* Ideas Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Innovator</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Mentor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIdeas.length > 0 ? (
              filteredIdeas.map((idea: any) => (
                <TableRow key={idea._id}>
                  <TableCell className="font-medium font-mono text-xs">
                    {idea._id?.slice(-8)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {idea.title || "Untitled"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {idea.userName || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {idea.userEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center scale-75 origin-left -ml-2">
                      <ScoreDisplay score={idea.overallScore || 0} status="" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{idea.domain || "—"}</p>
                      {idea.subDomain && (
                        <p className="text-xs text-muted-foreground">
                          {idea.subDomain}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{idea.mentorName || "Not assigned"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(idea.status)}>
                      {idea.status || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {idea.submittedAt
                      ? new Date(idea.submittedAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="link" size="sm" asChild>
                      <Link
                        href={`/dashboard/ideas/${idea._id}?role=${ROLES.PRINCIPAL}`}
                      >
                        View Report
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-muted-foreground">
                      {searchTerm ||
                      filterStatus !== "all" ||
                      filterDomain !== "all"
                        ? "No ideas match your filters."
                        : "No ideas submitted yet in your college."}
                    </p>
                    {(searchTerm ||
                      filterStatus !== "all" ||
                      filterDomain !== "all") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setFilterStatus("all");
                          setFilterDomain("all");
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Info */}
        {ideasResponse?.pagination && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {filteredIdeas.length} of {ideasResponse.pagination.total}{" "}
              ideas
            </p>
            <p>
              Page {ideasResponse.pagination.page} of{" "}
              {ideasResponse.pagination.pages}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
