
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MOCK_CONSULTATIONS, STATUS_COLORS } from '@/lib/data/platform';
import { MOCK_MENTORS } from '@/lib/data/auth';
import { MOCK_IDEAS } from '@/lib/data/ideas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ROLES } from '@/lib/constants';

type Consultation = typeof MOCK_CONSULTATIONS[0];

export default function MentorConsultationsPage() {
    const userMentor = MOCK_MENTORS[0]; 
    const router = useRouter();

    const getIdeaForConsultation = (ideaId: string) => MOCK_IDEAS.find(i => i.id === ideaId);

    // For mentors, we'll find consultations by checking the externalMentorId on the IDEA
    const myIdeas = MOCK_IDEAS.filter(idea => idea.externalMentorId === userMentor.id);
    const myConsultations = MOCK_CONSULTATIONS.filter(c => myIdeas.some(i => i.id === c.ideaId));

    const upcomingConsultations = myConsultations.filter(c => c.status === 'Scheduled');
    const pastConsultations = myConsultations.filter(c => c.status !== 'Scheduled');

    const handleViewIdea = (ideaId: string) => {
        router.push(`/dashboard/ideas/${ideaId}?role=${ROLES.MENTOR}`);
    };

    const ConsultationTable = ({ consultations }: { consultations: Consultation[] }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Idea Title</TableHead>
                    <TableHead>Innovator</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {consultations.length > 0 ? consultations.map((consultation) => {
                    const idea = getIdeaForConsultation(consultation.ideaId);
                    return (
                        <TableRow 
                            key={consultation.id} 
                            className="cursor-pointer" 
                            onClick={() => handleViewIdea(consultation.ideaId)}
                        >
                            <TableCell className="font-medium text-primary hover:underline">{consultation.title}</TableCell>
                            <TableCell>{idea?.innovatorName || 'N/A'}</TableCell>
                            <TableCell>{consultation.date} at {consultation.time}</TableCell>
                            <TableCell>
                                <Badge className={cn(STATUS_COLORS[consultation.status])}>{consultation.status}</Badge>
                            </TableCell>
                        </TableRow>
                    );
                }) : (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No consultations found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Consultations</CardTitle>
        <CardDescription>View and manage your consultation schedule.</CardDescription>
      </CardHeader>
      <CardContent>
          <Tabs defaultValue="upcoming">
              <TabsList>
                  <TabsTrigger value="upcoming">Upcoming ({upcomingConsultations.length})</TabsTrigger>
                  <TabsTrigger value="past">History ({pastConsultations.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="mt-4">
                  <ConsultationTable consultations={upcomingConsultations} />
              </TabsContent>
              <TabsContent value="past" className="mt-4">
                  <ConsultationTable consultations={pastConsultations} />
              </TabsContent>
          </Tabs>
      </CardContent>
    </Card>
  );
}
