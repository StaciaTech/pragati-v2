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
} from "recharts";

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
const getToken = () => localStorage.getItem("token");

const chartConfig = {
  ideas: { label: "Ideas", color: "hsl(var(--chart-1))" },
  score: { label: "Score", color: "hsl(var(--chart-2))" },
};

export default function PrincipalDashboardPage() {
  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["principal-dashboard"],
    queryFn: async () => {
      const token = getToken();
      const response = await axios.get(
        `${apiUrl}/api/dashboard/principal/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <p className="p-4 text-sm text-muted-foreground">Loading dashboard...</p>
    );
  }

  if (!stats) {
    return (
      <p className="p-4 text-sm text-destructive">Failed to load dashboard.</p>
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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">No Active Plan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Credits (Used / Total)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {credits.used} / {credits.total}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">TTC Slots (Used / Total)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {ttc.used} / {ttc.total}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{statistics.ideaCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pie Chart - Status Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Idea Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="min-h-[250px] w-full"
            >
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={statusDistribution.map((s) => ({
                      ...s,
                      fill: `hsl(var(--color-${s.name.toLowerCase()}))`,
                    }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    label
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Top Innovators */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Performing Innovators</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topInnovators}
                  layout="vertical"
                  margin={{ left: 10, right: 10 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="score" fill="hsl(var(--chart-1))" radius={5} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Submission Trend & Cluster Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Submission Trend</CardTitle>
          </CardHeader>
          <CardContent>
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
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cluster Performance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <SpiderChart data={clusterPerformance} maxScore={100} size={300} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
