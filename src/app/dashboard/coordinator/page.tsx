"use client";
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
import {
  Lightbulb,
  ListChecks,
  Users,
  MessageSquare,
  UserCog, // 🔧 NEW ICON for internal mentors
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROLES } from "@/lib/constants";
import { useAllInnovators } from "@/hooks/useAllInnovators";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { STATUS_COLORS } from "@/lib/data/platform";
import { useUserIdeas } from "@/hooks/useUserIdeas";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

/* ---------- HELPERS ---------- */
const avg = (arr: number[]) =>
  arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

export default function CoordinatorDashboardPage() {
  const router = useRouter();
  const { data: profile } = useUserProfile();
  const { data: allInnovators = [] } = useAllInnovators();
  const token = getToken();

  const innovators = React.useMemo(
    () =>
      allInnovators.filter((inv: any) => inv.ttcCoordinatorId === profile?.uid),
    [allInnovators, profile?.uid]
  );

  /* ------------- FETCH REAL IDEAS -------------- */
  const { data: ideas = [] } = useUserIdeas();

  /* ------------- FETCH INTERNAL MENTORS -------------- */
  const { data: mentorsData } = useQuery({
    queryKey: ["internal-mentors"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${apiUrl}/api/coordinator/internal-mentors`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    enabled: !!token,
  });

  const mentors = mentorsData?.data || [];
  const ownMentors = mentors.filter((m: any) => m.canControl); // Created by TTC
  const principalMentors = mentors.filter((m: any) => !m.canControl); // Created by Principal

  /* ------------- DERIVED NUMBERS --------------- */
  const assignedIdeas = ideas;
  const pendingEvaluations = ideas.filter((i: any) => i.status === "pending");
  const scheduledConsultations: any[] = [];

  /* ------------- CHART: STATUS DISTRIBUTION ---- */
  const statusCounts = ideas.reduce((acc: any, i: any) => {
    const s = i.status || "pending";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const pieData = ["approved", "improvise", "rejected", "pending"].map((s) => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: statusCounts[s] || 0,
    fill: `hsl(var(--chart-${
      s === "approved" ? 1 : s === "improvise" ? 2 : s === "rejected" ? 3 : 4
    }))`,
  }));

  /* ------------- CHART: TOP INNOVATORS --------- */
  const topInnovators = React.useMemo(() => {
    const map: Record<string, number[]> = {};
    ideas.forEach((i: any) => {
      if (i.userId) (map[i.userId] ||= []).push(i.overallScore || 0);
    });
    return Object.entries(map)
      .map(([uid, scores]) => ({
        name: innovators.find((inv: any) => inv._id === uid)?.name || "Unknown",
        score: avg(scores),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [ideas, innovators]);

  /* ------------- LOADING STATE ----------------- */
  if (!profile)
    return (
      <div className="flex items-center justify-center h-96">
        Loading profile…
      </div>
    );

  /* ------------- UI --------------------------- */
  return (
    <div className="flex flex-col gap-6">
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() =>
            router.push(
              `/dashboard/coordinator/innovator-management?role=${ROLES.COORDINATOR}`
            )
          }
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Innovators
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{allInnovators?.length}</p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() =>
            router.push(
              `/dashboard/coordinator/manage-ideas?role=${ROLES.COORDINATOR}`
            )
          }
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assigned Ideas
            </CardTitle>
            <Lightbulb className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{assignedIdeas.length}</p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() =>
            router.push(
              `/dashboard/coordinator/manage-ideas?role=${ROLES.COORDINATOR}`
            )
          }
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Evaluations
            </CardTitle>
            <ListChecks className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingEvaluations.length}</p>
          </CardContent>
        </Card>

        {/* 🔧 NEW: INTERNAL MENTORS CARD */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() =>
            router.push(
              `/dashboard/coordinator/internal-mentors?role=${ROLES.COORDINATOR}`
            )
          }
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Internal Mentors
            </CardTitle>
            <UserCog className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mentors.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {ownMentors.length} yours · {principalMentors.length} principal's
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() =>
            router.push(
              `/dashboard/coordinator/consultations?role=${ROLES.COORDINATOR}`
            )
          }
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Consultations
            </CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {scheduledConsultations.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Performing Innovators</CardTitle>
            <CardDescription>
              Average idea score (only innovators with submitted ideas)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topInnovators}
                  layout="vertical"
                  margin={{ left: 10 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip cursor content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="score"
                    fill="hsl(var(--chart-1))"
                    radius={5}
                    background={{ fill: "hsl(var(--muted)/0.5)", radius: 5 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Idea Status Distribution</CardTitle>
            <CardDescription>All ideas you manage</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px]">
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* UPCOMING CONSULTATIONS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Consultations</CardTitle>
          <CardDescription>
            Scheduled consultations with innovators (feature coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Idea Title</TableHead>
                <TableHead>Innovator</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledConsultations.length ? (
                scheduledConsultations.map((idea) => (
                  <TableRow
                    key={idea.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/dashboard/ideas/${idea.id}?role=${ROLES.COORDINATOR}`
                      )
                    }
                  >
                    <TableCell>{idea.title}</TableCell>
                    <TableCell>{idea.innovatorName}</TableCell>
                    <TableCell>
                      {idea.consultationDate} at {idea.consultationTime}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          STATUS_COLORS[idea.consultationStatus || ""]
                        )}
                      >
                        {idea.consultationStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    No upcoming consultations.
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
