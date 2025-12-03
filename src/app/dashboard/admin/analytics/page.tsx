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
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
  Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState<any>(null);
  const [domainData, setDomainData] = React.useState<any[]>([]);
  const [collegeData, setCollegeData] = React.useState<any[]>([]);

  // Fetch analytics
  React.useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      try {
        const [summaryRes, domainRes, collegeRes] = await Promise.all([
          axios.get(`${apiUrl}/api/analytics/admin/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/analytics/admin/domain-approval-rates`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/api/analytics/admin/college-distribution`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setSummary(summaryRes.data.data);
        setDomainData(domainRes.data.data);
        setCollegeData(collegeRes.data.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Export data
  const handleExport = async (format: "csv" | "pdf") => {
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const response = await axios.get(
        `${apiUrl}/api/analytics/admin/export?type=ideas`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (format === "csv") {
        // Convert to CSV
        const data = response.data.data;
        if (data.length === 0) return;

        const headers = Object.keys(data[0]).join(",");
        const rows = data.map((row: any) =>
          Object.values(row)
            .map((val) => `"${val}"`)
            .join(",")
        );
        const csv = [headers, ...rows].join("\n");

        // Download
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ideas-export-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        a.click();
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Advanced Analytics</CardTitle>
          <CardDescription>
            View system-wide analytics, trends, and export data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <div className="grid grid-cols-5 gap-4 flex-1">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Colleges</p>
              <p className="text-2xl font-bold">
                {summary?.totalColleges || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">TTCs</p>
              <p className="text-2xl font-bold">{summary?.totalTTCs || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Innovators</p>
              <p className="text-2xl font-bold">
                {summary?.totalInnovators || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Ideas</p>
              <p className="text-2xl font-bold">{summary?.totalIdeas || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Approval Rate</p>
              <p className="text-2xl font-bold text-green-500">
                {summary?.approvalRate?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Domain Approval Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Approval Rates by Domain</CardTitle>
            <CardDescription>
              System-wide approval rates across domains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={domainData}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" dataKey="approvalRate" unit="%" />
                  <YAxis
                    type="category"
                    dataKey="domain"
                    tickLine={false}
                    axisLine={false}
                    width={120}
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
                          if (name === "approvalRate")
                            return [
                              `${(value as number).toFixed(2)}%`,
                              "Approval Rate",
                            ];
                          if (name === "totalIdeas")
                            return [value, "Total Ideas"];
                          return [value, name];
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="approvalRate"
                    fill="hsl(var(--chart-2))"
                    radius={5}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* College Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Global Submission Distribution</CardTitle>
            <CardDescription>
              Total idea submissions from each institution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        contentStyle={{
                          background: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                        }}
                        labelClassName="font-bold"
                        formatter={(value, name) => [value, "Submissions"]}
                        indicator="dot"
                      />
                    }
                  />
                  <Pie
                    data={collegeData}
                    dataKey="submissions"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {collegeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Validation Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Time-to-Decision Metrics</CardTitle>
          <CardDescription>
            Validation time statistics across the system
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Average Validation Time
            </p>
            <p className="text-2xl font-bold">
              {summary?.validationMetrics?.avgDays || 0} Days
            </p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Longest Validation Time
            </p>
            <p className="text-2xl font-bold">
              {summary?.validationMetrics?.maxDays || 0} Days
            </p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Shortest Validation Time
            </p>
            <p className="text-2xl font-bold">
              {summary?.validationMetrics?.minDays || 0} Days
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
