
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Award, BarChart3, CheckCircle2, Star, Target, TrendingDown, TrendingUp, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSearchParams } from 'next/navigation';

// Mock data - in a real app, this would be fetched based on the user's analysis results
const mockReportData = {
    overallProfile: 'Visionary Builder',
    overallScore: 82,
    strengths: [
        { dimension: 'Creativity & Innovation', score: 90, summary: 'Excellent at connecting disparate ideas and experimenting.' },
        { dimension: 'Motivational Drivers', score: 85, summary: 'Highly mission-driven with a strong internal locus of control.' },
        { dimension: 'Personality & Traits', score: 80, summary: 'Shows high proactivity and resilience in the face of challenges.' },
    ],
    areasForImprovement: [
        { dimension: 'Financial Discipline', score: 65, summary: 'Could benefit from more structured financial planning.' },
        { dimension: 'Execution Discipline', score: 60, summary: 'Tends to prioritize ideation over day-to-day execution tasks.' },
    ],
    essayAnalysis: {
        summary: "The founder's motivation appears to be deeply rooted in solving a personal problem they experienced, indicating strong intrinsic drive and user empathy. Key themes include a desire for autonomy and a passion for creating social impact.",
        keywords: ["Autonomy", "Social Impact", "Problem-Solving", "User Empathy"]
    },
    upskillingPlan: [
        {
            title: 'Mastering Financial Discipline',
            description: 'Focus on building systems for financial tracking and planning.',
            steps: [
                'Complete a basic online course on "Finance for Startups".',
                'Create a detailed 12-month financial projection for your primary idea.',
                'Track all personal and project-related expenses for one month.',
            ],
            resources: [{ name: 'Venture Deals by Brad Feld', href: '#' }]
        },
        {
            title: 'Enhancing Execution Discipline',
            description: 'Learn to translate great ideas into consistent daily action.',
            steps: [
                'Implement the OKR (Objectives and Key Results) framework for Q3.',
                'Use a project management tool (like Trello or Asana) to track all tasks.',
                'Time-block your calendar for the next 4 weeks, dedicating specific slots for deep work.',
            ],
            resources: [{ name: 'The 4 Disciplines of Execution by Chris McChesney', href: '#' }]
        },
    ]
};

export default function PsychometricReportPage() {
  const searchParams = useSearchParams();
  const resultsParam = searchParams.get('results');
  const results = resultsParam ? JSON.parse(resultsParam) : mockReportData;
  const score = results.score || mockReportData.overallScore;
  const level = results.level || (score >= 85 ? 'Founder-ready' : 'Promising');


  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
             <h1 className="text-3xl font-bold">Founder Psychometric Report</h1>
            <Button asChild variant="outline">
                <Link href="/dashboard/psychometric-analysis">Back to Analysis</Link>
            </Button>
        </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Executive Summary</CardTitle>
          <CardDescription>A high-level overview of your entrepreneurial profile.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6 text-center">
            <Card className="p-4">
                <Star className="mx-auto h-8 w-8 text-primary mb-2" />
                <p className="text-lg font-semibold">{mockReportData.overallProfile}</p>
                <p className="text-sm text-muted-foreground">Founder Archetype</p>
            </Card>
             <Card className="p-4">
                <Award className="mx-auto h-8 w-8 text-primary mb-2" />
                <p className="text-lg font-semibold">{score} / 100</p>
                <p className="text-sm text-muted-foreground">Overall Readiness Score</p>
            </Card>
             <Card className="p-4">
                <BarChart3 className="mx-auto h-8 w-8 text-primary mb-2" />
                <p className="text-lg font-semibold">{level}</p>
                <p className="text-sm text-muted-foreground">General Verdict</p>
            </Card>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="text-green-500"/> Key Strengths</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {mockReportData.strengths.map(item => (
                    <div key={item.dimension}>
                        <div className="flex justify-between items-center">
                            <p className="font-semibold">{item.dimension}</p>
                            <Badge variant="secondary" className="text-green-600">{item.score}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.summary}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingDown className="text-orange-500"/> Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {mockReportData.areasForImprovement.map(item => (
                    <div key={item.dimension}>
                        <div className="flex justify-between items-center">
                            <p className="font-semibold">{item.dimension}</p>
                             <Badge variant="secondary" className="text-orange-600">{item.score}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.summary}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bot className="text-primary"/> AI-Powered Essay Analysis</CardTitle>
            <CardDescription>An analysis of your long-form response about your motivations.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground italic">"{mockReportData.essayAnalysis.summary}"</p>
            <div className="flex flex-wrap gap-2 mt-4">
                {mockReportData.essayAnalysis.keywords.map(keyword => (
                    <Badge key={keyword} variant="secondary">{keyword}</Badge>
                ))}
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Personalized Upskilling Plan</CardTitle>
            <CardDescription>A tailored plan to help you address your key areas for improvement. Focus on one area at a time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {mockReportData.upskillingPlan.map((plan, index) => (
                <div key={plan.title}>
                    <h3 className="font-semibold text-lg">{plan.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    
                    <div className="space-y-3">
                        <h4 className="font-medium">Actionable Steps:</h4>
                        <ul className="space-y-2">
                        {plan.steps.map(step => (
                            <li key={step} className="flex items-start gap-3 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0"/>
                                <span>{step}</span>
                            </li>
                        ))}
                        </ul>
                    </div>

                    <div className="mt-4">
                        <h4 className="font-medium">Recommended Resources:</h4>
                         <div className="flex flex-wrap gap-2 mt-2">
                            {plan.resources.map(res => (
                                <Button key={res.name} variant="link" asChild className="p-0 h-auto">
                                    <a href={res.href} target="_blank" rel="noopener noreferrer">{res.name}</a>
                                </Button>
                            ))}
                        </div>
                    </div>
                    {index < mockReportData.upskillingPlan.length - 1 && <Separator className="mt-6" />}
                </div>
            ))}
        </CardContent>
      </Card>

    </div>
  );
}

    