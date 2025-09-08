
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MOCK_IDEAS } from '@/lib/data/ideas';
import { MOCK_INNOVATOR_USER } from '@/lib/data/auth';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart } from "recharts";
import { SpiderChart } from '@/components/spider-chart';

const chartConfig = {
  score: {
    label: 'Score',
    color: 'hsl(var(--chart-1))',
  },
};

export default function InnovatorAnalyticsPage() {
    const ideas = MOCK_IDEAS.filter(idea => idea.innovatorEmail === MOCK_INNOVATOR_USER.email);
    const validatedIdeas = ideas.filter(idea => idea.report?.overallScore);
    const totalIdeas = ideas.length;
    const approvedCount = ideas.filter(idea => (idea.report?.validationOutcome || idea.status) === 'Approved').length;

    const averageScore = validatedIdeas.length > 0
        ? validatedIdeas.reduce((sum, idea) => sum + idea.report!.overallScore, 0) / validatedIdeas.length
        : 0;

    const approvalRate = totalIdeas > 0 ? (approvedCount / totalIdeas) * 100 : 0;

    const scoreOverTimeData = validatedIdeas.map(idea => ({
        date: idea.dateSubmitted,
        score: idea.report!.overallScore,
        name: idea.title,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    // Aggregate cluster scores
    const clusterScores: Record<string, number[]> = {};
    validatedIdeas.forEach(idea => {
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
        acc[key] = (avg / 100) * 100;
        return acc;
    }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Performance Analytics</CardTitle>
          <CardDescription>Track your progress and identify areas for growth.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardHeader><CardTitle>Total Ideas</CardTitle></CardHeader>
            <CardContent><p className="text-4xl font-bold">{totalIdeas}</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Average Score</CardTitle></CardHeader>
            <CardContent><p className="text-4xl font-bold text-primary">{averageScore.toFixed(1)}</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Approval Rate</CardTitle></CardHeader>
            <CardContent><p className="text-4xl font-bold text-green-500">{approvalRate.toFixed(1)}%</p></CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Over Time</CardTitle>
            <CardDescription>How your idea scores have trended with each submission.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreOverTimeData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                        content={<ChartTooltipContent 
                            contentStyle={{background: "hsl(var(--background))", border: "1px solid hsl(var(--border))"}}
                            labelClassName="font-bold"
                            formatter={(value, name, props) => {
                                return [`${(value as number).toFixed(1)} - ${props.payload.name}`, 'Score']
                            }}
                        />}
                    />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cluster Performance</CardTitle>
            <CardDescription>Your average performance across all evaluation clusters.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <SpiderChart data={avgClusterScores} maxScore={100} size={300}/>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
