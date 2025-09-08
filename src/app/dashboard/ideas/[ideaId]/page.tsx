
'use client';

import * as React from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MOCK_IDEAS } from '@/lib/data/ideas';
import { MOCK_CONSULTATIONS, STATUS_COLORS } from '@/lib/data/platform';
import { MOCK_INNOVATORS, MOCK_TTCS } from '@/lib/data/organization';
import { MOCK_PSYCHOMETRIC_PROFILES } from '@/lib/data/reports';
import type { ValidationReport } from '@/ai/schemas';
import { ROLES, ROADMAP_PHASES } from '@/lib/constants';
import { ArrowLeft, Download, ThumbsUp, Lightbulb, RefreshCw, MessageSquare, TrendingUp, TrendingDown, Star, Share2, Copy, CalendarIcon, ChevronRight, CheckCircle2, UserCheck, Shield, User, Mail, Briefcase, Users, Phone, Target, TrendingDownIcon, Bot, Clock, PlusCircle, Trash2, Send, FileText, ChevronLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SpiderChart } from '@/components/spider-chart';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { FacebookIcon, LinkedInIcon, TwitterIcon, WhatsAppIcon, MailIcon } from '@/components/social-icons';
import { ScoreDisplay } from '@/components/score-display';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Roadmap } from '@/components/roadmap';


const getBackLink = (role: string | null) => {
    switch (role) {
        case ROLES.SUPER_ADMIN:
            return `/dashboard/admin/ideas?role=${role}`;
        case ROLES.COORDINATOR:
            return `/dashboard/coordinator/feedback?role=${role}`;
        default:
            return `/dashboard/ideas?role=${ROLES.INNOVATOR}`;
    }
}

type ParameterSummary = {
  avgScore: number;
  strongestPoint: string;
  improvementPoint: string;
};

type ReportMetrics = {
  topPerformers: { name: string; score: number; clusterName: string; paramName: string }[];
  bottomPerformers: { name: string; score: number; clusterName: string; paramName: string }[];
  avgClusterScores: Record<string, number>;
  parameterSummaries: Record<string, Record<string, ParameterSummary>>;
};

type MemberStatus = 'active' | 'pending' | 'accepted' | 'declined';
type TeamMember = (typeof MOCK_INNOVATORS)[0] & { status: MemberStatus };
type Mentor = (typeof MOCK_TTCS)[0] & { status: MemberStatus };


