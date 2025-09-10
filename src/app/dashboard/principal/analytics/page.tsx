"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_IDEAS } from "@/lib/data/ideas";
import { MOCK_TTCS } from "@/lib/data/organization";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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
import { SpiderChart } from "@/components/spider-chart";
import { MOCK_INNOVATORS } from "@/lib/data/organization";
import { MOCK_COLLEGES } from "@/lib/data/organization";
import { LineChart, Line } from "recharts";
import { useUserIdeas } from "@/hooks/useUserIdeas";

export default function CollegeAnalyticsPage() {
  const college = MOCK_COLLEGES[0];
  const {
    data: ideas,
    isLoading: ideaLoading,
    error: ideaErrors,
  } = useUserIdeas();
  if (ideaLoading) return <p>Loading…</p>;
  if (ideaErrors) return <p>Error loading ideas.</p>;
  // const ideas = MOCK_IDEAS.filter((i) => i.collegeId === college.id);
  const ttcs = MOCK_TTCS.filter((t) => t.collegeId === college.id);
  // const totalIdeas = ideas.length;
  // const approvedIdeas = ideas.filter((i) => i.status === "Approved").length;
  // const approvalRate = totalIdeas > 0 ? (approvedIdeas / totalIdeas) * 100 : 0;

  // const domainSubmissions = ideas.reduce((acc, idea) => {
  //   acc[idea.domain] = (acc[idea.domain] || 0) + 1;
  //   return acc;
  // }, {} as Record<string, number>);

  // const domainChartData = Object.entries(domainSubmissions).map(
  //   ([name, ideas]) => ({ name, ideas })
  // );

  // const statusCounts = ideas.reduce((acc, idea) => {
  //   const status = idea.report?.validationOutcome || idea.status || "N/A";
  //   acc[status] = (acc[status] || 0) + 1;
  //   return acc;
  // }, {} as Record<string, number>);

  // const statusChartData = [
  //   {
  //     name: "Approved",
  //     value: statusCounts.Approved || 0,
  //     fill: "hsl(var(--color-approved))",
  //   },
  //   {
  //     name: "Moderate",
  //     value: statusCounts.Moderate || 0,
  //     fill: "hsl(var(--color-moderate))",
  //   },
  //   {
  //     name: "Rejected",
  //     value: statusCounts.Rejected || 0,
  //     fill: "hsl(var(--color-rejected))",
  //   },
  // ];

  // const submissionTrendData = ideas.reduce((acc, idea) => {
  //   const month = new Date(idea.dateSubmitted).toLocaleString("default", {
  //     month: "short",
  //   });
  //   acc[month] = (acc[month] || 0) + 1;
  //   return acc;
  // }, {} as Record<string, number>);

  // const trendChartData = Object.entries(submissionTrendData).map(
  //   ([name, ideas]) => ({ name, ideas })
  // );

  const ttcPerformance = ttcs.map((ttc) => {
    const ttcIdeas = MOCK_IDEAS.filter((idea) => idea.ttcAssigned === ttc.id);
    const approved = ttcIdeas.filter((i) => i.status === "Approved").length;
    return {
      name: ttc.name
        .replace("Dr. ", "")
        .replace("Mr. ", "")
        .replace("Ms. ", ""),
      ideas: ttcIdeas.length,
      approvalRate:
        ttcIdeas.length > 0 ? (approved / ttcIdeas.length) * 100 : 0,
    };
  });

  const totalIdeas = ideas.length;
  const approvedIdeas = ideas.filter(
    (i: any) => i.status === "approved"
  ).length;
  const approvalRate = totalIdeas > 0 ? (approvedIdeas / totalIdeas) * 100 : 0;

  const domainSubmissions = ideas.reduce((acc: any, idea: any) => {
    acc[idea.domain] = (acc[idea.domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const domainChartData = Object.entries(domainSubmissions).map(
    ([name, ideas]) => ({ name, ideas })
  );

  const statusCounts = ideas.reduce((acc: any, idea: any) => {
    const status = idea.status || "N/A";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(statusCounts);

  const statusChartData = [
    {
      name: "Approved",
      value: statusCounts.approved || 0,
      fill: "hsl(var(--color-approved))",
    },
    {
      name: "Moderate",
      value: statusCounts.Moderate || 0,
      fill: "hsl(var(--color-moderate))",
    },
    {
      name: "Rejected",
      value: statusCounts.declined || 0,
      fill: "hsl(var(--color-rejected))",
    },
  ];

  const submissionTrendData = ideas.reduce((acc: any, idea: any) => {
    const month = new Date(idea.createdAt).toLocaleString("default", {
      month: "short",
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const trendChartData = Object.entries(submissionTrendData).map(
    ([name, ideas]) => ({ name, ideas })
  );

  // const ttcPerformance = ttcs.map((ttc: any) => {
  //   const ttcIdeas = ideas.filter((idea: any) => idea.ttcAssigned === ttc._id);
  //   const approved = ttcIdeas.filter(
  //     (i: any) => i.status === "Approved"
  //   ).length;
  //   return {
  //     name: ttc.name
  //       .replace("Dr. ", "")
  //       .replace("Mr. ", "")
  //       .replace("Ms. ", ""),
  //     ideas: ttcIdeas.length,
  //     approvalRate:
  //       ttcIdeas.length > 0 ? (approved / ttcIdeas.length) * 100 : 0,
  //   };
  // });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">
              {approvalRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalIdeas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total TTCs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{MOCK_TTCS.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
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
        <Card>
          <CardHeader>
            <CardTitle>Idea Status Distribution</CardTitle>
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
    </div>
  );
}
