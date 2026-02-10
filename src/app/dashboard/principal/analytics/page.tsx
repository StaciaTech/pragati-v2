"use client";

import * as React from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function CollegeAnalyticsPage() {
  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState<any>(null);
  const [ttcPerformance, setTtcPerformance] = React.useState<any[]>([]);
  const [domainData, setDomainData] = React.useState<any[]>([]);

  // Fetch analytics data
  React.useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      try {
        const [summaryRes, ttcRes, domainRes] = await Promise.all([
          axios.get(`${apiUrl}/api/analytics/college/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/analytics/college/ttc-performance`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/analytics/domain-trend`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setSummary(summaryRes.data.data);
        setTtcPerformance(ttcRes.data.data);
        setDomainData(domainRes.data.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  React.useEffect(() => {
    if (summary) {
      console.log("Analytics Summary:", summary);
      console.log("Status Breakdown:", summary.statusBreakdown);
    }
  }, [summary]);

  // Build status chart data
  // ✅ Colors for pie chart
  const STATUS_COLORS = {
    submitted: "hsl(210, 100%, 50%)", // Blue
    validated: "hsl(150, 100%, 40%)", // Green
    approved: "hsl(120, 100%, 35%)", // Dark Green
    rejected: "hsl(0, 100%, 50%)", // Red
    moderate: "hsl(30, 100%, 50%)", // Orange
  };

  // Build status chart data
  const statusChartData = summary?.statusBreakdown
    ? Object.entries(summary.statusBreakdown).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count as number,
        fill:
          STATUS_COLORS[status.toLowerCase() as keyof typeof STATUS_COLORS] ||
          "hsl(var(--chart-1))",
      }))
    : [
        {
          name: "Approved",
          value: summary?.approvedIdeas || 0,
          fill: STATUS_COLORS.approved,
        },
        {
          name: "Submitted",
          value: summary?.statusBreakdown?.submitted || 0,
          fill: STATUS_COLORS.submitted,
        },
        {
          name: "Rejected",
          value: summary?.statusBreakdown?.rejected || 0,
          fill: STATUS_COLORS.rejected,
        },
      ];

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">
              {summary?.approvalRate?.toFixed(1) || 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{summary?.totalIdeas || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total TTCs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{summary?.totalTTCs || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Innovators</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {summary?.totalInnovators || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TTC Performance */}
        <Card>
          <CardHeader>
            <CardTitle>TTC Performance Comparison</CardTitle>
            <CardDescription>
              Comparison of idea submissions and approval rates across TTCs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="min-h-[200px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ttcPerformance}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="hsl(var(--chart-1))"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="hsl(var(--chart-2))"
                    unit="%"
                  />
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        contentStyle={{
                          background: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                        }}
                        labelClassName="font-bold"
                        formatter={(value, name) => {
                          if (name === "ideas")
                            return [value, "Ideas Submitted"];
                          if (name === "approvalRate")
                            return [
                              `${(value as number).toFixed(1)}%`,
                              "Approval Rate",
                            ];
                          return [value, name];
                        }}
                      />
                    }
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="ideas"
                    fill="hsl(var(--chart-1))"
                    name="Ideas Submitted"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="approvalRate"
                    fill="hsl(var(--chart-2))"
                    name="Approval Rate (%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Idea Status Distribution</CardTitle>
            <CardDescription>
              Breakdown of ideas by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="min-h-[200px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Tooltip
                    cursor={true}
                    content={
                      <ChartTooltipContent
                        contentStyle={{
                          background: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                        }}
                        labelClassName="font-bold"
                        formatter={(value, name, props) => {
                          return [`${value} Ideas`, name];
                        }}
                      />
                    }
                  />
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Domain Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Distribution</CardTitle>
          <CardDescription>
            Ideas submitted across different domains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                  }
                />
                <Bar dataKey="ideas" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
