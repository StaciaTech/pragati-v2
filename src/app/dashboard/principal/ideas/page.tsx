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
import { MOCK_IDEAS } from "@/lib/data/ideas";
import { STATUS_COLORS } from "@/lib/data/platform";
import { MOCK_TTCS } from "@/lib/data/organization";
import Link from "next/link";
import { ROLES } from "@/lib/constants";
import { MOCK_INTERNAL_MENTOR_USERS } from "@/lib/data/auth";
import { useUserIdeas } from "@/hooks/useUserIdeas";

export default function PrincipalIdeaManagementPage() {
  const {
    data: ideas,
    isLoading: ideaLoading,
    error: ideaErrors,
  } = useUserIdeas();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [filterTtc, setFilterTtc] = React.useState("all");

  const uniqueStatuses = [...new Set(MOCK_IDEAS.map((idea) => idea.status))];

  const filteredIdeas = MOCK_IDEAS.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.innovatorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || idea.status === filterStatus;
    const matchesTtc = filterTtc === "all" || idea.ttcAssigned === filterTtc;
    return matchesSearch && matchesStatus && matchesTtc;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>College Idea Management</CardTitle>
        <CardDescription>
          Review and monitor all ideas submitted within your institution.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
          <Select value={filterTtc} onValueChange={setFilterTtc}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by TTC..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All TTCs</SelectItem>
              {MOCK_TTCS.map((ttc) => (
                <SelectItem key={ttc.id} value={ttc.id}>
                  {ttc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Innovator</TableHead>
              <TableHead>Assigned TTC</TableHead>
              <TableHead>Internal Mentor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ideas?.map((idea) => {
              // const ttc = MOCK_TTCS.find((t) => t.id === idea.ttcAssigned);
              // const internalMentor = MOCK_INTERNAL_MENTOR_USERS.find(
              //   (m) => m.id === (idea as any).internalMentorId
              // );
              return (
                <TableRow key={idea._id}>
                  <TableCell className="font-medium">{idea._id}</TableCell>
                  <TableCell>{idea.ideaName}</TableCell>
                  <TableCell>{idea.innovator.name}</TableCell>
                  <TableCell>{idea.ttc.name || "N/A"}</TableCell>
                  <TableCell>{idea?.internalMentor?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[idea.status]}>
                      {idea.status}
                    </Badge>
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
              );
            })}
            {ideas?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No ideas found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