export default function IdeaReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const ideaId = params.ideaId as string;
  const { toast } = useToast();
  const reportRef = React.useRef<HTMLDivElement>(null);
  const spiderChartRef = React.useRef<HTMLDivElement>(null);

  const [isRequestConsultationOpen, setIsRequestConsultationOpen] = React.useState(false);
  const [isScheduleConsultationOpen, setIsScheduleConsultationOpen] = React.useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const [isMomDialogOpen, setIsMomDialogOpen] = React.useState(false);
  const [selectedConsultationForMom, setSelectedConsultationForMom] = React.useState<(typeof MOCK_CONSULTATIONS)[0] | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  
  const role = searchParams.get('role') as ROLES;
  const idea = MOCK_IDEAS.find((i) => i.id === ideaId);
  const report = idea?.report as ValidationReport | null;
  
  const innovatorProfile = idea ? MOCK_PSYCHOMETRIC_PROFILES[idea.innovatorId] : null;
  
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>(() => 
    MOCK_INNOVATORS.filter(inv => inv.id === idea?.innovatorId).map(inv => ({...inv, status: 'active'}))
  );
  
  const [mentors, setMentors] = React.useState<Mentor[]>(() => 
    idea?.ttcAssigned ? MOCK_TTCS.filter(ttc => ttc.id === idea.ttcAssigned).map(ttc => ({...ttc, status: 'active'})) : []
  );
  
  const externalMentor = idea?.externalMentorId ? MOCK_INNOVATORS.find(inv => inv.id === idea.externalMentorId) : null;


  const [openAccordionItems, setOpenAccordionItems] = React.useState<string[]>([]);
  const allClusterNames = report ? Object.keys(report.sections.detailedEvaluation.clusters) : [];
  const [activeActionPoint, setActiveActionPoint] = React.useState(0);
  
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = React.useState(false);
  const [addMemberType, setAddMemberType] = React.useState<'Member' | 'Mentor'>('Member');
  const [emailToInvite, setEmailToInvite] = React.useState('');

  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = React.useState(false);
  const [memberToRemove, setMemberToRemove] = React.useState<TeamMember | Mentor | null>(null);
  const [removalReason, setRemovalReason] = React.useState('');


  const handleSendInvite = () => {
    if (!emailToInvite) {
        toast({ variant: 'destructive', title: 'Email is required' });
        return;
    }
    toast({
      title: 'Invite Sent!',
      description: `An invitation has been sent to ${emailToInvite}. They will appear on the team list after accepting and completing the prerequisites.`,
    });
    
    // Simulate adding member with pending status
    const newMember = {
        id: `INV_NEW_${Math.random().toString(36).substr(2, 5)}`, name: emailToInvite.split('@')[0], email: emailToInvite, collegeId: idea?.collegeId || 'N/A', credits: 0, status: 'pending' as MemberStatus, hasPsychometricAnalysis: false,
    };
    
    if (addMemberType === 'Member') {
        setTeamMembers(prev => [...prev, newMember as TeamMember]);
    } else {
        setMentors(prev => [...prev, {...newMember, expertise: ['General'], status: 'pending' as MemberStatus} as Mentor]);
    }

    setEmailToInvite('');
    setIsAddMemberModalOpen(false);
  };
  
  const openRemoveMemberModal = (member: TeamMember | Mentor) => {
    if ('expertise' in member && mentors.length <= 1) {
        toast({
            variant: 'destructive',
            title: 'Cannot Remove Last Mentor',
            description: 'You must have at least one internal mentor assigned to the idea.'
        });
        return;
    }
    setMemberToRemove(member);
    setIsRemoveMemberModalOpen(true);
  };

  const handleRemoveMember = () => {
    if (!memberToRemove || !removalReason) {
        toast({ variant: 'destructive', title: 'Reason Required', description: 'Please select a reason for removal.' });
        return;
    }

    if ('expertise' in memberToRemove) { // It's a Mentor
        setMentors(prev => prev.filter(m => m.id !== memberToRemove.id));
    } else { // It's a Team Member
        setTeamMembers(prev => prev.filter(m => m.id !== memberToRemove.id));
    }
    
    toast({
      title: 'Removal Request Sent',
      description: `A removal request for ${memberToRemove.name} has been sent for their approval (NOC). This event will be logged.`,
    });
    setMemberToRemove(null);
    setRemovalReason('');
    setIsRemoveMemberModalOpen(false);
  };


  const currentPhaseIndex = idea?.trl ? ROADMAP_PHASES.findIndex(phase => phase.trls.includes(idea.trl!)) : -1;
  const currentPhase = currentPhaseIndex !== -1 ? ROADMAP_PHASES[currentPhaseIndex] : null;

  const allClustersExpanded = openAccordionItems.length > 0 && openAccordionItems.length === allClusterNames.length;

  const handleToggleExpandAll = () => {
    if (allClustersExpanded) {
      setOpenAccordionItems([]);
    } else {
      setOpenAccordionItems(allClusterNames);
    }
  };

  const upcomingConsultations = MOCK_CONSULTATIONS.filter(
    (c) => c.ideaId === ideaId && c.status === 'Scheduled'
  );

  const pastConsultations = MOCK_CONSULTATIONS.filter(
    (c) => c.ideaId === ideaId && c.status !== 'Scheduled'
  );
  
  const handleViewMom = (consultation: (typeof MOCK_CONSULTATIONS)[0]) => {
    setSelectedConsultationForMom(consultation);
    setIsMomDialogOpen(true);
  };


  const handleDownload = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    const width = pdfWidth;
    const height = width / ratio;
    
    let position = 0;
    let heightLeft = height;

    pdf.addImage(imgData, 'PNG', 0, position, width, height);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
        position = heightLeft - height;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, width, height);
        heightLeft -= pdfHeight;
    }
    
    pdf.save(`${ideaId}-PragatiAI-Report.pdf`);
};

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
        title: "Link Copied!",
        description: "The report link has been copied to your clipboard.",
    });
  };

  const handleResubmit = () => {
    const ideaData = {
      title: idea?.title,
      description: idea?.description,
      domain: idea?.domain,
      weights: idea?.clusterWeights,
    };
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('idea', JSON.stringify(ideaData));
    const role = searchParams.get('role');
    if (role) {
      newSearchParams.set('role', role);
    }
    router.push(`/dashboard/submit?${newSearchParams.toString()}`);
  }

  const handleRequestConsultationSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast({
        title: "Request Submitted",
        description: "Your consultation request has been sent to the TTC Coordinator.",
    });
    setIsRequestConsultationOpen(false);
  };
  
  const handleScheduleConsultationSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast({
        title: "Consultation Request Sent",
        description: "Your consultation request has been sent to the Super Admin for approval.",
    });
    setIsScheduleConsultationOpen(false);
  };
  
  const { topPerformers, bottomPerformers, avgClusterScores, parameterSummaries } = React.useMemo<ReportMetrics>(() => {
    if (!report) return { topPerformers: [], bottomPerformers: [], avgClusterScores: {}, parameterSummaries: {} };

    const allSubParams: { name: string; score: number; clusterName: string; paramName: string }[] = [];
    const clusterScores: Record<string, number[]> = {};
    const parameterSummaries: Record<string, Record<string, ParameterSummary>> = {};

    Object.entries(report.sections.detailedEvaluation.clusters).forEach(([clusterName, clusterData]) => {
      clusterScores[clusterName] = [];
      parameterSummaries[clusterName] = {};
      Object.entries(clusterData).forEach(([paramName, paramData]) => {
        const subParams = Object.entries(paramData);
        if (subParams.length === 0) return;

        let totalScore = 0;
        let bestWell = { score: -1, text: 'No specific strengths noted.' };
        let worstImproved = { score: 101, text: 'No specific improvement areas noted.' };

        subParams.forEach(([subParamName, subParamDetails]: [string, any]) => {
          if (subParamDetails.assignedScore) {
            const score = subParamDetails.assignedScore;
            totalScore += score;
            allSubParams.push({ name: subParamName, score, clusterName, paramName });
            clusterScores[clusterName].push(score);

            if (score > bestWell.score) {
              bestWell = { score, text: subParamDetails.whatWentWell };
            }
            if (score < worstImproved.score) {
              worstImproved = { score, text: subParamDetails.whatCanBeImproved };
            }
          }
        });
        
        const avgScore = subParams.length > 0 ? totalScore / subParams.length : 0;
        parameterSummaries[clusterName][paramName] = {
            avgScore,
            strongestPoint: bestWell.text,
            improvementPoint: worstImproved.text,
        };
      });
    });
    
    const sortedSubParams = allSubParams.sort((a, b) => b.score - a.score);
    const avgClusterScores = Object.entries(clusterScores).reduce((acc, [key, scores]) => {
        const avg = scores.reduce((sum, s) => sum + s, 0) / (scores.length || 1);
        acc[key] = avg;
        return acc;
    }, {} as Record<string, number>);

    return {
      topPerformers: sortedSubParams.slice(0, 3),
      bottomPerformers: sortedSubParams.slice(-3).reverse(),
      avgClusterScores,
      parameterSummaries
    };
  }, [report]);

  const handleHighlightClick = (clusterName: string, paramName: string, subParamName: string) => {
    requestAnimationFrame(() => {
      const elementId = `sub-param-${subParamName.replace(/[^a-zA-Z0-9]/g, '-')}`;
      const element = document.getElementById(elementId);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const actionPoints = React.useMemo(() => {
    if (!report) return [];
    let points = [];
    
    const outcome = report.validationOutcome;

    if (outcome === 'Approved' || outcome === 'Slay') {
        points.push({
            title: "Accelerate Your Idea",
            todos: [
                "Finalize your business plan and financial projections.",
                "Begin networking with potential investors and partners.",
                "To bring your vision to life, explore professional full-stack development and mobile app services on platforms like Edifai, which covers both tech and non-tech areas.",
            ]
        });
    } else if (outcome === 'Moderate' || outcome === 'Mid') {
        points.push({
            title: "Refine and Strengthen",
            todos: [
                "Focus on the 'Areas for Improvement' identified in the report.",
                "Consider a pivot based on the AI's feedback on market fit.",
                "To improve your concept's potential, consider engaging with expert UI/UX design and prototyping services through resources like Edifai, which covers both tech and non-tech areas.",
            ]
        });
    } else { // Rejected or other
        points.push({
            title: "Rethink and Re-strategize",
            todos: [
                "Deeply analyze the feedback on 'Core Idea & Innovation' and 'Market Need'.",
                "Conduct primary market research to validate the core problem.",
                "For a foundational reset, expert industry consultancy and audit services from a platform like Edifai can provide a new perspective on tech and non-tech topics.",
            ]
        });
    }

    if (bottomPerformers.length > 0) {
        const lowest = bottomPerformers[0];
        points.push({
            title: `Address Lowest Score: ${lowest.name}`,
            todos: [
                `Review the feedback for '${lowest.name}' in the detailed assessment.`,
                `Brainstorm 3-5 ways to directly improve this aspect.`,
                `Update your pitch deck to reflect these improvements.`
            ]
        });
    }
    
    return points;
  }, [report, bottomPerformers]);

  if (!idea) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Idea Not Found</h2>
        <p className="text-muted-foreground">The idea you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link href={`/dashboard/ideas?role=${role || ROLES.INNOVATOR}`}>Go to My Ideas</Link>
        </Button>
      </div>
    );
  }
  
  const status = report?.validationOutcome || idea.status;
  const score = report?.overallScore ?? null;
  
  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 85) return 'text-green-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const shareUrl = idea ? encodeURIComponent(`${window.location.origin}/dashboard/ideas/${idea.id}?role=${ROLES.INNOVATOR}`) : '';
  const shareText = idea ? encodeURIComponent(`Check out my idea report for "${idea.title}" on PragatiAI!`) : '';
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  const getStatusDotClasses = (status: MemberStatus, hasAnalysis: boolean) => {
    if (status === 'active' && hasAnalysis) return 'bg-green-500';
    if (status === 'pending') return 'bg-blue-500 animate-pulse';
    if (status === 'accepted' && !hasAnalysis) return 'bg-orange-500';
    if (status === 'declined') return 'bg-red-500';
    return 'bg-gray-400';
  }
  
  const getStatusTooltip = (status: MemberStatus, hasAnalysis: boolean) => {
    if (status === 'active' && hasAnalysis) return 'Active: Analysis complete.';
    if (status === 'pending') return 'Invitation Pending: Awaiting response.';
    if (status === 'accepted' && !hasAnalysis) return 'Accepted: Awaiting psychometric analysis.';
    if (status === 'declined') return 'Declined: Invitation was not accepted.';
    return 'Status Unknown';
  }

  return (
    <TooltipProvider>
    <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-2">
             <Button variant="outline" asChild>
                <Link href={getBackLink(role)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Link>
            </Button>
             <div className="flex gap-2">
                {(status === "Moderate" || status === "Rejected") && (
                    <Button onClick={handleResubmit}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resubmit Idea
                    </Button>
                )}
                 {status === "Approved" && role !== ROLES.MENTOR && (
                    <Button onClick={() => setIsRequestConsultationOpen(true)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Request Consultation
                    </Button>
                )}
                <Button variant="outline" onClick={() => setIsShareDialogOpen(true)}>
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
             </div>
        </div>

        <div ref={reportRef} className="p-4 bg-background">
          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div>
                <CardTitle className="text-2xl">{idea.title}</CardTitle>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground pt-2">
                  <span>ID: {idea.id}</span>
                  <span>Version: {idea.version}</span>
                  <span>Submitted: {idea.dateSubmitted}</span>
                  <span>Status: <Badge className={cn(STATUS_COLORS[status])}>{status}</Badge></span>
                  {idea.domain && <span>Domain: {idea.domain} {idea.subDomain && `(${idea.subDomain})`}</span>}
                  {idea.domain === 'Retail' && idea.locality && <span>Location: {idea.locality}</span>}
                  {currentPhase && <Badge variant="secondary">Phase: {currentPhase.name}</Badge>}
                </div>
              </div>
              {report && (
                <ScoreDisplay score={score} status={status} />
              )}
            </CardHeader>
             {report ? (
              <CardContent className="space-y-8 pt-2">
                
                <Card className="bg-muted/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Team & Mentors</CardTitle>
                        {role === ROLES.INNOVATOR && (
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => { setAddMemberType('Member'); setIsAddMemberModalOpen(true); }}><PlusCircle className="mr-2 h-4 w-4"/>Add Member</Button>
                                <Button size="sm" variant="outline" onClick={() => { setAddMemberType('Mentor'); setIsAddMemberModalOpen(true); }}><PlusCircle className="mr-2 h-4 w-4"/>Add Mentor</Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <h4 className="font-semibold flex items-center gap-2 mb-2"><Users className="h-5 w-5 text-primary" /> Core Team</h4>
                            <div className="space-y-2">
                                {teamMembers.map(member => (
                                    <div key={member.id} className="group flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 cursor-pointer">
                                            <Avatar className="h-6 w-6"><AvatarImage src={`https://avatar.vercel.sh/${member.name}.png`} /><AvatarFallback>{getInitials(member.name)}</AvatarFallback></Avatar>
                                            <Tooltip><TooltipTrigger><span>{member.name}</span></TooltipTrigger><TooltipContent><p>{member.email}</p></TooltipContent></Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger><span className={cn("h-2 w-2 rounded-full", getStatusDotClasses(member.status, member.hasPsychometricAnalysis))}></span></TooltipTrigger>
                                                <TooltipContent><p>{getStatusTooltip(member.status, member.hasPsychometricAnalysis)}</p></TooltipContent>
                                            </Tooltip>
                                        </div>
                                        {role === ROLES.INNOVATOR && member.id !== idea.innovatorId && (
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => openRemoveMemberModal(member)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold flex items-center gap-2 mb-2"><Briefcase className="h-5 w-5 text-primary" /> Internal Mentors</h4>
                             <div className="space-y-2">
                                {mentors.map(mentor => (
                                     <div key={mentor.id} className="group flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 cursor-pointer">
                                            <Avatar className="h-6 w-6"><AvatarImage src={`https://avatar.vercel.sh/${mentor.name}.png`} /><AvatarFallback>{getInitials(mentor.name)}</AvatarFallback></Avatar>
                                            <Tooltip><TooltipTrigger><span>{mentor.name}</span></TooltipTrigger><TooltipContent><p>{mentor.email}</p></TooltipContent></Tooltip>
                                             <Tooltip>
                                                <TooltipTrigger><span className={cn("h-2 w-2 rounded-full", getStatusDotClasses(mentor.status, true))}></span></TooltipTrigger>
                                                <TooltipContent><p>{getStatusTooltip(mentor.status, true)}</p></TooltipContent>
                                            </Tooltip>
                                        </div>
                                        {role === ROLES.INNOVATOR && (
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => openRemoveMemberModal(mentor)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        )}
                                    </div>
                                ))}
                                {mentors.length === 0 && <p className="text-sm text-muted-foreground">No internal mentors assigned.</p>}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold flex items-center gap-2 mb-2"><Star className="h-5 w-5 text-primary" /> External Mentor</h4>
                            <div className="space-y-2">
                                {externalMentor ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-2 text-sm cursor-pointer">
                                                <Avatar className="h-6 w-6"><AvatarImage src={`https://avatar.vercel.sh/${externalMentor.name}.png`} /><AvatarFallback>{getInitials(externalMentor.name)}</AvatarFallback></Avatar>
                                                <span>{externalMentor.name}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{externalMentor.email}</p></TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Not assigned (Score {'<'} 85).</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Executive Summary & Recommendation</h3>
                    <p className="text-sm text-muted-foreground">{report.sections.executiveSummary.concept}</p>
                    <p className="font-semibold">Recommendation:</p>
                    <p className="text-muted-foreground text-sm">{report.recommendationText}</p>
                </div>
                
                <Separator />
                 <Card className="bg-muted/50 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary" />
                            AI-Powered Focus Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-6 space-y-4">
                           <div className="space-y-1">
                              <h4 className="font-semibold flex items-center gap-2 text-sm"><User className="h-4 w-4" /> Your Chosen Focus</h4>
                              <Badge variant="outline">{idea.clusterWeightsPreset || "Balanced"}</Badge>
                           </div>
                           <div className="space-y-1">
                             <h4 className="font-semibold flex items-center gap-2 text-sm"><Bot className="h-4 w-4" /> AI Suggested Focus</h4>
                             <Badge variant="default">Research-Focused</Badge>
                           </div>
                        </div>
                        <div className="bg-background/50 p-6 border-l">
                            <h4 className="font-semibold text-sm mb-2">AI Insight</h4>
                            <p className="text-sm text-muted-foreground italic">
                                Based on your idea's high scores in "Novelty & Uniqueness" and "Technical Feasibility," a Research-Focused weightage might better reflect its strengths. This would prioritize proving the core technology over immediate commercialization, which could be more attractive to early-stage investors and grant programs.
                            </p>
                        </div>
                      </div>
                    </CardContent>
                </Card>

                {idea.trl && (
                    <>
                        <Card className="bg-muted/50">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between text-lg">
                                    <span>Project Roadmap</span>
                                </CardTitle>
                                <CardDescription>Your idea's current position on the path from concept to market.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Roadmap currentTrl={idea.trl} role={role}/>
                            </CardContent>
                        </Card>
                        <Separator />
                    </>
                )}
                
                {role === ROLES.SUPER_ADMIN && innovatorProfile && (
                  <>
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="h-5 w-5 text-primary" />
                        Confidential: Founder Psychometric Analysis
                      </CardTitle>
                      <CardDescription>This section is only visible to Super Admins.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold">Profile: {innovatorProfile.profileType}</h4>
                          <p className="text-sm text-muted-foreground italic mt-1">"{innovatorProfile.generalAnalysis}"</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm"><strong className="font-medium text-foreground">Domain Fit:</strong> {innovatorProfile.domainFit}</p>
                          <p className="text-sm"><strong className="font-medium text-foreground">Expertise Fit:</strong> {innovatorProfile.expertiseFit}</p>
                           <p className="text-sm"><strong className="font-medium text-foreground">Key Success Factors:</strong> {innovatorProfile.successFactors}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Separator />
                  </>
                )}
                 
                 {(role === ROLES.MENTOR || role === ROLES.SUPER_ADMIN || role === ROLES.COORDINATOR) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Mentor's Guidance</CardTitle>
                            <CardDescription>Provide actionable next steps and schedule consultations.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="next-steps">Next Steps for Innovator</Label>
                                <Textarea id="next-steps" placeholder="e.g., 1. Refine the financial projections. 2. Create a high-fidelity prototype." className="mt-2" />
                            </div>
                            <Button onClick={() => setIsScheduleConsultationOpen(true)}>Schedule Next Consultation</Button>
                        </CardContent>
                    </Card>
                 )}

                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Team Composition Analysis (God's Eye View)
                        </CardTitle>
                        <CardDescription>
                            An AI-powered analysis of your team's psychometric and behavioral data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <Card className="p-4">
                                <CardTitle className="text-base flex items-center justify-center gap-2">
                                    <Target className="h-5 w-5" /> Team Score
                                </CardTitle>
                                <p className="text-4xl font-bold text-primary mt-2">82</p>
                                <p className="text-xs text-muted-foreground">Well-Balanced</p>
                            </Card>
                            <Card className="md:col-span-2 p-4">
                                 <CardTitle className="text-base mb-2">Team SWOT</CardTitle>
                                 <div className="grid grid-cols-2 gap-4 text-left text-sm">
                                     <div>
                                         <p className="font-semibold text-green-600">Strengths:</p>
                                         <ul className="list-disc list-inside text-muted-foreground">
                                             <li>High in Creativity</li>
                                             <li>Strong Resilience</li>
                                         </ul>
                                     </div>
                                     <div>
                                         <p className="font-semibold text-red-600">Weaknesses:</p>
                                         <ul className="list-disc list-inside text-muted-foreground">
                                             <li>Low Financial Literacy</li>
                                             <li>Moderate Networking Skills</li>
                                         </ul>
                                     </div>
                                      <div>
                                         <p className="font-semibold text-blue-600">Opportunities:</p>
                                         <ul className="list-disc list-inside text-muted-foreground">
                                             <li>Leverage creativity for marketing</li>
                                             <li>Resilience can overcome market entry challenges</li>
                                         </ul>
                                     </div>
                                      <div>
                                         <p className="font-semibold text-orange-600">Threats:</p>
                                         <ul className="list-disc list-inside text-muted-foreground">
                                             <li>Financial planning gaps</li>
                                             <li>Slow partnership development</li>
                                         </ul>
                                     </div>
                                 </div>
                            </Card>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Team Gap Analysis & Upskilling Guide</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                To achieve a perfect team score, consider adding a member with the following profile or upskilling in these areas:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="p-4 bg-muted/50">
                                    <CardTitle className="text-sm font-semibold mb-2">Ideal Team Addition: "The Financial Strategist"</CardTitle>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                      <li><strong>Primary Skill:</strong> Financial Literacy & Modeling</li>
                                      <li><strong>Secondary Skill:</strong> Strategic Networking</li>
                                      <li><strong>Psychometric Trait:</strong> High Risk-Aversion, Detail-Oriented</li>
                                    </ul>
                                </Card>
                                 <Card className="p-4 bg-muted/50">
                                    <CardTitle className="text-sm font-semibold mb-2">Team Upskilling Roadmap</CardTitle>
                                     <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                      <li><strong>Hard Skill:</strong> Complete a course on "Startup Financials & Forecasting" on <a href="https://edifai.in/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Edifai</a>, which covers both tech and non-tech areas.</li>
                                      <li><strong>Soft Skill:</strong> Attend 2 networking events per month.</li>
                                      <li><strong>Action:</strong> Schedule a workshop on effective delegation.</li>
                                     </ul>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </Card>


                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8">
                  <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Cluster Performance</h3>
                      <p className="text-sm text-muted-foreground">Average scores across the main evaluation clusters.</p>
                      <div ref={spiderChartRef} className="h-[350px] flex items-center justify-center">
                         <SpiderChart data={avgClusterScores} maxScore={100} size={400} />
                      </div>
                  </div>

                  <Separator orientation="vertical" className="hidden lg:block" />
                  
                  <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Highlights & Lowlights</h3>
                      <p className="text-sm text-muted-foreground">Top and bottom performing sub-parameters.</p>
                      <div className="mt-4 space-y-4">
                        <div>
                          <h4 className="font-semibold text-green-600 flex items-center gap-2"><TrendingUp /> Top Performers</h4>
                          <ul className="mt-2 space-y-1 text-sm">
                            {topPerformers.map((item, i) => (
                              <li key={i}>
                                 <button
                                    onClick={() => handleHighlightClick(item.clusterName, item.paramName, item.name)}
                                    className="flex justify-between w-full hover:bg-muted p-1 rounded-md transition-colors text-left"
                                 >
                                    <span className="text-muted-foreground">{item.name}</span>
                                    <span className="font-bold text-green-600">{item.score}</span>
                                 </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold text-red-600 flex items-center gap-2"><TrendingDown /> Areas for Improvement</h4>
                           <ul className="mt-2 space-y-1 text-sm">
                            {bottomPerformers.map((item, i) => (
                               <li key={i}>
                                 <button
                                     onClick={() => handleHighlightClick(item.clusterName, item.paramName, item.name)}
                                     className="flex justify-between w-full hover:bg-muted p-1 rounded-md transition-colors text-left"
                                 >
                                    <span className="text-muted-foreground">{item.name}</span>
                                    <span className="font-bold text-red-600">{item.score}</span>
                                  </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                  </div>
                </div>
                
                <Separator />
                
                {actionPoints.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Next Steps</h3>
                    <p className="text-sm text-muted-foreground">
                      Actionable steps to improve your idea based on the evaluation. For more complex challenges, you may want to <a href="https://edifai.in/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">explore expert consultation on tech and non-tech topics</a>.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="flex flex-col gap-2">
                            {actionPoints.map((point, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveActionPoint(i)}
                                    className={cn(
                                        "p-3 rounded-md text-left transition-colors border-l-4",
                                        i === activeActionPoint 
                                            ? "bg-muted border-primary" 
                                            : "bg-transparent hover:bg-muted/50 border-transparent"
                                    )}
                                >
                                    <p className="font-semibold">{point.title}</p>
                                </button>
                            ))}
                        </div>
                        <div className="bg-muted/50 p-4 rounded-lg">
                           <h4 className="font-semibold mb-3">To-Do List:</h4>
                           <ul className="space-y-3">
                                {actionPoints[activeActionPoint]?.todos.map((todo, j) => (
                                    <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0"/>
                                        <span>{todo}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                           <h3 className="text-xl font-semibold">Detailed Viability Assessment</h3>
                           <p className="text-sm text-muted-foreground">{report.sections.detailedEvaluation.description}</p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={handleToggleExpandAll}>
                          {allClustersExpanded ? 'Collapse All' : 'Expand All'}
                        </Button>
                    </div>
                    <Accordion type="multiple" value={openAccordionItems} onValueChange={setOpenAccordionItems} className="w-full pt-4">
                        {Object.entries(report.sections.detailedEvaluation.clusters).map(([clusterName, clusterData]) => (
                            <AccordionItem value={clusterName} key={clusterName}>
                                <AccordionTrigger className="text-lg font-semibold text-primary hover:no-underline">
                                    {clusterName}
                                </AccordionTrigger>
                                <AccordionContent className="p-4 pt-0 space-y-4">
                                <Accordion type="single" collapsible className="w-full">
                                {Object.entries(clusterData).map(([paramName, paramData]) => {
                                    if (typeof paramData !== 'object' || paramData === null) return null;
                                    const summary = parameterSummaries[clusterName]?.[paramName];
                                    return (
                                        <AccordionItem value={paramName} key={paramName}>
                                            <AccordionTrigger className="font-semibold mb-2 hover:no-underline">
                                                <div className="flex justify-between items-center w-full pr-2">
                                                    <span>{paramName}</span>
                                                    {summary && (
                                                      <Badge className={cn(getScoreColor(summary.avgScore), 'bg-opacity-10 border-opacity-20')} variant="outline">{summary.avgScore.toFixed(0)}</Badge>
                                                    )}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="divide-y">
                                                {Object.entries(paramData).map(([subParamName, subParamData]) => {
                                                    if (typeof subParamData !== 'object' || subParamData === null || !('assignedScore' in subParamData)) return null;
                                                    
                                                    const score = subParamData.assignedScore;
                                                    const whatWentWell = subParamData.whatWentWell;
                                                    const whatCanBeImproved = subParamData.whatCanBeImproved;
                                                    const id = `sub-param-${subParamName.replace(/[^a-zA-Z0-9]/g, '-')}`;
                                                    
                                                    const subCircumference = 2 * Math.PI * 18;
                                                    const subStrokeDashoffset = subCircumference - (score / 100) * subCircumference;


                                                    return (
                                                        <div key={subParamName} id={id} className="p-3 grid grid-cols-1 md:grid-cols-12 gap-4 items-center scroll-mt-20">
                                                            <div className="md:col-span-3">
                                                                <h6 className="font-medium text-sm">{subParamName}</h6>
                                                            </div>
                                                            <div className="md:col-span-1 flex items-center justify-start md:justify-center">
                                                                <div className="relative h-16 w-16">
                                                                    <svg className="h-full w-full" viewBox="0 0 40 40">
                                                                        <circle cx="20" cy="20" r="18" className="stroke-muted" strokeWidth="3" fill="transparent" />
                                                                        <circle
                                                                            cx="20"
                                                                            cy="20"
                                                                            r="18"
                                                                            className={cn("stroke-current transition-all duration-500 ease-in-out", getScoreColor(score))}
                                                                            strokeWidth="3"
                                                                            fill="transparent"
                                                                            strokeLinecap="round"
                                                                            strokeDasharray={subCircumference}
                                                                            strokeDashoffset={subStrokeDashoffset}
                                                                            transform="rotate(-90 20 20)"
                                                                        />
                                                                    </svg>
                                                                    <span className={cn("absolute inset-0 flex items-center justify-center text-base font-bold", getScoreColor(score))}>
                                                                        {score}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="md:col-span-4 space-y-1">
                                                                <div className="flex items-start gap-2 text-sm">
                                                                    <ThumbsUp className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                                    <p className="text-muted-foreground flex-1 break-words">{whatWentWell}</p>
                                                                </div>
                                                            </div>
                                                            <div className="md:col-span-4 space-y-1">
                                                                <div className="flex items-start gap-2 text-sm">
                                                                    <Lightbulb className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                                                    <p className="text-muted-foreground flex-1 break-words">{whatCanBeImproved}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )
                                })}
                                </Accordion>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

              </CardContent>
            ) : (
                 <CardContent>
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">Report is being generated or is not available. Status: {idea.status}</p>
                    </div>
                </CardContent>
            )}
          </Card>
          
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Consultation Log</CardTitle>
                    <CardDescription>
                    Review upcoming and past consultations for this idea.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="upcoming">
                    <TabsList>
                        <TabsTrigger value="upcoming">Upcoming ({upcomingConsultations.length})</TabsTrigger>
                        <TabsTrigger value="past">Past ({pastConsultations.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upcoming" className="mt-4">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Mentor</TableHead>
                            <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {upcomingConsultations.length > 0 ? (
                            upcomingConsultations.map((consultation) => (
                                <TableRow key={consultation.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/consultations?role=${role}`)}>
                                <TableCell>{consultation.date} at {consultation.time}</TableCell>
                                <TableCell>{consultation.mentor}</TableCell>
                                <TableCell><Badge className={cn(STATUS_COLORS[consultation.status])}>{consultation.status}</Badge></TableCell>
                                </TableRow>
                            ))
                            ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">No upcoming consultations.</TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="past" className="mt-4">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Mentor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pastConsultations.length > 0 ? (
                            pastConsultations.map((consultation) => (
                                <TableRow key={consultation.id} className="cursor-pointer" onClick={() => handleViewMom(consultation)}>
                                <TableCell>{consultation.date}</TableCell>
                                <TableCell>{consultation.mentor}</TableCell>
                                <TableCell><Badge className={cn(STATUS_COLORS[consultation.status])}>{consultation.status}</Badge></TableCell>
                                <TableCell className="truncate max-w-xs">{consultation.agenda.join(', ')}</TableCell>
                                </TableRow>
                            ))
                            ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">No past consultations.</TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                        </Table>
                    </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

        </div>
    </div>
    
    <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {addMemberType}</DialogTitle>
            <DialogDescription>
              Enter the email address of the {addMemberType.toLowerCase()} you wish to invite.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={emailToInvite}
                onChange={(e) => setEmailToInvite(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSendInvite}><Send className="mr-2 h-4 w-4"/>Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isRemoveMemberModalOpen} onOpenChange={setIsRemoveMemberModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {memberToRemove?.name}?</DialogTitle>
            <DialogDescription>
              Please state a reason for removing this member. They will be notified and asked to approve this change.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="removal-reason">Reason for Removal</Label>
                <Select value={removalReason} onValueChange={setRemovalReason}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a reason..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="project-pivot">Project has pivoted</SelectItem>
                        <SelectItem value="inactivity">Member is inactive</SelectItem>
                        <SelectItem value="disagreement">Mutual disagreement</SelectItem>
                        <SelectItem value="left-organization">Member has left the organization</SelectItem>
                        <SelectItem value="other">Other (will be logged)</SelectItem>
                    </SelectContent>
                </Select>
             </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={handleRemoveMember}>Request Removal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Report: {idea?.title}</DialogTitle>
            <DialogDescription>
              Share your idea report with others via link or PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Input
                id="link"
                value={`${window.location.origin}/dashboard/ideas/${idea?.id}?role=${ROLES.INNOVATOR}`}
                readOnly
              />
              <Button type="button" size="sm" className="px-3" onClick={handleCopyLink}>
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Anyone with this link will be able to view the report.
            </p>
            <Separator />
            <div className="space-y-2">
                <p className="text-sm font-medium text-center text-muted-foreground">Quick Share</p>
                 <div className="flex justify-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild><Button asChild variant="outline" size="icon"><a href={`https://api.whatsapp.com/send?text=${shareText} ${shareUrl}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="h-5 w-5" /></a></Button></TooltipTrigger><TooltipContent>WhatsApp</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button asChild variant="outline" size="icon"><a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer"><TwitterIcon className="h-5 w-5" /></a></Button></TooltipTrigger><TooltipContent>X / Twitter</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button asChild variant="outline" size="icon"><a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer"><FacebookIcon className="h-5 w-5" /></a></Button></TooltipTrigger><TooltipContent>Facebook</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button asChild variant="outline" size="icon"><a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${encodeURIComponent(idea?.title || '')}&summary=${shareText}`} target="_blank" rel="noopener noreferrer"><LinkedInIcon className="h-5 w-5" /></a></Button></TooltipTrigger><TooltipContent>LinkedIn</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button asChild variant="outline" size="icon"><a href={`mailto:?subject=${encodeURIComponent(idea?.title || '')}&body=${shareText} ${shareUrl}`}><MailIcon className="h-5 w-5" /></a></Button></TooltipTrigger><TooltipContent>Email</TooltipContent></Tooltip>
                 </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleDownload}
            >
              <Download className="mr-2" />
              Export as PDF
            </Button>
             <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    <Dialog open={isMomDialogOpen} onOpenChange={setIsMomDialogOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Minutes of Meeting</DialogTitle>
                <DialogDescription>
                    Summary for consultation on "{selectedConsultationForMom?.title}" held on {selectedConsultationForMom?.date}.
                </DialogDescription>
                <p className="text-xs text-muted-foreground pt-2">Consultation ID: {selectedConsultationForMom?.id}</p>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                <div>
                    <h4 className="font-semibold mb-2">Agenda</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {selectedConsultationForMom?.agenda.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
                <Separator />
                <div>
                    <h4 className="font-semibold mb-2">Key Discussion Points</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                         {selectedConsultationForMom?.pointsDiscussed.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
                <Separator />
                <div>
                    <h4 className="font-semibold mb-2">Action Items & To-Dos</h4>
                     <ul className="space-y-2">
                        {selectedConsultationForMom?.actionItems.map((item, index) => (
                           <li key={index} className="flex items-start gap-3 text-sm">
                               <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0"/>
                                <div className="flex-1">
                                   <span className="text-foreground">{item.task}</span>
                                   <p className="text-xs text-muted-foreground">Owner: {item.owner} - Due: {item.dueDate}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <Separator />
                 <div>
                    <h4 className="font-semibold mb-2">Next Steps</h4>
                     <p className="text-sm text-muted-foreground">{selectedConsultationForMom?.nextSteps}</p>
                </div>
            </div>
            <DialogFooter>
                <Button variant="secondary" onClick={() => toast({ title: 'Downloading Report...', description: 'This is a mock action.'})}>
                    <Download className="mr-2 h-4 w-4" /> Download MoM Report
                </Button>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    
    <Dialog open={isRequestConsultationOpen} onOpenChange={setIsRequestConsultationOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Request a New Consultation</DialogTitle>
                <DialogDescription>
                    Fill out the details below to request a meeting with a mentor for your idea: "{idea.title}".
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRequestConsultationSubmit}>
                <div className="grid gap-4 py-4">
                     <div className="space-y-2">
                        <Label htmlFor="mentor">Preferred Mentor</Label>
                         <Select required>
                            <SelectTrigger id="mentor"><SelectValue placeholder="Select a mentor" /></SelectTrigger>
                            <SelectContent>
                                {MOCK_TTCS.map(ttc => (
                                    <SelectItem key={ttc.id} value={ttc.id}>{ttc.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">Preferred Date</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="questions">Questions / Topics</Label>
                        <Textarea id="questions" placeholder="What would you like to discuss? e.g., 'Market entry strategy', 'Technical feasibility concerns'." required />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit">Submit Request</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isScheduleConsultationOpen} onOpenChange={setIsScheduleConsultationOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Schedule Next Consultation</DialogTitle>
                <DialogDescription>
                    Set the agenda and schedule the next meeting for "{idea.title}". This will be sent for Super Admin approval.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleScheduleConsultationSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="schedule-date">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="schedule-time">Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="schedule-time" type="time" className="pl-10" required />
                            </div>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="agenda">Agenda / Milestones</Label>
                        <Textarea id="agenda" placeholder="List the key topics and goals for this meeting. e.g., 'Finalize MVP scope', 'Review user feedback'." required />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit">Send Request</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
