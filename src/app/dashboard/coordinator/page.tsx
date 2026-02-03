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
  UserCog,
  Loader2,
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
import { useRouter } from "next/navigation";
import { ROLES } from "@/lib/constants";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useConsultations } from "@/hooks/useConsultations";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

/* ---------- STATUS COLORS ---------- */
const STATUS_COLORS: Record<string, string> = {
  assigned: "bg-blue-500 text-white",
  rescheduled: "bg-yellow-500 text-white",
  completed: "bg-green-500 text-white",
  cancelled: "bg-red-500 text-white",
};

export default function CoordinatorDashboardPage() {
  const router = useRouter();
  const { data: profile } = useUserProfile();
  const token = getToken();

  const { consultations } = useConsultations();
  console.log(consultations);

  /* ------------- FETCH DASHBOARD STATS API -------------- */
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["coordinator-dashboard-stats"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${apiUrl}/api/coordinator/stats/dashboard`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data.data;
    },
    enabled: !!token,
    refetchInterval: 60000, // Refetch every minute
  });

  /* ------------- EXTRACT STATS -------------- */
  const {
    totalInnovators = 0,
    totalAssignedIdeas = 0,
    pendingEvaluations = 0,
    internalMentors = 0,
    upcomingConsultations = 0,
    statusDistribution = { approved: 0, improvise: 0, rejected: 0, pending: 0 },
    topInnovators = [],
    // consultations = [],
  } = statsData || {};

  /* ------------- CHART: STATUS DISTRIBUTION ---- */
  const pieData = React.useMemo(() => {
    return [
      {
        name: "Approved",
        value: statusDistribution.approved,
        fill: "hsl(var(--chart-1))",
      },
      {
        name: "Improvise",
        value: statusDistribution.improvise,
        fill: "hsl(var(--chart-2))",
      },
      {
        name: "Rejected",
        value: statusDistribution.rejected,
        fill: "hsl(var(--chart-3))",
      },
      {
        name: "Pending",
        value: statusDistribution.pending,
        fill: "hsl(var(--chart-4))",
      },
    ];
  }, [statusDistribution]);

  /* ------------- CHART: TOP INNOVATORS --------- */
  const chartInnovators = React.useMemo(() => {
    return topInnovators.map((inv: any) => ({
      name: inv.name,
      score: inv.avgScore,
    }));
  }, [topInnovators]);

  /* ------------- LOADING STATE ----------------- */
  if (!profile || statsLoading) {
    return (
      <div className="flex items-center justify-center h-96 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

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
            <p className="text-2xl font-bold">{totalInnovators}</p>
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
            <p className="text-2xl font-bold">{totalAssignedIdeas}</p>
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
            <p className="text-2xl font-bold">{pendingEvaluations}</p>
          </CardContent>
        </Card>

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
            <p className="text-2xl font-bold">{internalMentors}</p>
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
            <p className="text-2xl font-bold">{upcomingConsultations}</p>
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
            {chartInnovators.length > 0 ? (
              <ChartContainer config={{}} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartInnovators}
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
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No innovators with scored ideas yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Idea Status Distribution</CardTitle>
            <CardDescription>All ideas you manage</CardDescription>
          </CardHeader>
          <CardContent>
            {totalAssignedIdeas > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No ideas submitted yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* UPCOMING CONSULTATIONS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Consultations</CardTitle>
          <CardDescription>
            Scheduled consultations with your innovators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Idea Title</TableHead>
                <TableHead>Innovator</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consultations && consultations.length > 0 ? (
                consultations.map((consult: any) => (
                  <TableRow
                    key={consult.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      router.push(
                        `/dashboard/ideas/${consult.ideaId}?role=${ROLES.COORDINATOR}`
                      )
                    }
                  >
                    <TableCell className="font-medium">
                      {consult.title}
                    </TableCell>
                    <TableCell>{consult.innovatorName}</TableCell>
                    <TableCell>{consult.mentor || "TBD"}</TableCell>
                    <TableCell>
                      {consult.scheduledDate && consult.scheduledTime
                        ? `${consult.scheduledDate} at ${consult.scheduledTime}`
                        : "Not scheduled"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          STATUS_COLORS[consult.status] ||
                            "bg-gray-500 text-white"
                        )}
                      >
                        {consult.status || "pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground h-24"
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
