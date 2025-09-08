
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_INNOVATOR_USER, MOCK_MENTORS } from '@/lib/data/auth';
import { MOCK_PSYCHOMETRIC_PROFILES } from '@/lib/data/reports';
import { ROLES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Shield } from 'lucide-react';
import Link from 'next/link';

export default function InnovatorPsychometricPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  
  // This would come from a real auth hook/context
  let user;
  let profile;
  
  if (role === ROLES.MENTOR) {
      user = MOCK_MENTORS[0];
      profile = user.hasPsychometricAnalysis ? MOCK_PSYCHOMETRIC_PROFILES[user.id] : null;
  } else {
      user = MOCK_INNOVATOR_USER;
      profile = user.hasPsychometricAnalysis ? MOCK_PSYCHOMETRIC_PROFILES[user.id] : null;
  }
  
  const isAccessDenied = role && ![ROLES.INNOVATOR, ROLES.MENTOR].includes(role as any);

  if (isAccessDenied) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is only available to innovators and mentors.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Psychometric Profile</CardTitle>
          <CardDescription>
            Understand your unique strengths and mindset as an innovator or mentor.
          </CardDescription>
        </CardHeader>
      </Card>
      
      {profile ? (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>Your Profile: {profile.profileType}</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Completed
                </Badge>
            </CardTitle>
            <CardDescription className="italic">"{profile.generalAnalysis}"</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Key Traits</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Risk Appetite:</span> <Badge variant="outline">{profile.riskAppetite}</Badge></p>
                  <p><span className="text-muted-foreground">Work Style:</span> <Badge variant="outline">{profile.workStyle}</Badge></p>
                  <p><span className="text-muted-foreground">Primary Motivation:</span> <Badge variant="outline">{profile.motivation}</Badge></p>
                </div>
              </div>
              <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Strengths & Growth Areas</h4>
                  <div className="text-sm">
                    <p className="font-medium text-green-600">Strengths:</p>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {profile.strengths.map(s => <li key={s}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-red-600">Areas for Growth:</p>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {profile.weaknesses.map(w => <li key={w}>{w}</li>)}
                    </ul>
                  </div>
              </div>
              <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Your Success Path</h4>
                  <p className="text-sm"><strong className="font-medium text-foreground">Ideal Domains:</strong> {profile.domainFit}</p>
                  <p className="text-sm"><strong className="font-medium text-foreground">Potential Expertise Fit:</strong> {profile.expertiseFit}</p>
                  <p className="text-sm"><strong className="font-medium text-foreground">Key Success Factors:</strong> {profile.successFactors}</p>
              </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-primary">
          <CardHeader className="text-center">
            <CardTitle>Unlock Your Innovator/Mentor Profile</CardTitle>
            <CardDescription>
              Take our quick psychometric assessment to discover your unique strengths, work style, and potential.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground max-w-md">This analysis helps you understand your natural tendencies and provides insights to help you succeed on your journey.</p>
            <Button asChild>
              <Link href={`/dashboard/psychometric-analysis/assessment?role=${role || ROLES.INNOVATOR}`}>
                Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/50">
        <CardHeader className="flex flex-row items-center gap-3">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">Your Data is Private</CardTitle>
            <CardDescription className="text-xs">
              Your detailed psychometric responses are confidential. Only you and authorized administrators can view this summary.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
