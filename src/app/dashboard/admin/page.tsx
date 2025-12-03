"use client";

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
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

interface DashboardStats {
  counts: {
    totalColleges: number;
    totalTTCs: number;
    totalInnovators: number;
    totalIdeas: number;
  };
  ideaStatusData: Array<{ name: string; value: number }>;
  collegePerformance: Array<{
    name: string;
    ideas: number;
    approvalRate: number;
  }>;
  revenueByPlan: Array<{ name: string; revenue: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  Slay: "hsl(142, 71%, 45%)",
  Mid: "hsl(48, 96%, 53%)",
  Flop: "hsl(0, 84%, 60%)",
};

export default function AdminDashboardPage() {
  // ✅ Fetch Dashboard Stats
  const {
    data: statsResp,
    isLoading,
    error,
  } = useQuery<{ data: DashboardStats }>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(`${apiUrl}/api/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (error || !statsResp) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard stats. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const stats = statsResp.data;
  const { counts, ideaStatusData, collegePerformance, revenueByPlan } = stats;

  // Add colors to ideaStatusData
  const enhancedIdeaStatusData = ideaStatusData.map((item) => ({
    ...item,
    fill: STATUS_COLORS[item.name] || "hsl(var(--muted))",
  }));

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Platform Dashboard</CardTitle>
          <CardDescription>
            A high-level overview of the entire PragatiAI ecosystem.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Colleges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{counts.totalColleges}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total TTCs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{counts.totalTTCs}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Innovators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{counts.totalInnovators}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{counts.totalIdeas}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Platform-wide Idea Status</CardTitle>
              <CardDescription>
                Distribution of all ideas submitted across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={enhancedIdeaStatusData}
                    layout="vertical"
                    margin={{ left: 10, right: 10 }}
                  >
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip
                      cursor={true}
                      content={
                        <ChartTooltipContent
                          contentStyle={{
                            background: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                          }}
                          labelClassName="font-bold"
                          formatter={(value) => [`${value} Ideas`, ""]}
                        />
                      }
                    />
                    <Bar dataKey="value" radius={5}>
                      {enhancedIdeaStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue by Plan</CardTitle>
              <CardDescription>
                Estimated revenue from active plans.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {revenueByPlan.some((plan) => plan.revenue > 0) ? (
                <ChartContainer config={{}} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
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
                            formatter={(value) => [
                              `₹${(value as number).toLocaleString()}`,
                              "",
                            ]}
                          />
                        }
                      />
                      <Pie
                        data={revenueByPlan}
                        dataKey="revenue"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        label
                      >
                        {revenueByPlan.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`hsl(var(--chart-${index + 1}))`}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Institutions</CardTitle>
            <CardDescription>
              Ranked by total number of ideas submitted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Institution Name</TableHead>
                  <TableHead>Ideas Submitted</TableHead>
                  <TableHead>Approval Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collegePerformance.length > 0 ? (
                  collegePerformance.map((college, index) => (
                    <TableRow key={college.name}>
                      <TableCell className="font-bold">{index + 1}</TableCell>
                      <TableCell>{college.name}</TableCell>
                      <TableCell>{college.ideas}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {college.approvalRate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No college data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
