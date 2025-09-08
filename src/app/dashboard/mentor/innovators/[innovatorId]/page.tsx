
'use client';

import * as React from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, School, CreditCard, MessageSquare } from 'lucide-react';
import { MOCK_INNOVATORS, MOCK_COLLEGES } from '@/lib/data/organization';
import { MOCK_IDEAS } from '@/lib/data/ideas';
import { STATUS_COLORS, MOCK_CONSULTATIONS } from '@/lib/data/platform';
import { ROLES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { ValidationReport } from '@/ai/schemas';
import { MOCK_MENTORS } from '@/lib/data/auth';

export default function MentorInnovatorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const innovatorId = params.innovatorId as string;
    const role = searchParams.get('role') || ROLES.MENTOR;
    const userMentor = MOCK_MENTORS[0]; 

    const innovator = MOCK_INNOVATORS.find(inv => inv.id === innovatorId);
    const innovatorIdeas = MOCK_IDEAS.filter(idea => idea.innovatorId === innovatorId && idea.externalMentorId === userMentor.id);
    const college = MOCK_COLLEGES.find(c => c.id === innovator?.collegeId);
    const consultationHistory = MOCK_CONSULTATIONS.filter(c => c.ideaId && innovatorIdeas.some(i => i.id === c.ideaId));

    if (!innovator) {
        return <p>Innovator not found.</p>;
    }
    
    const getOverallScore = (idea: (typeof MOCK_IDEAS)[0]) => {
     if (idea.report) {
      return idea.report.overallScore.toFixed(1);
    }
    return 'N/A';
    };
  
    const getStatus = (idea: (typeof MOCK_IDEAS)[0]) => {
        return idea.report?.validationOutcome || idea.status;
    }

    return (
        <div className="space-y-6">
            <Button variant="outline" asChild>
                <Link href={`/dashboard/mentor/innovators?role=${role}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to My Innovators
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center justify-between">
                        <span>{innovator.name}</span>
                        <Badge className={cn(STATUS_COLORS[innovator.status])}>{innovator.status}</Badge>
                    </CardTitle>
                    <CardDescription>Innovator Profile</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{innovator.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <School className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{college?.name || innovator.collegeId}</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{innovator.credits} Credits</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mentored Ideas</CardTitle>
                    <CardDescription>A list of all ideas you are mentoring for {innovator.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Date Submitted</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {innovatorIdeas.length > 0 ? (
                                innovatorIdeas.map(idea => (
                                    <TableRow key={idea.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/ideas/${idea.id}?role=${role}`)}>
                                        <TableCell>{idea.id}</TableCell>
                                        <TableCell>{idea.title}</TableCell>
                                        <TableCell>{idea.dateSubmitted}</TableCell>
                                        <TableCell>
                                            <Badge className={cn(STATUS_COLORS[getStatus(idea)])}>
                                                {getStatus(idea)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{getOverallScore(idea)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="link" size="sm" asChild>
                                                <Link href={`/dashboard/ideas/${idea.id}?role=${role}`}>
                                                    View Report
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No ideas mentored for this innovator.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Consultation History</CardTitle>
                    <CardDescription>A log of all consultations with {innovator.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Idea</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {consultationHistory.length > 0 ? (
                                consultationHistory.map(consultation => (
                                    <TableRow key={consultation.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/mentor/consultations?role=${role}`)}>
                                        <TableCell>{consultation.title}</TableCell>
                                        <TableCell>{consultation.date}</TableCell>
                                        <TableCell>
                                            <Badge className={cn(STATUS_COLORS[consultation.status])}>
                                                {consultation.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">No consultation history.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
