"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Mail,
  School,
  CreditCard,
  MessageSquare,
  StickyNote,
} from "lucide-react";
import { MOCK_INNOVATORS, MOCK_COLLEGES } from "@/lib/data/organization";
import { MOCK_IDEAS } from "@/lib/data/ideas";
import { STATUS_COLORS, MOCK_CONSULTATIONS } from "@/lib/data/platform";
import { ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ValidationReport } from "@/ai/schemas";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function InnovatorDetailPage() {
  // const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const innovatorId = searchParams.get("id") || "";
  const role = searchParams.get("role") || ROLES.COORDINATOR;

  const innovator = MOCK_INNOVATORS.find((inv) => inv.id === innovatorId);
  const innovatorIdeas = MOCK_IDEAS.filter(
    (idea) => idea.innovatorEmail === innovator?.email,
  );
  const college = MOCK_COLLEGES.find((c) => c.id === innovator?.collegeId);
  const consultationHistory = MOCK_CONSULTATIONS.filter(
    (c) => c.ideaId && innovatorIdeas.some((i) => i.id === c.ideaId),
  );

  if (!innovator) {
    return <p>Innovator not found.</p>;
  }

  const getOverallScore = (idea: (typeof MOCK_IDEAS)[0]) => {
    if (idea.report) {
      return idea.report.overallScore.toFixed(1);
    }
    return "N/A";
  };

  const getStatus = (idea: (typeof MOCK_IDEAS)[0]) => {
    return idea.report?.validationOutcome || idea.status;
  };

  const handleSaveNote = () => {
    toast({
      title: "Note Saved",
      description: "Your internal note for this innovator has been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link href={`/dashboard/coordinator/innovator-management?role=${role}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Innovator Management
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center justify-between">
            <span>{innovator.name}</span>
            <Badge className={cn(STATUS_COLORS[innovator.status])}>
              {innovator.status}
            </Badge>
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
              <span className="text-muted-foreground">{college?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {innovator.credits} Credits
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Ideas</CardTitle>
              <CardDescription>
                A list of all ideas submitted by {innovator.name}.
              </CardDescription>
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
                    innovatorIdeas.map((idea) => (
                      <TableRow
                        key={idea.id}
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/dashboard/ideas/details?id=${idea.id}&role=${role}`,
                          )
                        }
                      >
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
                            <Link
                              href={`/dashboard/ideas/details?id=${idea.id}&role=${role}`}
                            >
                              View Report
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No ideas submitted yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consultation History</CardTitle>
              <CardDescription>
                A log of all consultations requested by {innovator.name}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Idea</TableHead>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultationHistory.length > 0 ? (
                    consultationHistory.map((consultation) => (
                      <TableRow
                        key={consultation.id}
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/dashboard/coordinator/consultations?role=${role}`,
                          )
                        }
                      >
                        <TableCell>{consultation.title}</TableCell>
                        <TableCell>{consultation.mentor}</TableCell>
                        <TableCell>{consultation.date}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(STATUS_COLORS[consultation.status])}
                          >
                            {consultation.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No consultation history.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" /> Internal Notes
              </CardTitle>
              <CardDescription>
                Private notes about this innovator. Only visible to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Strong technical skills but needs coaching on presentation. Follow up on market research."
                rows={10}
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNote}>Save Note</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
