
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MOCK_MENTORS } from "@/lib/data/auth";
import { MOCK_INNOVATORS } from "@/lib/data/organization";
import { ROLES } from '@/lib/constants';
import { MOCK_IDEAS } from '@/lib/data/ideas';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lightbulb, TrendingUp } from 'lucide-react';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

export default function MentorInnovatorsPage() {
    const userMentor = MOCK_MENTORS[0]; 
    const router = useRouter();

    const assignedInnovators = MOCK_INNOVATORS.filter(innovator => 
        MOCK_IDEAS.some(idea => idea.externalMentorId === userMentor.id && idea.innovatorId === innovator.id)
    );
    
    const getInnovatorStats = (innovatorId: string) => {
        const innovatorIdeas = MOCK_IDEAS.filter(idea => idea.innovatorId === innovatorId && idea.externalMentorId === userMentor.id && idea.report);
        const ideaCount = innovatorIdeas.length;
        const avgScore = ideaCount > 0 
            ? innovatorIdeas.reduce((sum, idea) => sum + idea.report!.overallScore, 0) / ideaCount 
            : 0;
        return { ideaCount, avgScore };
    }

    const handleRowClick = (innovatorId: string) => {
        router.push(`/dashboard/mentor/innovators/${innovatorId}?role=${ROLES.MENTOR}`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Innovators</CardTitle>
                <CardDescription>A list of all innovators you are currently mentoring.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Innovator</TableHead>
                            <TableHead>Institution</TableHead>
                            <TableHead>Ideas Mentored</TableHead>
                            <TableHead>Average Score</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignedInnovators.length > 0 ? (
                            assignedInnovators.map((innovator) => {
                                const { ideaCount, avgScore } = getInnovatorStats(innovator.id);
                                return (
                                    <TableRow key={innovator.id} className="cursor-pointer" onClick={() => handleRowClick(innovator.id)}>
                                        <TableCell className="font-medium flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://avatar.vercel.sh/${innovator.name}.png`} alt={innovator.name} />
                                                <AvatarFallback>{getInitials(innovator.name)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-primary hover:underline">{innovator.name}</span>
                                        </TableCell>
                                        <TableCell>{innovator.collegeId}</TableCell> {/* Replace with collegeName if available */}
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Lightbulb className="h-4 w-4 text-muted-foreground" />
                                                {ideaCount}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                                {avgScore.toFixed(1)}
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge variant={innovator.status === 'Active' ? 'default' : 'destructive'}>{innovator.status}</Badge></TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No innovators assigned yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
