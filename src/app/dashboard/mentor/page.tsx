
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MOCK_MENTORS } from "@/lib/data/auth";
import { MOCK_IDEAS } from '@/lib/data/ideas';
import { STATUS_COLORS } from '@/lib/data/platform';
import { Lightbulb, MessageSquare, CheckCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { ROLES } from "@/lib/constants";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MOCK_INNOVATORS } from "@/lib/data/organization";


export default function MentorDashboardPage() {
    const userMentor = MOCK_MENTORS[0]; 
    const router = useRouter();

    const assignedIdeas = MOCK_IDEAS.filter(idea => idea.externalMentorId === userMentor.id);
    const assignedInnovators = MOCK_INNOVATORS.filter(innovator => 
        assignedIdeas.some(idea => idea.innovatorId === innovator.id)
    );

    const completedConsultations = 0; // Mock data
    const upcomingConsultations = 1; // Mock data


    return (
        <div className="flex flex-col gap-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/mentor/innovators?role=${ROLES.MENTOR}`)}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Assigned Innovators</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{assignedInnovators.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Assigned Ideas</CardTitle>
                        <Lightbulb className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{assignedIdeas.length}</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/mentor/consultations?role=${ROLES.MENTOR}`)}>
                     <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Consultations</CardTitle>
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{upcomingConsultations}</p>
                    </CardContent>
                </Card>
                 <Card>
                     <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Completed Consultations</CardTitle>
                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{completedConsultations}</p>
                    </CardContent>
                 </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>My Assigned Ideas</CardTitle>
                    <CardDescription>A list of high-potential ideas assigned to you for mentorship.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Idea Title</TableHead>
                                <TableHead>Innovator</TableHead>
                                <TableHead>Institution</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignedIdeas.length > 0 ? assignedIdeas.map(idea => (
                                <TableRow key={idea.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/ideas/${idea.id}?role=${ROLES.MENTOR}`)}>
                                    <TableCell className="font-medium text-primary hover:underline">{idea.title}</TableCell>
                                    <TableCell>{idea.innovatorName}</TableCell>
                                    <TableCell>{idea.collegeName}</TableCell>
                                    <TableCell>{idea.report?.overallScore.toFixed(1)}</TableCell>
                                    <TableCell><Badge className={cn(STATUS_COLORS[idea.status])}>{idea.status}</Badge></TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No ideas have been assigned to you yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">
                        You are assigned ideas that score 85 or above in their initial validation.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
