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
  Sector,
  Legend,
  Line,
  LineChart,
  LabelList,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const ActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  return (
    <g>
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill={fill}
        className="text-xl font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <text
        x={cx}
        y={cy + 10}
        dy={8}
        textAnchor="middle"
        fill="hsl(var(--muted-foreground))"
        className="text-xs"
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

export default function CoordinatorAnalyticsPage() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  // ✅ State for analytics data
  const [engagementData, setEngagementData] = React.useState<any[]>([]);
  const [qualityData, setQualityData] = React.useState<any[]>([]);
  const [categoryData, setCategoryData] = React.useState<any[]>([]);
  const [rejectionData, setRejectionData] = React.useState<any[]>([]);

  const onPieEnter = React.useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );

  // ✅ Fetch all analytics data
  React.useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      try {
        const [engagementRes, qualityRes, categoryRes, rejectionRes] =
          await Promise.all([
            axios.get(`${apiUrl}/api/analytics/innovator-engagement`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${apiUrl}/api/analytics/idea-quality-trend`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${apiUrl}/api/analytics/category-success`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${apiUrl}/api/analytics/rejection-reasons`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        setEngagementData(engagementRes.data.data || []);
        setQualityData(qualityRes.data.data || []);
        setCategoryData(categoryRes.data.data || []);
        setRejectionData(rejectionRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // ✅ Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3">
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Innovator Engagement */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Innovator Engagement</CardTitle>
            <CardDescription>Invited vs. Active Innovators</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="min-h-[200px] w-full">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={ActiveShape}
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Idea Quality Over Time */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Idea Quality Over Time</CardTitle>
            <CardDescription>
              Average validation score per month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={qualityData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorQuality"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        contentStyle={{
                          background: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                        }}
                        labelClassName="font-bold"
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="quality"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    fill="url(#colorQuality)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Category-wise Success */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Category-wise Success Rate</CardTitle>
            <CardDescription>
              Breakdown of idea outcomes by domain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={categoryData}
                  stackOffset="expand"
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        contentStyle={{
                          background: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                        }}
                        labelClassName="font-bold"
                      />
                    }
                  />
                  <Bar
                    dataKey="approved"
                    fill="hsl(var(--color-approved))"
                    stackId="a"
                    radius={[5, 0, 0, 5]}
                  >
                    <LabelList
                      position="center"
                      className="fill-white font-bold"
                      valueAccessor={(props: any) =>
                        props.value > 0 ? props.value : ""
                      }
                    />
                  </Bar>
                  <Bar
                    dataKey="moderate"
                    fill="hsl(var(--color-moderate))"
                    stackId="a"
                  >
                    <LabelList
                      position="center"
                      className="fill-white font-bold"
                      valueAccessor={(props: any) =>
                        props.value > 0 ? props.value : ""
                      }
                    />
                  </Bar>
                  <Bar
                    dataKey="rejected"
                    fill="hsl(var(--color-rejected))"
                    stackId="a"
                    radius={[0, 5, 5, 0]}
                  >
                    <LabelList
                      position="center"
                      className="fill-white font-bold"
                      valueAccessor={(props: any) =>
                        props.value > 0 ? props.value : ""
                      }
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Rejection Reasons */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Rejected Idea Reasons</CardTitle>
            <CardDescription>
              Common reasons for idea rejection.
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
                      />
                    }
                  />
                  <Pie
                    data={rejectionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    labelLine={false}
                    label
                  >
                    {rejectionData.map((entry, index) => (
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
