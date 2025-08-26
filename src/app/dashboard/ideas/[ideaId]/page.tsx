

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
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MOCK_IDEAS, STATUS_COLORS, MOCK_CONSULTATIONS, MOCK_TTCS } from '@/lib/mock-data';
import type { ValidationReport } from '@/ai/schemas';
import { ROLES } from '@/lib/constants';
import { ArrowLeft, Download, ThumbsUp, Lightbulb, RefreshCw, MessageSquare, TrendingUp, TrendingDown, Star, Share2, Copy, CalendarIcon, ChevronRight, CheckCircle2 } from 'lucide-react';
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
import { Logo, StaciaLogo } from '@/components/icons';


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
    if (!report || !spiderChartRef.current) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Report data is not available for download.',
        });
        return;
    }

    const doc = new jsPDF('p', 'pt', 'a4');
    const margins = { top: 60, bottom: 60, left: 40, right: 40 };
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margins.left - margins.right;
    let y = margins.top;

    const themeColors = {
        primary: '#20639B', // Dark Blue
        accent: '#3CAEA3',  // Teal
        text: '#333333',
        muted: '#666666',
        background: '#FFFFFF',
        lightGray: '#F0F4F8',
        green: '#10B981',
        orange: '#F59E0B',
        red: '#EF4444',
    };

    const addHeaderFooter = () => {
        const pageCount = doc.internal.pages.length;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            // Footer
            doc.setFontSize(8);
            doc.setTextColor(themeColors.muted);
            doc.text(`Page ${i} of ${pageCount}`, margins.left, pageHeight - 30);
            doc.text(`Powered by Stacia Corp`, pageWidth - margins.right, pageHeight - 30, { align: 'right' });
            doc.setDrawColor(themeColors.lightGray);
            doc.line(margins.left, pageHeight - 40, pageWidth - margins.right, pageHeight - 40);
        }
    };
    
    const checkPageBreak = (requiredHeight: number) => {
        if (y + requiredHeight > pageHeight - margins.bottom) {
            doc.addPage();
            y = margins.top;
        }
    };

    const addTitle = (text: string, size = 22, spacing = 30) => {
        checkPageBreak(spacing * 2);
        doc.setFontSize(size);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(themeColors.primary);
        doc.text(text, margins.left, y);
        y += spacing;
    };
    
    const addSubTitle = (text: string, size = 14, spacing = 25) => {
        checkPageBreak(spacing * 2);
        doc.setFontSize(size);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(themeColors.text);
        doc.text(text, margins.left, y);
        y += spacing;
    };

    const addBodyText = (text: string | string[], size = 10, spacing = 15) => {
        if (!text) return;
        checkPageBreak(spacing * 2);
        const splitText = doc.splitTextToSize(text, contentWidth);
        doc.setFontSize(size);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(themeColors.muted);
        doc.text(splitText, margins.left, y);
        y += (Array.isArray(splitText) ? splitText.length : 1) * size * 1.2;
    };
    
     const addKeyValue = (key: string, value: string | number) => {
        checkPageBreak(20);
        const keyText = `${key}: `;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(themeColors.text);
        
        const valueLines = doc.splitTextToSize(String(value), contentWidth - doc.getTextWidth(keyText));
        doc.text(keyText, margins.left, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(themeColors.muted);
        doc.text(valueLines, margins.left + doc.getTextWidth(keyText), y);
        y += (Array.isArray(valueLines) ? valueLines.length : 1) * 10 * 1.2 + 5;
    };

    const drawScoreMeter = (x: number, c_y: number, score: number) => {
        const radius = 15;
        const scoreColor = score >= 85 ? themeColors.green : score >= 50 ? themeColors.orange : themeColors.red;
        
        doc.setDrawColor(themeColors.lightGray);
        doc.setLineWidth(4);
        doc.circle(x, c_y, radius, 'S');

        const angle = (score / 100) * 360;
        doc.setDrawColor(scoreColor);
        doc.setLineWidth(4);
        for (let i = 0; i < angle; i++) {
            const rad = (i - 90) * (Math.PI / 180);
            doc.line(x + radius * Math.cos(rad), c_y + radius * Math.sin(rad), x + radius * Math.cos(rad), c_y + radius * Math.sin(rad));
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(scoreColor);
        doc.text(String(score), x, c_y, { align: 'center', baseline: 'middle' });
    };

    
    // --- PDF Generation ---
    // Cover Page
    doc.setFillColor(themeColors.primary);
    doc.rect(0, 0, pageWidth, pageHeight / 2, 'F');
    doc.setFillColor(themeColors.background);
    doc.rect(0, pageHeight / 2, pageWidth, pageHeight / 2, 'F');

    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(themeColors.background);
    doc.text('PragatiAI Validation Report', centerX, pageHeight / 3, { align: 'center' });
    doc.setFontSize(24);
    doc.setTextColor(themeColors.background);
    doc.text(report.ideaName, centerX, pageHeight / 3 + 40, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(themeColors.text);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, centerX, pageHeight / 2 + 30, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(themeColors.muted);
    const idText = `Idea ID: ${report.ideaId} | Validation ID: ${report.validationId} | Report ID: ${report.reportId}`;
    doc.text(idText, centerX, pageHeight / 2 + 50, { align: 'center' });
    
    // Executive Summary
    doc.addPage();
    y = margins.top;
    addTitle('Executive Summary');
    addKeyValue('Idea Name', report.sections.executiveSummary.ideaName);
    addKeyValue('Concept', report.sections.executiveSummary.concept);
    addKeyValue('Overall Score', report.sections.executiveSummary.overallScore.toFixed(2));
    addKeyValue('Outcome', report.sections.executiveSummary.validationOutcome);
    addKeyValue('Recommendation', report.sections.executiveSummary.recommendation);
    y += 20;

    // Spider Chart
    try {
        const canvas = await html2canvas(spiderChartRef.current, { scale: 2, backgroundColor: null });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth * 0.8;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        checkPageBreak(imgHeight + 40);
        addTitle('Cluster Performance Overview');
        doc.addImage(imgData, 'PNG', centerX - imgWidth/2, y, imgWidth, imgHeight);
        y += imgHeight + 20;
    } catch (error) {
        console.error("Failed to render spider chart", error);
        addBodyText("Error: Could not render spider chart.", 10);
    }

    // Detailed Assessment
    addTitle('Detailed Viability Assessment');

    for (const [clusterName, clusterData] of Object.entries(report.sections.detailedEvaluation.clusters)) {
        checkPageBreak(80);
        doc.setFillColor(themeColors.lightGray);
        doc.roundedRect(margins.left, y - 5, contentWidth, 30, 5, 5, 'F');
        addSubTitle(clusterName, 14, 20);
        y += 10;
        
        for (const [paramName, paramData] of Object.entries(clusterData)) {
            checkPageBreak(60);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(themeColors.text);
            doc.text(`- ${paramName}`, margins.left + 10, y);
            y += 20;
            for (const [subParamName, subParamDetails] of Object.entries(paramData as any)) {
                 if (subParamDetails.assignedScore) {
                    checkPageBreak(70);
                    
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(themeColors.text);
                    doc.text(subParamName, margins.left + 20, y + 5);

                    drawScoreMeter(margins.left + 150, y + 5, subParamDetails.assignedScore);
                    
                    const textX = margins.left + 180;
                    const textWidth = contentWidth - 180;
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(themeColors.muted);
                    const wentWellLines = doc.splitTextToSize(`Well: ${subParamDetails.whatWentWell}`, textWidth);
                    doc.text(wentWellLines, textX, y);
                    y += (wentWellLines.length * 10 * 1.2);

                    const improveLines = doc.splitTextToSize(`Improve: ${subParamDetails.whatCanBeImproved}`, textWidth);
                    doc.text(improveLines, textX, y);
                    y += (improveLines.length * 10 * 1.2) + 15;
                 }
            }
        }
    }

    // Conclusion & Recommendations
    checkPageBreak(100);
    addTitle('Conclusion & Recommendations');
    addSubTitle('Conclusion');
    addBodyText(report.sections.conclusion.content);
    y += 10;
    addSubTitle('Recommendations');
    report.sections.recommendations.items.forEach(item => {
        addBodyText(`• ${item}`);
    });
    
    addHeaderFooter();

    doc.save(`${ideaId}-PragatiAI-Report.pdf`);
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
    const points = [];
    const hasIPRisk = bottomPerformers.some(p => p.name.includes("Intellectual Property"));
    const hasMarketRisk = bottomPerformers.some(p => p.name.includes("Market Risk"));
    const hasOperationalRisk = bottomPerformers.some(p => p.name.includes("Operational Risk"));

    if (hasIPRisk) {
        points.push({
            title: "Strengthen Defensibility Strategy",
            todos: [
                "Consult with a legal expert on patentability of core algorithms.",
                "Research alternative 'moats' like proprietary data sets or network effects.",
                "Document trade secrets and internal know-how securely.",
            ]
        });
    }
     if (hasMarketRisk) {
        points.push({
            title: "Refine Market Entry Plan",
            todos: [
                "Conduct surveys with at least 50 potential customers to validate willingness-to-pay.",
                "Develop a detailed competitor analysis matrix.",
                "Create a phased go-to-market strategy, starting with a niche segment.",
            ]
        });
    }
     if (hasOperationalRisk) {
        points.push({
            title: "Develop Operational Mitigation Plan",
            todos: [
                "Identify potential data pipeline bottlenecks and solutions.",
                "Outline a farmer support system (e.g., chatbot, FAQ, local reps).",
                "Create a budget for initial operational costs for the first year.",
            ]
        });
    }
    if (points.length === 0 && bottomPerformers.length > 0) {
        points.push({
            title: `Address Lowest Score: ${bottomPerformers[0].name}`,
            todos: [
                `Review the feedback for '${bottomPerformers[0].name}' in the detailed assessment.`,
                `Brainstorm 3-5 ways to directly improve this aspect.`,
                `Update your pitch deck to reflect these improvements.`
            ]
        })
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

  return (
    <>
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
                 {status === "Approved" && (
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
                </div>
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
                      Actionable steps to improve your idea based on the evaluation. Select an action point to see the to-do list.
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
          
          {pastConsultations.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Consultation History</CardTitle>
                <CardDescription>
                  Review of past consultations for this idea.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Mentor</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Attachments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastConsultations.map((consultation) => (
                      <TableRow 
                        key={consultation.id} 
                        className="cursor-pointer" 
                        onClick={() => router.push(`/dashboard/consultations?role=${role}`)}
                      >
                        <TableCell>{consultation.date}</TableCell>
                        <TableCell>{consultation.mentor}</TableCell>
                        <TableCell>
                          {consultation.milestones.join(', ')}
                        </TableCell>
                        <TableCell>
                          {consultation.files.map((file, index) => (
                            <Button key={index} variant="link" asChild size="sm" onClick={(e) => e.stopPropagation()}>
                              <a href="#" download>
                                {file}
                              </a>
                            </Button>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

        </div>
    </div>

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
                    <TooltipProvider>
                      <Tooltip><TooltipTrigger asChild><Button asChild variant="outline" size="icon"><a href={`https://api.whatsapp.com/send?text=${shareText} ${shareUrl}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="h-5 w-5" /></a></Button></TooltipTrigger><TooltipContent>WhatsApp</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button asChild variant="outline" size="icon"><a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer"><TwitterIcon className="h-5 w-5" /></a></Button></TooltipTrigger><TooltipContent>X / Twitter</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button asChild variant="outline" size="icon"><a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer"><FacebookIcon className="h-5 w-5" /></a></Button></TooltipTrigger><TooltipContent>Facebook</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button asChild variant="outline" size="icon"><a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${encodeURIComponent(idea?.title || '')}&summary=${shareText}`} target="_blank" rel="noopener noreferrer"><LinkedInIcon className="h-5 w-5" /></a></Button></TooltipTrigger><TooltipContent>LinkedIn</TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button asChild variant="outline" size="icon"><a href={`mailto:?subject=${encodeURIComponent(idea?.title || '')}&body=${shareText} ${shareUrl}`}><MailIcon className="h-5 w-5" /></a></Button></TooltipTrigger><TooltipContent>Email</TooltipContent></Tooltip>
                    </TooltipProvider>
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
    </>
  );
}
