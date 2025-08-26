
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MOCK_INNOVATORS, MOCK_PSYCHOMETRIC_PROFILES } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';

export default function InnovatorInsightsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredInnovators = MOCK_INNOVATORS.filter(innovator => 
      innovator.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      innovator.hasPsychometricAnalysis
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Innovator Insights</CardTitle>
          <CardDescription>
            View psychometric and background analysis for innovators across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input 
            placeholder="Search by innovator name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>
      
      {filteredInnovators.map(innovator => {
        const profile = MOCK_PSYCHOMETRIC_PROFILES[innovator.id];
        if (!profile) return null;

        return (
          <Card key={innovator.id}>
            <CardHeader>
              <CardTitle>{innovator.name}</CardTitle>
              <CardDescription>{innovator.email} - {profile.profileType}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Key Traits</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Risk Appetite:</span> <Badge variant="secondary">{profile.riskAppetite}</Badge></p>
                    <p><span className="text-muted-foreground">Work Style:</span> <Badge variant="secondary">{profile.workStyle}</Badge></p>
                    <p><span className="text-muted-foreground">Motivation:</span> <Badge variant="secondary">{profile.motivation}</Badge></p>
                  </div>
                </div>
                <div className="space-y-4">
                   <h4 className="font-semibold">Strengths & Weaknesses</h4>
                   <div className="text-sm">
                     <p className="font-medium text-green-600">Strengths:</p>
                     <ul className="list-disc list-inside text-muted-foreground">
                        {profile.strengths.map(s => <li key={s}>{s}</li>)}
                     </ul>
                   </div>
                    <div className="text-sm">
                     <p className="font-medium text-red-600">Weaknesses:</p>
                     <ul className="list-disc list-inside text-muted-foreground">
                        {profile.weaknesses.map(w => <li key={w}>{w}</li>)}
                     </ul>
                   </div>
                </div>
                 <div className="space-y-4">
                   <h4 className="font-semibold">AI-Generated Insights</h4>
                    <p className="text-sm text-muted-foreground italic">"{profile.generalAnalysis}"</p>
                    <p className="text-sm"><span className="font-medium">Ideal Domains:</span> {profile.domainFit}</p>
                    <p className="text-sm"><span className="font-medium">Success Factors:</span> {profile.successFactors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {filteredInnovators.length === 0 && (
        <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
                <p>No innovators with analysis data match your search.</p>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
