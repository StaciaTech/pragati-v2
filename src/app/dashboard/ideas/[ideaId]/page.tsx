
'use client';

<<<<<<< HEAD
import * as React from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MOCK_IDEAS, STATUS_COLORS, MOCK_CONSULTATIONS, MOCK_TTCS, MOCK_PSYCHOMETRIC_PROFILES, MOCK_INNOVATORS } from '@/lib/mock-data';
import type { ValidationReport } from '@/ai/schemas';
import { ROLES } from '@/lib/constants';
import { ArrowLeft, Download, ThumbsUp, Lightbulb, RefreshCw, MessageSquare, TrendingUp, TrendingDown, Star, Share2, Copy, CalendarIcon, ChevronRight, CheckCircle2, UserCheck, Shield } from 'lucide-react';
=======
import React, { useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
>>>>>>> 5faf3aa18a1eb274513c8bf2e6da66f417e7bc8e
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MOCK_IDEAS } from '@/lib/mock-data';
import { 
  Check, X, Shield, Users, Clock, DollarSign, Target, Briefcase, TrendingUp, Search, Info, Loader2, Download, ArrowLeft,
  FileText, Lightbulb, TrendingDown, Layers, Rocket, Factory, AlignJustify, Handshake, Sun, Globe, Zap, Award, Star, Activity, HardHat, GitFork, Link2, Sprout, Building, PieChart, BriefcaseMedical, Landmark, Leaf, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROLES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
<<<<<<< HEAD
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

export default function IdeaReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { ideaId } = params as { ideaId: string };
  const { toast } = useToast();
  const reportRef = React.useRef<HTMLDivElement>(null);
  const spiderChartRef = React.useRef<HTMLDivElement>(null);

  const [isRequestConsultationOpen, setIsRequestConsultationOpen] = React.useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  
  const role = searchParams.get('role');
  const idea = MOCK_IDEAS.find((i) => i.id === ideaId);
  const report = idea?.report as ValidationReport | null;
  
  const innovatorProfile = idea ? MOCK_PSYCHOMETRIC_PROFILES[idea.innovatorId] : null;

  const [openAccordionItems, setOpenAccordionItems] = React.useState<string[]>([]);
  const allClusterNames = report ? Object.keys(report.sections.detailedEvaluation.clusters) : [];
  const [activeActionPoint, setActiveActionPoint] = React.useState(0);


  const allClustersExpanded = openAccordionItems.length > 0 && openAccordionItems.length === allClusterNames.length;

  const handleToggleExpandAll = () => {
    if (allClustersExpanded) {
      setOpenAccordionItems([]);
    } else {
      setOpenAccordionItems(allClusterNames);
    }
  };

  const pastConsultations = MOCK_CONSULTATIONS.filter(
    (c) => c.ideaId === ideaId && c.status === 'Completed'
  );

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
=======
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ValidationReport } from '@/ai/schemas';


// A generic section component for better structure and styling
const Section = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon: React.ElementType }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-white rounded-xl shadow-lg border border-gray-100"
    >
      <h2 className="flex items-center text-2xl font-bold mb-4 text-gray-800">
        {Icon && <Icon className="mr-3 text-indigo-600" size={24} />}
        {title}
      </h2>
      <div className="border-b-2 border-gray-100 mb-4"></div>
      {children}
    </motion.div>
  );

