"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { SpiderChart } from "@/components/spider-chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
const getToken = () => localStorage.getItem("token");

const chartConfig = {
  ideas: { label: "Ideas", color: "hsl(var(--chart-1))" },
  score: { label: "Score", color: "hsl(var(--chart-2))" },
};

// ✅ Colors for pie chart
const STATUS_COLORS = {
  submitted: "hsl(210, 100%, 50%)", // Blue
  validated: "hsl(150, 100%, 40%)", // Green
  approved: "hsl(120, 100%, 35%)", // Dark Green
  rejected: "hsl(0, 100%, 50%)", // Red
  moderate: "hsl(30, 100%, 50%)", // Orange
};

export default function PrincipalDashboardPage() {
  // Fetch dashboard stats
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["principal-dashboard"],
    queryFn: async () => {
      const token = getToken();
      const response = await axios.get(
        `${apiUrl}/api/dashboard/principal/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("Dashboard data:", response.data.data);
      return response.data.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // ✅ Fetch current subscription
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: async () => {
      const token = getToken();
      const response = await axios.get(`${apiUrl}/api/plans/my-subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
    refetchInterval: 60000,
  });

  if (isLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-sm text-muted-foreground">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg font-semibold text-destructive">
          Failed to load dashboard
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </p>
      </div>
    );
  }

  const {
    credits,
    ttc,
    statistics,
    statusDistribution,
    submissionTrend,
    topInnovators,
    clusterPerformance,
  } = stats;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">College Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of innovation activities and performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Ignore Current Plan as requested */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {subscriptionData?.planName || "Custom"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Credits (Used / Total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {credits.used} / {credits.total}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {credits.available ?? 0} available
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {credits.usedThisMonth ?? 0} used this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              TTC Slots (Used / Total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {ttc.used} / {ttc.total}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {ttc.available} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statistics.ideaCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.validatedIdeas} validated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Innovators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statistics.innovatorCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg Score: {statistics.averageScore}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Reports Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {statistics.reportsGeneratedMonth} / {statistics.reportsLimit}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Used this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pie Chart - Status Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Idea Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusDistribution && statusDistribution.length > 0 ? (
              <ChartContainer
                config={chartConfig}
                className="min-h-[250px] w-full"
              >
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Tooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      label
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            STATUS_COLORS[
                              entry.name.toLowerCase() as keyof typeof STATUS_COLORS
                            ] || "hsl(var(--chart-1))"
                          }
                        />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-center text-muted-foreground py-16">
                No data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Top Innovators */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Performing Innovators</CardTitle>
          </CardHeader>
          <CardContent>
            {topInnovators && topInnovators.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topInnovators}
                    layout="vertical"
                    margin={{ left: 10, right: 10 }}
                  >
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      width={120}
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="score"
                      fill="hsl(var(--chart-1))"
                      radius={5}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-center text-muted-foreground py-16">
                No innovators with validated ideas yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Line Chart - Submission Trend */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Submission Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {submissionTrend && submissionTrend.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={submissionTrend}
                    margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="ideas"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-1))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-center text-muted-foreground py-16">
                No submission data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Spider Chart - Cluster Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cluster Performance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {clusterPerformance && clusterPerformance.length > 0 ? (
              <SpiderChart
                data={clusterPerformance}
                maxScore={100}
                size={300}
              />
            ) : (
              <p className="text-center text-muted-foreground py-16">
                No cluster data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
