
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_COLLEGES, MOCK_INNOVATORS, MOCK_TTCS } from '@/lib/data/organization';
import { MOCK_IDEAS } from '@/lib/data/ideas';
import { MOCK_PLANS } from '@/lib/data/platform';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Pie, PieChart, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  const totalColleges = MOCK_COLLEGES.length;
  const totalIdeas = MOCK_IDEAS.length;
  const totalTTCs = MOCK_TTCS.length;
  const totalInnovators = MOCK_INNOVATORS.length;

  const revenueByPlan = MOCK_COLLEGES.reduce((acc, college) => {
      const plan = MOCK_PLANS.find(p => p.id === college.currentPlanId);
      if (plan && plan.enabled) {
          const planName = plan.name.replace(/ Monthly| Yearly/, '');
          acc[planName] = (acc[planName] || 0) + plan.totalAmount;
      }
      return acc;
  }, {} as Record<string, number>);
  const revenueChartData = Object.entries(revenueByPlan).map(([name, revenue]) => ({ name, revenue }));

  const ideaStatusCounts = MOCK_IDEAS.reduce((acc, idea) => {
    const status = idea.report?.validationOutcome || idea.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ideaStatusData = [
    { name: 'Slay', value: ideaStatusCounts['Slay'] || ideaStatusCounts['Approved'] || 0, fill: 'hsl(var(--color-approved))' },
    { name: 'Mid', value: ideaStatusCounts['Mid'] || ideaStatusCounts['Moderate'] || 0, fill: 'hsl(var(--color-moderate))' },
    { name: 'Flop', value: ideaStatusCounts['Flop'] || ideaStatusCounts['Rejected'] || 0, fill: 'hsl(var(--color-rejected))' },
  ];

  const collegePerformance = MOCK_COLLEGES.map(college => {
    const collegeIdeas = MOCK_IDEAS.filter(idea => idea.collegeId === college.id);
    const approved = collegeIdeas.filter(i => (i.report?.validationOutcome || i.status) === 'Approved' || (i.report?.validationOutcome || i.status) === 'Slay').length;
    const approvalRate = collegeIdeas.length > 0 ? ((approved / collegeIdeas.length) * 100) : 0;
    return {
        name: college.name,
        ideas: collegeIdeas.length,
        approvalRate: approvalRate,
    };
  }).sort((a, b) => b.ideas - a.ideas);


  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Platform Dashboard</CardTitle>
          <CardDescription>A high-level overview of the entire PragatiAI ecosystem.</CardDescription>
        </CardHeader>
      </Card>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Colleges</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{totalColleges}</p></CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total TTCs</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{totalTTCs}</p></CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Innovators</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{totalInnovators}</p></CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Ideas</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{totalIdeas}</p></CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Platform-wide Idea Status</CardTitle>
                <CardDescription>Distribution of all ideas submitted across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ideaStatusData} layout="vertical" margin={{ left: 10, right: 10 }}>
                        <CartesianGrid horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={80} />
                        <Tooltip
                            cursor={true}
                            content={<ChartTooltipContent
                                contentStyle={{background: "hsl(var(--background))", border: "1px solid hsl(var(--border))"}}
                                labelClassName="font-bold"
                                formatter={(value) => [`${value} Ideas`, '']}
                            />}
                        />
                        <Bar dataKey="value" radius={5}>
                            {ideaStatusData.map((entry, index) => (
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
                    <CardDescription>Estimated revenue from active plans.</CardDescription>
                </CardHeader>
                <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip
                            cursor={true}
                            content={<ChartTooltipContent
                                contentStyle={{background: "hsl(var(--background))", border: "1px solid hsl(var(--border))"}}
                                labelClassName="font-bold"
                                formatter={(value) => [`₹${(value as number).toLocaleString()}`, '']}
                            />}
                        />
                        <Pie data={revenueChartData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} label>
                            {revenueChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
            <CardTitle>Top Performing Institutions</CardTitle>
            <CardDescription>Ranked by total number of ideas submitted.</CardDescription>
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
                        {collegePerformance.map((college, index) => (
                            <TableRow key={college.name}>
                                <TableCell className="font-bold">{index + 1}</TableCell>
                                <TableCell>{college.name}</TableCell>
                                <TableCell>{college.ideas}</TableCell>
                                <TableCell><Badge variant="secondary">{college.approvalRate.toFixed(1)}%</Badge></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