// Component to render the detailed scoring hierarchy
const DetailedScoringBlock = ({ parameter }: { parameter: any }) => {
    // Check if the current parameter has sub_parameters (nested structure)
    if (parameter.sub_parameters) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm mb-6">
          <h4 className="flex items-center text-lg font-bold text-gray-800 mb-4">
            {getIcon(parameter.icon)}
            <span className="ml-2">{parameter.parameter_name}</span>
          </h4>
          <div className="pl-4 border-l border-gray-300 space-y-4">
            {parameter.sub_parameters.map((subParam: any, index: number) => (
              <DetailedScoringBlock key={index} parameter={subParam} />
            ))}
          </div>
        </div>
      );
    } else {
      // This is the final leaf node with a score and analysis
      const userInput = parameter.user_input;
      const isNotGiven = userInput && userInput.user_input === "not given";
      
      return (
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <h5 className="text-md font-bold text-gray-800 mb-2">{parameter.parameter_name}</h5>
          
          {userInput && (
            <div className="mb-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                <h6 className="font-semibold text-yellow-800 mb-1">User Provided Data:</h6>
                {isNotGiven ? (
                <p className="text-sm text-yellow-700">Not given</p>
                ) : (
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                    {Object.entries(userInput).map(([key, value]: [string, any], i: number) => (
                    <li key={i}>
                        <span className="font-medium">{key.replace(/_/g, ' ').replace('user provided', '')}:</span> {value}
                    </li>
                    ))}
                </ul>
                )}
            </div>
          )}
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <p className="text-sm font-semibold text-gray-600">Score:</p>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-sm">
                {parameter.score}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-600">Inference:</p>
              <p className="text-sm text-gray-700 mt-1">{parameter.inference}</p>
            </div>
            
            {parameter.recommendations && parameter.recommendations.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-600">AI's Suggestions:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mt-1">
                  {parameter.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {parameter.sourcesUsed && parameter.sourcesUsed.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-600">Sources Used:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mt-1">
                  {parameter.sourcesUsed.map((source: any, i: number) => (
                    <li key={i}>
                      {source.url ? (
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {source.text}
                        </a>
                      ) : (
                        source.text
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

const CompetitiveAnalysisTable = ({ competitors }: { competitors: any[] }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competitor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Features</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Range</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strengths</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weaknesses</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {competitors.map((comp, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{comp.name}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{comp.features}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comp.price_range}</td>
              <td className="px-6 py-4 text-sm text-green-600">{comp.strengths}</td>
              <td className="px-6 py-4 text-sm text-red-600">{comp.weaknesses}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
);

const ActionPlanCategory = ({ title, items }: { title: string, items: string[] }) => (
    <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
      <h4 className="text-lg font-semibold text-gray-700 mb-2">{title}</h4>
      <ul className="list-disc list-inside space-y-2 text-gray-600">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
);

const iconMap: { [key: string]: React.ElementType } = {
  Lightbulb,
  Briefcase,
  Rocket,
  DollarSign,
  Users,
  FileText,
  TrendingDown,
  Shield,
  Handshake,
  Layers,
  Award,
  Zap,
  Globe,
  Info,
  Check,
  X,
  Search,
  TrendingUp,
  Factory,
  Leaf,
  User,
  BriefcaseMedical,
  Landmark,
  GitFork,
  Link2,
  Sprout,
  Building,
  PieChart,
  Star,
  Activity,
  HardHat
>>>>>>> 5faf3aa18a1eb274513c8bf2e6da66f417e7bc8e
};

const getIcon = (iconName: string) => {
  const Icon = iconMap[iconName];
  return Icon ? <Icon className="text-indigo-600" size={24} /> : null;
};


const ReportPage = ({ idea }: { idea: (typeof MOCK_IDEAS)[0] }) => {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  if (!idea || !idea.report) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Generating Report...</h2>
        <p className="text-muted-foreground">
            The report for this idea is not yet available. Please check back shortly.
        </p>
         <Button asChild className="mt-6">
            <Link href={`/dashboard/ideas?role=${ROLES.INNOVATOR}`}>Go to My Ideas</Link>
        </Button>
      </div>
    );
  }

  const report = idea.report;
  
  const scoreColor = report.overallScore > 8 ? 'text-green-500' : report.overallScore > 6 ? 'text-yellow-500' : 'text-red-500';

  const handleDownloadPdf = () => {
    const input = reportRef.current;
    if (!input) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not find the report content to download.',
        });
        return;
    }

    toast({
        title: 'Generating PDF...',
        description: 'This may take a moment. Please wait.',
    });

    html2canvas(input, {
        scale: 2, 
        useCORS: true,
        backgroundColor: window.getComputedStyle(document.body).backgroundColor,
    }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        let imgHeight = pdfWidth / ratio;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        pdf.save(`${report.ideaName.replace(/\s+/g, '_')}_Report.pdf`);
        toast({
            title: 'Download Complete',
            description: 'Your PDF report has been downloaded.',
        });
    }).catch(err => {
        toast({
            variant: 'destructive',
            title: 'PDF Generation Failed',
            description: 'An error occurred while generating the PDF.',
        });
        console.error(err);
    });
  };


  const getInitials = (name: string) => {
    return name?.split(' ').map((n) => n[0]).join('') || '';
  };
  
  const teamMembers = MOCK_INNOVATORS.filter(innovator => 
    innovator.email === idea.innovatorEmail || // The owner
    (idea.teamId && innovator.teamId === idea.teamId) // Co-founders
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans antialiased text-gray-900">
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center mb-4">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button onClick={handleDownloadPdf}>
                    <Download className="mr-2 h-4 w-4" />
                    Export as PDF
                </Button>
            </div>
            <div ref={reportRef} className="bg-gray-50 p-4 md:p-8 space-y-12">
            <motion.header
                className="text-center py-8 bg-white rounded-xl shadow-md border border-gray-200"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-2">
                    AI-Powered Idea Validation Report
                </h1>
                <p className="text-xl text-gray-600 font-medium">{report.ideaName}</p>
                <p className="text-sm text-gray-400 mt-2">Prepared for {report.preparedFor} on {report.date}</p>
                <div className="mt-6">
                    <span className={`text-5xl md:text-6xl font-extrabold ${scoreColor}`}>
                    {report.overallScore.toFixed(1)}
                    </span>
                    <span className="text-2xl text-gray-500">/10</span>
                </div>
<<<<<<< HEAD
              </div>
              {report && (
                <ScoreDisplay score={score} status={status} />
              )}
            </CardHeader>
            {report ? (
              <CardContent className="space-y-8 pt-2">
                
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Executive Summary & Recommendation</h3>
                    <p className="text-sm text-muted-foreground">{report.sections.executiveSummary.concept}</p>
                    <p className="font-semibold">Recommendation:</p>
                    <p className="text-muted-foreground text-sm">{report.recommendationText}</p>
                </div>
                
                <Separator />
                
                {role === ROLES.SUPER_ADMIN && (
                  <>
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="h-5 w-5 text-primary" />
                        Confidential: Team Psychometric Summary
                      </CardTitle>
                      <CardDescription>This section is only visible to Super Admins. It shows an aggregated view of the founding team's psychometric profiles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <h4 className="font-semibold mb-2">Team Composition ({teamMembers.length})</h4>
                            <div className="flex -space-x-2 overflow-hidden">
                                {teamMembers.map(member => (
                                     <TooltipProvider key={member.id}>
                                         <Tooltip>
                                            <TooltipTrigger asChild>
                                                 <Avatar className="inline-block h-10 w-10 rounded-full ring-2 ring-background">
                                                    <AvatarImage src={`https://avatar.vercel.sh/${member.name}.png`} alt={member.name} />
                                                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                                </Avatar>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{member.name}</p></TooltipContent>
                                         </Tooltip>
                                     </TooltipProvider>
                                ))}
                            </div>
                         </div>
                         <div className="space-y-2">
                             <h4 className="font-semibold">Team SWOT Analysis (Mock)</h4>
                             <p className="text-sm"><strong className="font-medium text-green-600">Strengths:</strong> Strong technical expertise in AI/ML.</p>
                             <p className="text-sm"><strong className="font-medium text-red-600">Weaknesses:</strong> Lack of sales and marketing experience.</p>
                             <p className="text-sm"><strong className="font-medium text-blue-600">Opportunities:</strong> Leverage university network for pilot users.</p>
                             <p className="text-sm"><strong className="font-medium text-orange-600">Threats:</strong> High competition from established players.</p>
                         </div>
                      </div>
                       <div className="mt-4">
                            <h4 className="font-semibold">Upskilling & Hiring Recommendation</h4>
                            <p className="text-sm text-muted-foreground mt-1">Based on the analysis, the team should focus on acquiring a co-founder or early hire with a strong background in Business Development to address the go-to-market gap.</p>
                        </div>
                    </CardContent>
                  </Card>
                  <Separator />
                  </>
                )}

=======
            </motion.header>
>>>>>>> 5faf3aa18a1eb274513c8bf2e6da66f417e7bc8e

            {report.input && (
                <Section title="1. Input & AI Understanding" icon={Lightbulb}>
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="font-semibold text-blue-800 mb-2">User's Idea:</p>
                        <p className="text-gray-700 mb-4 whitespace-pre-wrap">"{report.input.user_idea}"</p>
                        <p className="font-semibold text-blue-800 mb-2">AI's Understanding:</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{report.input.ai_understanding}</p>
                    </div>
<<<<<<< HEAD
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
=======
                </Section>
>>>>>>> 5faf3aa18a1eb274513c8bf2e6da66f417e7bc8e
            )}

            <Section title="2. Executive Summary" icon={AlignJustify}>
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
                <div className="w-full md:w-1/3 text-center p-6 bg-blue-50 rounded-xl">
                <p className="text-6xl font-extrabold text-blue-600">{report.overallScore}</p>
                <p className="mt-2 text-lg font-semibold text-blue-800">Overall Score</p>
                </div>
                <div className="w-full md:w-2/3">
                <p className="text-lg font-semibold text-gray-800 mb-2">Outcome:</p>
                <p className="text-base leading-relaxed text-gray-600">{report.executiveSummary.outcome}</p>
                <p className="mt-4 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{report.executiveSummary.summary}</p>
                </div>
            </div>
            </Section>
            
            <Section title="3. Key Strengths & Weaknesses" icon={Award}>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                <h3 className="flex items-center text-xl font-bold mb-4 text-green-700"><Check className="mr-2" /> Key Strengths</h3>
                <div className="space-y-6">
                    {report.keyStrengthsWeaknesses.strengths.map((s, i) => (
                    <div key={i} className="p-4 rounded-lg bg-green-50 shadow-sm">
                        <p className="font-semibold text-green-800">{s.title}</p>
                        <p className="text-sm text-green-700 mt-1">{s.description}</p>
                    </div>
                    ))}
                </div>
                </div>
                <div>
                <h3 className="flex items-center text-xl font-bold mb-4 text-red-700"><X className="mr-2" /> Key Weaknesses</h3>
                <div className="space-y-6">
                    {report.keyStrengthsWeaknesses.weaknesses.map((w, i) => (
                    <div key={i} className="p-4 rounded-lg bg-red-50 shadow-sm">
                        <p className="font-semibold text-red-800">{w.title}</p>
                        <p className="text-sm text-red-700 mt-1">{w.description}</p>
                    </div>
                    ))}
                </div>
                </div>
            </div>
            </Section>

            {report.criticalRisksAndMitigation && Array.isArray(report.criticalRisksAndMitigation) && (
                <Section title="4. Critical Risks & Mitigation Strategies" icon={Shield}>
                <div className="space-y-6">
                    {report.criticalRisksAndMitigation.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="font-bold text-red-700 text-lg mb-2">Risk: {item.risk}</p>
                        <p className="text-gray-700 mb-2">Description: {item.description}</p>
                        <p className="text-gray-700 mb-2"><span className="font-semibold">Impact:</span> {item.impact}</p>
                        <p className="text-gray-700"><span className="font-semibold">Mitigation:</span> {item.mitigation}</p>
                    </div>
                    ))}
                </div>
                </Section>
            )}
            
            <Section title="5. Competitive Analysis" icon={Handshake}>
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg mb-6">
                <h5 className="font-semibold text-yellow-800 mb-2">User Provided Competitors:</h5>
                <p className="text-gray-700 whitespace-pre-wrap">{report.competitiveAnalysis.user_provided_competitors}</p>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-2">AI's Inference:</p>
            <p className="text-gray-700 mb-4">{report.competitiveAnalysis.ai_inference}</p>
            <CompetitiveAnalysisTable competitors={report.competitiveAnalysis.competitors} />
            {report.competitiveAnalysis.recommendations.length > 0 && (
                <div className="mt-4">
                <p className="font-semibold text-gray-700">AI Recommendations:</p>
                <ul className="list-disc list-inside text-gray-600">
                    {report.competitiveAnalysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                </ul>
                </div>
            )}
            </Section>

            <Section title="6. Detailed Pricing & Financials" icon={DollarSign}>
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg mb-6">
                <h5 className="font-semibold text-yellow-800 mb-2">User Provided Financials:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                <li><span className="font-medium">Pricing Model:</span> {report.detailedPricingAndFinancials.user_provided_pricing_model}</li>
                <li><span className="font-medium">Estimated Price:</span> {report.detailedPricingAndFinancials.user_provided_estimated_price}</li>
                </ul>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-2">AI's Analysis:</p>
            <p className="text-gray-700 mb-4">{report.detailedPricingAndFinancials.ai_pricing_inference}</p>
            <div className="grid md:grid-cols-2 gap-4 text-gray-700 mb-6">
                <div>
                <p><span className="font-semibold">Recommended Pricing Model:</span> {report.detailedPricingAndFinancials.recommended_pricing_model}</p>
                <p><span className="font-semibold">Estimated Premium Price:</span> ₹{report.detailedPricingAndFinancials.estimated_premium_price}</p>
                <p><span className="font-semibold">Estimated COGS/User:</span> ₹{report.detailedPricingAndFinancials.estimated_cogs_per_user}</p>
                </div>
                <div>
                <p className="font-semibold">Cost Breakdown:</p>
                <ul className="list-disc list-inside">
                    {report.detailedPricingAndFinancials.cost_breakdown.map((item, i) => (
                    <li key={i}>{item.item}: ₹{item.cost}</li>
                    ))}
                </ul>
                </div>
            </div>
            <p className="font-semibold text-gray-700">AI's Suggestions:</p>
            <ul className="list-disc list-inside text-gray-600">
                {report.detailedPricingAndFinancials.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
            </Section>
            
            <Section title="7. Prioritized Next Steps / Action Plan" icon={Rocket}>
            <div className="space-y-6">
                <ActionPlanCategory title="Urgent (Next 1-3 Months)" items={report.actionPlan.urgent} />
                <ActionPlanCategory title="High Priority (Next 3-6 Months)" items={report.actionPlan.highPriority} />
                <ActionPlanCategory title="Mid Priority (Next 6-12 Months)" items={report.actionPlan.midPriority} />
            </div>
            </Section>

            <Section title="8. Detailed Idea Validation & Scoring" icon={Search}>
            <div className="space-y-10">
                {report.detailedIdeaValidationAndScoring.map((param, index) => (
                <DetailedScoringBlock key={index} parameter={param} />
                ))}
            </div>
            </Section>
            
            <Section title="9. AI Research Agent Findings" icon={Zap}>
            <p className="text-gray-700 mb-4">{report.aiResearchAgentFindings.summary}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
                {report.aiResearchAgentFindings.findings.map((item, index) => (
                <li key={index}>{item.finding}</li>
                ))}
            </ul>
            </Section>
            
            <Section title="10. IP & Research Paper Analysis" icon={Layers}>
            <p className="text-gray-700 mb-4">{report.ipAndResearchPaperAnalysis.summary}</p>
            <p className="font-semibold text-gray-700">Relevant Research Papers:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
                {report.ipAndResearchPaperAnalysis.papers.map((paper, index) => (
                <li key={index}>
                    <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {paper.title}
                    </a>
                </li>
                ))}
            </ul>
            </Section>

            <Section title="11. Consolidated Sources of Information" icon={Globe}>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
                {report.sources.map((source, index) => (
                <li key={index}>
                    {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {source.text}
                    </a>
                    ) : (
                    <p>{source.text}</p>
                    )}
                </li>
                ))}
            </ul>
            </Section>

            <Section title="12. Professional Disclaimer" icon={Info}>
            <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">{report.disclaimer}</p>
            </Section>
        </div>
        </div>
    </div>
  );
};


export default function IdeaReportPageWrapper() {
  const { ideaId } = useParams() as { ideaId: string };
  const idea = MOCK_IDEAS.find((i) => i.id === ideaId);

  if (!idea) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Finding Idea...</h2>
        <p className="text-muted-foreground">
            The requested idea could not be found. It may have been removed or the ID is incorrect.
        </p>
        <Button asChild className="mt-6">
            <Link href={`/dashboard/ideas?role=${ROLES.INNOVATOR}`}>Go to My Ideas</Link>
        </Button>
      </div>
    );
  }

  return <ReportPage idea={idea} />;
}

    