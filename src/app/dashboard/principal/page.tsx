

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { SpiderChart } from '@/components/spider-chart';
import { MOCK_COLLEGES, MOCK_INNOVATORS, MOCK_TTCS } from '@/lib/data/organization';
import { MOCK_IDEAS } from '@/lib/data/ideas';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

const chartConfig = {
  ideas: {
    label: 'Ideas',
    color: 'hsl(var(--chart-1))',
  },
  score: {
    label: 'Score',
    color: 'hsl(var(--chart-2))',
  },
};

export default function PrincipalDashboardPage() {
    const college = MOCK_COLLEGES[0];
    const ttcs = MOCK_TTCS.filter(t => t.collegeId === college.id);
    const ideas = MOCK_IDEAS.filter(i => i.collegeId === college.id);
    const totalCredits = 150; // Assuming this is the total allocated

    const statusCounts = ideas.reduce((acc, idea) => {
        const status = idea.report?.validationOutcome || idea.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const statusData = [
        { name: 'Approved', value: statusCounts.Approved || 0, fill: 'hsl(var(--color-approved))' },
        { name: 'Moderate', value: statusCounts.Moderate || 0, fill: 'hsl(var(--color-moderate))' },
        { name: 'Rejected', value: statusCounts.Rejected || 0, fill: 'hsl(var(--color-rejected))' },
    ];
    
    const submissionTrendData = ideas.reduce((acc, idea) => {
      const month = new Date(idea.dateSubmitted).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const trendChartData = Object.entries(submissionTrendData).map(([name, ideas]) => ({ name, ideas }));

    const topInnovators = MOCK_INNOVATORS
        .filter(innovator => innovator.collegeId === college.id)
        .map(innovator => {
            const innovatorIdeas = MOCK_IDEAS.filter(i => i.innovatorEmail === innovator.email && i.report?.overallScore);
            const ideasCount = innovatorIdeas.length;
            if (ideasCount === 0) return null;
            const avgScore = innovatorIdeas.reduce((sum, i) => sum + i.report!.overallScore, 0) / ideasCount;
            return {
                name: innovator.name,
                score: avgScore,
            };
        })
        .filter(Boolean)
        .sort((a,b) => b!.score - a!.score)
        .slice(0, 5) as { name: string, score: number }[];

    const clusterScores: Record<string, number[]> = {};
    ideas.forEach(idea => {
        if (idea.report) {
            Object.entries(idea.report.sections.detailedEvaluation.clusters).forEach(([clusterName, clusterData]) => {
                if (!clusterScores[clusterName]) clusterScores[clusterName] = [];
                Object.values(clusterData).forEach((paramData: any) => {
                    Object.values(paramData).forEach((subParamData: any) => {
                        clusterScores[clusterName].push(subParamData.assignedScore);
                    });
                });
            });
        }
    });

    const avgClusterScores = Object.entries(clusterScores).reduce((acc, [key, scores]) => {
        const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        acc[key] = (avg / 100) * 100; // Keep it on a 1-100 scale
        return acc;
    }, {} as Record<string, number>);

    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Current Plan</CardTitle></CardHeader>
                        <CardContent><p className="text-xl font-bold">{MOCK_COLLEGES[0].currentPlanId.replace('PLAN00', 'Plan ').replace('-M', ' Monthly').replace('-Y', ' Yearly')}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Credits (Used / Total)</CardTitle></CardHeader>
                        <CardContent><p className="text-xl font-bold">{totalCredits - college.creditsAvailable} / {college.creditsAvailable}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-sm">TTC Slots (Used / Total)</CardTitle></CardHeader>
                        <CardContent><p className="text-xl font-bold">{ttcs.length} / {college.ttcLimit}</p></CardContent>
                    </Card>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Idea Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Tooltip
                                      cursor={true}
                                      content={<ChartTooltipContent 
                                        contentStyle={{background: "hsl(var(--background))", border: "1px solid hsl(var(--border))"}}
                                        labelClassName="font-bold"
                                        formatter={(value, name) => [`${value} Ideas`, name]}
                                      />}
                                    />
                                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = 25 + innerRadius + (outerRadius - innerRadius);
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                        if (value === 0) return null;
                                        return <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">{`${statusData[index].name} (${value})`}</text>;
                                    }}>
                                        {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                     <CardHeader>
                        <CardTitle>Top Performing Innovators</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <ChartContainer config={chartConfig} className="h-[250px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topInnovators} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <CartesianGrid horizontal={false} />
                                <XAxis type="number" domain={[0,100]} hide />
                                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={80} />
                                <Tooltip
                                    cursor={true}
                                    content={<ChartTooltipContent
                                        contentStyle={{background: "hsl(var(--background))", border: "1px solid hsl(var(--border))"}}
                                        labelClassName="font-bold"
                                        formatter={(value) => [`${(value as number).toFixed(2)} Avg Score`, '']}
                                    />}
                                />
                                <Bar dataKey="score" fill="hsl(var(--chart-1))" radius={5} background={{ fill: 'hsl(var(--muted)/0.5)', radius: 5 }} />
                            </BarChart>
                        </ResponsiveContainer>
                       </ChartContainer>
                    </CardContent>
                </Card>
             </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Submission Trend</CardTitle>
                    </CardHeader>
                     <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIdeas" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip
                                        content={<ChartTooltipContent
                                            contentStyle={{background: "hsl(var(--background))", border: "1px solid hsl(var(--border))"}}
                                            labelClassName="font-bold"
                                        />}
                                    />
                                    <Line type="monotone" dataKey="ideas" stroke="hsl(var(--chart-1))" strokeWidth={2} fillOpacity={1} fill="url(#colorIdeas)" />
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
                        <SpiderChart data={avgClusterScores} maxScore={100} size={300} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
