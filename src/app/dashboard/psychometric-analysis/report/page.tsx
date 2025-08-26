
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Award, BarChart3, CheckCircle2, Star, Target, TrendingDown, TrendingUp, Bot, BrainCircuit, HeartPulse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSearchParams } from 'next/navigation';

// Mock data for when results are not in params
const mockReportData = {
    score: 82,
    level: 'Promising',
    domainScores: {
      entrepreneurial_potential: 85,
      psychological_resilience: 78,
    }
};

export default function PsychometricReportPage() {
  const searchParams = useSearchParams();
  const resultsParam = searchParams.get('results');
  
  let results;
  try {
    results = resultsParam ? JSON.parse(resultsParam) : mockReportData;
  } catch (e) {
    results = mockReportData;
  }

  const { score, level, domainScores } = results;

  const getScoreColor = (value: number) => {
    if (value >= 85) return 'text-green-600';
    if (value >= 65) return 'text-orange-500';
    return 'text-red-500';
  }

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
        <CardContent className="grid md:grid-cols-2 gap-6 text-center">
            <Card className="p-4">
                <Award className="mx-auto h-8 w-8 text-primary mb-2" />
                <p className="text-3xl font-bold">{score.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Overall Readiness Score</p>
            </Card>
             <Card className="p-4">
                <BarChart3 className="mx-auto h-8 w-8 text-primary mb-2" />
                <p className={cn("text-3xl font-bold", getScoreColor(score))}>{level}</p>
                <p className="text-sm text-muted-foreground">General Verdict</p>
            </Card>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bot className="text-primary"/> Domain Analysis</CardTitle>
            <CardDescription>A breakdown of your scores in key entrepreneurial areas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {domainScores && Object.entries(domainScores).map(([domainId, domainScore]) => (
                 <div key={domainId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {domainId === 'entrepreneurial_potential' && <BrainCircuit className="h-6 w-6 text-muted-foreground" />}
                      {domainId === 'psychological_resilience' && <HeartPulse className="h-6 w-6 text-muted-foreground" />}
                      <span className="font-semibold capitalize">{(domainId as string).replace(/_/g, ' ')}</span>
                    </div>
                    <Badge variant="outline" className={cn("text-lg", getScoreColor(domainScore as number))}>{(domainScore as number).toFixed(0)}</Badge>
                 </div>
               ))}
             </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Personalized Upskilling Plan</CardTitle>
            <CardDescription>A tailored plan to help you address your key areas for improvement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div key="next-steps">
                <h3 className="font-semibold text-lg">Focus on a Balanced Profile</h3>
                <p className="text-sm text-muted-foreground mb-4">Your scores indicate a strong foundation. The next step is to ensure both your entrepreneurial drive and your psychological resilience are well-developed.</p>
                
                <div className="space-y-3">
                    <h4 className="font-medium">Actionable Steps:</h4>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-3 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0"/>
                            <span>Review your open-text answers to identify recurring themes in how you approach problems and stress.</span>
                        </li>
                         <li className="flex items-start gap-3 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0"/>
                            <span>Seek feedback from a mentor on areas where your resilience could be tested in a startup journey.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
