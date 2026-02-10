"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lightbulb, TrendingUp, Loader2 } from "lucide-react";
import { ROLES } from "@/lib/constants";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("");

export default function MentorInnovatorsPage() {
  const router = useRouter();

  // ✅ Fetch assigned innovators
  const { data: innovatorsResp, isLoading } = useQuery({
    queryKey: ["mentor-assigned-innovators"],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(
        `${apiUrl}/api/mentors/assigned-innovators`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
  });

  const assignedInnovators = innovatorsResp?.data || [];

  const handleRowClick = (innovatorId: string) => {
    router.push(
      `/dashboard/mentor/innovators/details?id=${innovatorId}&role=${ROLES.MENTOR}`,
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Innovators</CardTitle>
        <CardDescription>
          A list of all innovators you are currently mentoring.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Innovator</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Ideas Mentored</TableHead>
              <TableHead>Average Score</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignedInnovators.length > 0 ? (
              assignedInnovators.map((innovator: any) => (
                <TableRow
                  key={innovator._id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(innovator._id)}
                >
                  <TableCell className="font-medium flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          innovator.profileImage ||
                          `https://avatar.vercel.sh/${innovator.name}.png`
                        }
                        alt={innovator.name}
                      />
                      <AvatarFallback>
                        {getInitials(innovator.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-primary hover:underline">
                      {innovator.name}
                      {innovator.isTeamMember && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Team Member
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>{innovator.college?.name || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Lightbulb className="h-4 w-4 text-muted-foreground" />
                      {innovator.stats.ideasMentored}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      {innovator.stats.averageScore}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={innovator.isActive ? "default" : "destructive"}
                    >
                      {innovator.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No innovators assigned yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
