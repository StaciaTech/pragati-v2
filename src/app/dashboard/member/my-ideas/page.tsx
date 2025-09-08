
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MOCK_IDEAS } from '@/lib/data/ideas';
import { MOCK_TEAM_MEMBER_USERS } from '@/lib/data/auth';
import { ROLES } from '@/lib/constants';
import { STATUS_COLORS } from '@/lib/data/platform';

type Idea = (typeof MOCK_IDEAS)[0];

export default function MyIdeasPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const user = MOCK_TEAM_MEMBER_USERS[0]; // mock

    // For this mock, we'll hardcode the ideas the member is a part of
    const myIdeas = MOCK_IDEAS.filter(idea => idea.id === 'IDEA-001' || idea.id === 'IDEA-003');

    const getStatus = (idea: Idea) => {
        return idea.report?.validationOutcome || idea.status;
    };
    
    const getOverallScore = (idea: Idea) => {
        if (idea.report) {
         return idea.report.overallScore.toFixed(1);
        }
        return 'N/A';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Ideas</CardTitle>
                <CardDescription>A list of all ideas you are collaborating on.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Primary Innovator</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {myIdeas.length > 0 ? (
                            myIdeas.map(idea => (
                                <TableRow key={idea.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/ideas/${idea.id}?role=${role}`)}>
                                    <TableCell className="font-medium">{idea.title}</TableCell>
                                    <TableCell>{idea.innovatorName}</TableCell>
                                    <TableCell>
                                        <Badge className={STATUS_COLORS[getStatus(idea)]}>{getStatus(idea)}</Badge>
                                    </TableCell>
                                    <TableCell>{getOverallScore(idea)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="link" size="sm">
                                            <Link href={`/dashboard/ideas/${idea.id}?role=${role}`}>View Report</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    You have not been added to any ideas yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
