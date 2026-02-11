"use client";

import * as React from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  ThumbsUp,
  Lightbulb,
  RefreshCw,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Star,
  Share2,
  Copy,
  CalendarIcon,
  ChevronRight,
  CheckCircle2,
  UserCheck,
  Shield,
  User,
  Mail,
  Briefcase,
  Users,
  Phone,
  Target,
  TrendingDownIcon,
  Bot,
  Clock,
  PlusCircle,
  Trash2,
  Send,
  FileText,
  ChevronLeft,
  Leaf,
  HeartPulse,
  GraduationCap,
  Landmark,
  ShoppingCart,
  Building2,
  History,
  ChevronDown,
  AlertTriangle,
  Briefcase as BriefcaseIcon,
  TrendingUpIcon,
  Rocket,
  Zap,
  Activity,
  Calculator,
  Scale,
  Eye,
  AlertCircle,
  Award,
  Box,
  Cpu,
  DollarSign,
  Info,
  Layout,
  Search,
  Settings,
  X,
  XCircle,
  Grid3x3,
  Map as MapIcon,
  ListChecks,
  ArrowRight,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SpiderChart } from "@/components/spider-chart";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  FacebookIcon,
  LinkedInIcon,
  TwitterIcon,
  WhatsAppIcon,
  MailIcon,
} from "@/components/social-icons";
import { ScoreDisplay } from "@/components/score-display";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Roadmap } from "@/components/roadmap";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ROLES } from "@/lib/constants";
import html2pdf from "html2pdf.js";
import { useIdeaConsultation } from "@/hooks/useConsultations";

const getBackLink = (role: string | null) => {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return `/dashboard/admin/ideas?role=${role}`;
    case ROLES.COORDINATOR:
      return `/dashboard/coordinator/feedback?role=${role}`;
    case ROLES.PRINCIPAL:
      return `/dashboard/principal/ideas?role=${role}`;
    case ROLES.MENTOR:
      return `/dashboard/mentor/consultations?role=${role}`;
    default:
      return `/dashboard/ideas?role=${ROLES.INNOVATOR}`;
  }
};

interface ReportData {
  title: string;
  _id: string;
  validation_outcome: string;
  validationOutcome?: string;
  overall_score: number;
  overallScore?: number;
  status?: string;
  cluster_scores: Record<string, number>;
  detailedViabilityAssessment: {
    clusters: Record<string, Record<string, Record<string, any>>>;
  };
  roadmap: {
    current_trl: number;
    key_activities: string[];
  };
  created_at: string;
  createdAt?: string;
  businessCaseJson?: any;
  riskAssessmentJson?: any;
  strategicGrowthViabilityJson?: any;
  validationResult?: {
    version_comparison?: {
      evolution_summary?: Array<any>;
      feature_comparison_table?: Array<any>;
      score_progression?: Array<any>;
      risk_mitigation_log?: Array<any>;
      final_verdict?: string;
    };
  };
}

interface Consultation {
  id: string;
  ideaId: string;
  title: string;
  date: string;
  status: string;
  agenda: string[];
  pointsDiscussed: string[];
  actionItems: Array<{ task: string; owner: string; dueDate: string }>;
  nextSteps: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  collegeId: string;
  credits: number;
  status: "active" | "pending" | "accepted" | "declined";
  hasPsychometricAnalysis: boolean;
  expertise?: string[];
}

interface Comment {
  id: string;
  authorName: string;
  authorEmail: string;
  text: string;
  timestamp: string;
}

const domainIcons: Record<string, React.ElementType> = {
  HealthTech: HeartPulse,
  EdTech: GraduationCap,
  FinTech: Landmark,
  Agriculture: Leaf,
  Retail: ShoppingCart,
  "Smart Cities": Building2,
};

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-500 text-white",
  under_review: "bg-yellow-500 text-white",
  approved: "bg-green-500 text-white",
  rejected: "bg-red-500 text-white",
  draft: "bg-gray-500 text-white",
  Approved: "bg-green-100 text-green-800",
  validation_outcome: "bg-yellow-100 text-yellow-800",
  Rejected: "bg-red-100 text-red-800",
  Scheduled: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Slay: "bg-purple-100 text-purple-800",
  Mid: "bg-orange-100 text-orange-800",
  Flop: "bg-gray-100 text-gray-800",
};

export default function IdeaReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const params = useParams();
  console.log("Token", searchParams.get("token"));

  const urlToken = searchParams.get("token");
  const ideaId = searchParams.get("id") || "";
  const { toast } = useToast();
  const reportRef = React.useRef<HTMLDivElement>(null);
  const spiderChartRef = React.useRef<HTMLDivElement>(null);

  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const [isMomDialogOpen, setIsMomDialogOpen] = React.useState(false);
  const [selectedConsultationForMom, setSelectedConsultationForMom] =
    React.useState<Consultation | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date(),
  );
  const [activeActionPoint, setActiveActionPoint] = React.useState(0);
  const [openAccordionItems, setOpenAccordionItems] = React.useState<string[]>(
    [],
  );
  const [openParameterItems, setOpenParameterItems] = React.useState<string[]>(
    [],
  );
  const [selectedSubParameter, setSelectedSubParameter] = React.useState<{
    clusterName: string;
    paramName: string;
    subParamName: string;
  } | null>(null);

  const highlightTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isVersionSwitching, setIsVersionSwitching] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);
  const [shareUrl, setShareUrl] = React.useState("");

  const role = searchParams.get("role");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Cleanup effect for highlight timeout
  React.useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);
  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const token = getToken();

  // ✅ Fetch consultation details
  const { data: consultationData, isLoading: consultationLoading } =
    useIdeaConsultation(ideaId);

  const [avgClusterScores, setAvgClusterScores] = React.useState({});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reportMetaData, setReportMetaData] = React.useState<any>({});
  const [versionHistory, setVersionHistory] = React.useState([]);

  // Fetch report data
  const {
    data: reportData,
    isLoading,
    error,
  } = useQuery<ReportData>({
    queryKey: ["report", ideaId],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/reports/${ideaId}`, {
        headers: { Authorization: `Bearer ${urlToken ? urlToken : token}` },
      });
      console.log(data);
      console.log(data.meta);
      console.log(data.versionHistory);
      setReportMetaData(data.meta);
      setVersionHistory(data.versionHistory);

      if (data?.data?.detailedAnalysis?.cluster_analyses) {
        console.log(data.data.detailedAnalysis.cluster_analyses);
        const clusterScores: Record<string, number> = {};

        Object.entries(data.data.detailedAnalysis.cluster_analyses).forEach(
          ([clusterName, clusterData]) => {
            // clusterData.score contains the average score for the cluster
            clusterScores[clusterName] = Math.round(
              (clusterData as { score: number }).score,
            );
          },
        );

        setAvgClusterScores(clusterScores);
        // console.log(clusterScores);
      }
      return data.data;
    },
    enabled: !!ideaId,
  });

  // Process data for UI
  const { topPerformers, bottomPerformers } = React.useMemo(() => {
    if (!reportData) {
      return {
        topPerformers: [],
        bottomPerformers: [],
      };
    }

    const top: Array<{
      clusterName: string;
      paramName: string;
      name: string;
      score: number;
    }> = [];
    const bottom: Array<{
      clusterName: string;
      paramName: string;
      name: string;
      score: number;
    }> = [];

    const clusterScores: Record<string, number> = {};

    // Process cluster scores for spider chart
    if (reportData.cluster_scores) {
      Object.entries(reportData.cluster_scores).forEach(([cluster, score]) => {
        clusterScores[cluster] = Math.round(score);
      });
    }

    // Process top and bottom performers
    if (reportData?.detailedViabilityAssessment?.clusters) {
      Object.entries(reportData?.detailedViabilityAssessment?.clusters).forEach(
        ([clusterName, params]) => {
          Object.entries(params).forEach(([paramName, subParams]) => {
            Object.entries(subParams).forEach(([subParamName, data]) => {
              if (data?.assignedScore !== undefined) {
                const score = data.assignedScore;
                if (score >= 85) {
                  top.push({
                    clusterName,
                    paramName,
                    name: subParamName,
                    score,
                  });
                } else if (score < 70) {
                  bottom.push({
                    clusterName,
                    paramName,
                    name: subParamName,
                    score,
                  });
                }
              }
            });
          });
        },
      );
    }

    top.sort((a, b) => b.score - a.score);
    bottom.sort((a, b) => a.score - b.score);

    return {
      topPerformers: top.slice(0, 3),
      bottomPerformers: bottom.slice(0, 3),
    };
  }, [reportData]);

  const handleHighlightClick = (
    clusterName: string,
    paramName: string,
    subParamName: string,
  ) => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    setOpenAccordionItems((prev) =>
      prev.includes(clusterName) ? prev : [...prev, clusterName],
    );

    const paramKey = `${clusterName}|${paramName}`;
    setOpenParameterItems((prev) =>
      prev.includes(paramKey) ? prev : [...prev, paramKey],
    );

    setSelectedSubParameter({ clusterName, paramName, subParamName });

    setTimeout(() => {
      const elementId = `sub-param-${subParamName.replace(
        /[^a-zA-Z0-9]/g,
        "-",
      )}`;
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-2", "ring-primary", "bg-primary/5");

        highlightTimeoutRef.current = setTimeout(() => {
          element.classList.remove("ring-2", "ring-primary", "bg-primary/5");
          setSelectedSubParameter(null);
        }, 3000);
      }
    }, 500);
  };

  // const handleDownload = async () => {
  //   if (!reportRef.current) return;

  //   // Store original state
  //   const originalAccordionItems = [...openAccordionItems];
  //   const originalParameterItems = [...openParameterItems];

  //   try {
  //     // Expand all clusters
  //     const allClusterNames = reportData?.detailedViabilityAssessment?.clusters
  //       ? Object.keys(reportData.detailedViabilityAssessment.clusters)
  //       : [];
  //     setOpenAccordionItems(allClusterNames);

  //     // Expand all parameters
  //     const allParameterKeys: string[] = [];
  //     if (reportData?.detailedViabilityAssessment?.clusters) {
  //       Object.entries(reportData.detailedViabilityAssessment.clusters).forEach(
  //         ([clusterName, clusterData]) => {
  //           Object.keys(clusterData).forEach((paramName) => {
  //             allParameterKeys.push(`${clusterName}|${paramName}`);
  //           });
  //         }
  //       );
  //     }
  //     setOpenParameterItems(allParameterKeys);

  //     // Wait for accordions to expand
  //     await new Promise((resolve) => setTimeout(resolve, 500));

  //     const element = reportRef.current;
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     const opt: any = {
  //       margin: [10, 10, 10, 10],
  //       filename: `${ideaId}-PragatiAI-Report.pdf`,
  //       image: { type: "jpeg", quality: 0.98 },
  //       html2canvas: { scale: 2, useCORS: true },
  //       jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
  //     };

  //     await html2pdf().set(opt).from(element).save();

  //     toast({
  //       title: "Success",
  //       description: "PDF downloaded successfully!",
  //     });
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to generate PDF. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     // Restore original state
  //     setOpenAccordionItems(originalAccordionItems);
  //     setOpenParameterItems(originalParameterItems);
  //   }
  // };

  const handleDownload = async () => {
    try {
      // Show loading toast
      const loadingToast = toast({
        title: "Generating PDF...",
        description: "Please wait while we prepare your report.",
        duration: Infinity,
      });

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Call the backend API to generate PDF
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportData?._id}/infographic-pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // Important: receive as blob
        },
      );

      // Create a download link
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = `${ideaId}-PragatiAI-Report.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Dismiss loading toast and show success
      loadingToast.dismiss();
      toast({
        title: "Success",
        description: "PDF downloaded successfully!",
      });
    } catch (error: any) {
      console.error("PDF download error:", error);

      toast({
        title: "Error",
        description:
          error?.response?.data?.error ||
          "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareClick = async () => {
    try {
      setIsSharing(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reports/share/${ideaId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.token) {
        const shareToken = response.data.token;

        const baseUrl =
          process.env.NEXT_PUBLIC_PLATFORM_URL || window.location.origin;
        const urlObj = new URL("/dashboard/ideas/details/", baseUrl);
        urlObj.searchParams.set("id", ideaId);
        urlObj.searchParams.set("role", "guest");
        urlObj.searchParams.set("token", shareToken);

        setShareUrl(urlObj.toString());
        setIsShareDialogOpen(true);
      } else {
        throw new Error("Failed to generate share token");
      }
    } catch (error: any) {
      console.error("Share error:", error);
      toast({
        title: "Error",
        description: "Failed to generate share link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied!",
          description:
            "The secure report link has been copied to your clipboard.",
        });
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          toast({
            title: "Link Copied!",
            description:
              "The secure report link has been copied to your clipboard.",
          });
        } catch (err) {
          console.error("Fallback: Oops, unable to copy", err);
          toast({
            title: "Error",
            description: "Failed to copy link. Please try manually.",
            variant: "destructive",
          });
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Error",
        description: "Failed to copy link. Please try manually.",
        variant: "destructive",
      });
    }
  };

  const handleViewMom = (consultation: Consultation) => {
    setSelectedConsultationForMom(consultation);
    setIsMomDialogOpen(true);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("");

  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return "text-muted-foreground";
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  // Mock data for UI elements that still need API integration
  const MOCK_IDEAS = [
    {
      id: ideaId,
      title: reportData?.title || "Loading...",
      description:
        "A comprehensive health monitoring solution using AI to predict and prevent diseases",
      domain: "HealthTech",
      subDomain: "Digital Health",
      status: reportData?.validation_outcome || "Approved",
      innovatorId: "USER-001",
      collegeId: "COLLEGE-001",
      trl: 3,
      clusterWeights: {},
      locality: "Bangalore",
      ttcAssigned: "TTC-001",
      externalMentorId: "USER-002",
      createdAt: reportData?.created_at || new Date().toISOString(),
    },
  ];

  const MOCK_CONSULTATIONS: Consultation[] = [
    {
      id: "CONS-001",
      ideaId: ideaId,
      title: "Technical Feasibility Review",
      date: "2024-02-15",
      status: "Scheduled",
      agenda: ["Review architecture", "Discuss scalability"],
      pointsDiscussed: [
        "Architecture looks solid",
        "Need to consider cloud costs",
      ],
      actionItems: [
        {
          task: "Prepare cost analysis",
          owner: "Team Lead",
          dueDate: "2024-02-20",
        },
        {
          task: "Research cloud providers",
          owner: "Dev Team",
          dueDate: "2024-02-25",
        },
      ],
      nextSteps: "Schedule follow-up meeting after cost analysis",
    },
  ];

  const idea = MOCK_IDEAS[0];
  const DomainIcon = idea.domain ? domainIcons[idea.domain] : null;

  const encodedShareUrl = encodeURIComponent(shareUrl);
  const shareText = encodeURIComponent(
    `Check out my idea report for "${idea.title}" on PragatiAI!`,
  );

  const allClusterNames = reportData?.detailedViabilityAssessment?.clusters
    ? Object.keys(reportData?.detailedViabilityAssessment?.clusters)
    : [];
  const allClustersExpanded =
    openAccordionItems.length > 0 &&
    openAccordionItems.length === allClusterNames.length;

  const handleToggleExpandAll = () => {
    if (allClustersExpanded) {
      setOpenAccordionItems([]);
    } else {
      setOpenAccordionItems(allClusterNames);
    }
  };

  const [votes, setVotes] = React.useState(27);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newComment, setNewComment] = React.useState("");

  const handleVote = () => {
    setVotes((prev) => prev + 1);
    toast({ title: "Voted!", description: "Your vote has been counted." });
  };

  const handleSubmitComment = () => {
    if (newComment.trim() === "") return;
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      authorName: "Current User",
      authorEmail: "user@example.com",
      text: newComment,
      timestamp: "Just now",
    };
    setComments((prev) => [comment, ...prev]);
    setNewComment("");
    toast({
      title: "Comment Posted",
      description: "Your feedback has been added.",
    });
  };

  // Loading state
  const showLoading = isLoading || isVersionSwitching;

  if (showLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background/80 backdrop-blur-sm fixed inset-0 z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-lg font-medium text-foreground animate-pulse">
            {isVersionSwitching
              ? "Switching version..."
              : "Loading idea report..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !reportData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Error Loading Report</h2>
        <p className="text-muted-foreground mt-2">
          {error?.message || "Report not found"}
        </p>
        <Button asChild className="mt-4">
          <div onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </div>
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {urlToken ? (
          ""
        ) : (
          <div className="flex justify-between items-center flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="cursor-pointer"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="flex gap-2">
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>

              <Button
                variant="outline"
                onClick={handleShareClick}
                disabled={isSharing}
              >
                {isSharing ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                ) : (
                  <Share2 className="mr-2 h-4 w-4" />
                )}
                {isSharing ? "Generating..." : "Share"}
              </Button>
            </div>
          </div>
        )}

        <div ref={reportRef} className="p-4 bg-background">
          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div>
                <CardTitle className="text-2xl">{reportData.title}</CardTitle>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground pt-2">
                  <span>ID: IDE-{ideaId?.slice(12, 20)}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm text-muted-foreground"
                      >
                        {`Version: V${reportMetaData.currentVersion || "1.0"}`}
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Version History</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {versionHistory && versionHistory.length > 0 ? (
                        versionHistory.map((version: any) => (
                          <DropdownMenuItem
                            key={version?.version}
                            className={cn(
                              "flex justify-between gap-4 cursor-pointer",
                              reportMetaData.currentVersion ===
                                version?.version && "bg-muted font-bold",
                            )}
                            disabled={
                              reportMetaData.currentVersion === version?.version
                            }
                            onClick={() => {
                              if (version?.versionId) {
                                setIsVersionSwitching(true);
                                const params = new URLSearchParams(
                                  searchParams.toString(),
                                );
                                params.set("id", version.versionId);
                                router.push(`?${params.toString()}`);

                                // Artificial delay to show loading state
                                setTimeout(() => {
                                  setIsVersionSwitching(false);
                                }, 800);
                              }
                            }}
                          >
                            <span className="font-medium">
                              V{version?.version}
                              {reportMetaData.currentVersion ===
                                version?.version && " (Current)"}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {new Date(
                                version?.submittedAt || version?.created_at,
                              ).toLocaleDateString("en-GB")}
                            </span>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem disabled>
                          No history available
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <span>
                    Submitted:{" "}
                    {new Date(
                      reportData.createdAt || reportData.created_at,
                    ).toLocaleDateString("en-GB")}
                  </span>
                  <span>
                    Status:{" "}
                    <Badge
                      className={cn(
                        STATUS_COLORS[
                          reportData.validationOutcome ||
                            reportData.validation_outcome
                        ],
                      )}
                    >
                      {reportData.validationOutcome ||
                        reportData.validation_outcome}
                    </Badge>
                  </span>
                  {idea.domain && (
                    <span className="flex items-center gap-1.5">
                      {DomainIcon && <DomainIcon className="h-4 w-4" />}
                      {idea.domain}
                    </span>
                  )}
                </div>
              </div>
              <ScoreDisplay
                score={
                  reportData?.overallScore ?? reportData?.overall_score ?? null
                }
                status={
                  reportData?.status ||
                  reportData?.validationOutcome ||
                  reportData?.validation_outcome ||
                  ""
                }
              />
            </CardHeader>

            <CardContent className="space-y-8 pt-2">
              {/* ✅ Consultation Status Card */}
              <ConsultationStatusCard
                consultation={consultationData}
                loading={consultationLoading}
              />

              {reportData.roadmap && (
                <>
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span>Project Roadmap</span>
                      </CardTitle>
                      <CardDescription>
                        Your idea's current position on the path from concept to
                        market.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Roadmap
                        currentTrl={String(reportData.roadmap.current_trl)}
                        role={role || ROLES.INNOVATOR}
                        keyActivities={reportData.roadmap.key_activities?.map(
                          (
                            activity:
                              | string
                              | { text: string; timeline: string },
                          ) => ({
                            text:
                              typeof activity === "string"
                                ? activity
                                : activity.text || "",
                            timeline:
                              typeof activity === "string"
                                ? ""
                                : activity.timeline || "",
                          }),
                        )}
                      />
                    </CardContent>
                  </Card>
                  <Separator />
                </>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Cluster Performance</h3>
                  <p className="text-sm text-muted-foreground">
                    Average scores across the main evaluation clusters.
                  </p>
                  <div
                    ref={spiderChartRef}
                    className="h-[350px] flex items-center justify-center"
                  >
                    <SpiderChart
                      data={avgClusterScores}
                      maxScore={100}
                      size={400}
                    />
                  </div>
                </div>

                <Separator orientation="vertical" className="hidden lg:block" />

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Highlights & Lowlights
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Top and bottom performing sub-parameters.
                  </p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-600 flex items-center gap-2">
                        <TrendingUp /> Top Performers
                      </h4>
                      <ul className="mt-2 space-y-1 text-sm">
                        {topPerformers.map((item, i) => (
                          <li key={i}>
                            <button
                              onClick={() =>
                                handleHighlightClick(
                                  item.clusterName,
                                  item.paramName,
                                  item.name,
                                )
                              }
                              className="flex justify-between w-full hover:bg-muted p-1 rounded-md transition-colors text-left"
                            >
                              <span className="text-muted-foreground">
                                {item.name}
                              </span>
                              <span className="font-bold text-green-600">
                                {item.score}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-red-600 flex items-center gap-2">
                        <TrendingDown /> Areas for Improvement
                      </h4>
                      <ul className="mt-2 space-y-1 text-sm">
                        {bottomPerformers.map((item, i) => (
                          <li key={i}>
                            <button
                              onClick={() =>
                                handleHighlightClick(
                                  item.clusterName,
                                  item.paramName,
                                  item.name,
                                )
                              }
                              className="flex justify-between w-full hover:bg-muted p-1 rounded-md transition-colors text-left"
                            >
                              <span className="text-muted-foreground">
                                {item.name}
                              </span>
                              <span className="font-bold text-red-600">
                                {item.score}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Next Steps</h3>
                <p className="text-sm text-muted-foreground">
                  Actionable steps to improve your idea based on the evaluation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="flex flex-col gap-2">
                    {bottomPerformers.slice(0, 3).map((point, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveActionPoint(i)}
                        className={cn(
                          "p-3 rounded-md text-left transition-colors border-l-4",
                          i === activeActionPoint
                            ? "bg-muted border-primary"
                            : "bg-transparent hover:bg-muted/50 border-transparent",
                        )}
                      >
                        <p className="font-semibold">Improve: {point.name}</p>
                      </button>
                    ))}
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Recommended Actions:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>
                          Review feedback for "
                          {bottomPerformers[activeActionPoint]?.name}"
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>Brainstorm improvement strategies</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>Update pitch deck accordingly</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ✅ NEW TABS SECTION - REPLACES "Detailed Viability Assessment" */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    Comprehensive Analysis & Reports
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Explore detailed reports and viability assessments across
                    multiple dimensions
                  </p>
                </div>

                <Tabs defaultValue="business-case" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger
                      value="business-case"
                      className="text-xs sm:text-sm"
                    >
                      <BriefcaseIcon className="h-4 w-4 mr-1" />
                      Business Case
                    </TabsTrigger>
                    <TabsTrigger
                      value="risk-assessment"
                      className="text-xs sm:text-sm"
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Risk Assessment
                    </TabsTrigger>
                    <TabsTrigger
                      value="strategic-growth"
                      className="text-xs sm:text-sm"
                    >
                      <TrendingUpIcon className="h-4 w-4 mr-1" />
                      Strategic Growth
                    </TabsTrigger>
                    <TabsTrigger
                      value="viability"
                      className="text-xs sm:text-sm"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Viability
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB 1: BUSINESS CASE REPORT */}
                  <TabsContent value="business-case" className="space-y-4 mt-6">
                    <BusinessCaseReport data={reportData?.businessCaseJson} />
                  </TabsContent>

                  {/* TAB 2: RISK ASSESSMENT REPORT */}
                  <TabsContent
                    value="risk-assessment"
                    className="space-y-4 mt-6"
                  >
                    <RiskAssessmentReport
                      data={reportData?.riskAssessmentJson}
                    />
                  </TabsContent>

                  {/* TAB 3: STRATEGIC GROWTH & VIABILITY */}
                  <TabsContent
                    value="strategic-growth"
                    className="space-y-4 mt-6"
                  >
                    <StrategicGrowthReport
                      data={reportData?.strategicGrowthViabilityJson}
                    />
                  </TabsContent>

                  {/* TAB 4: DETAILED VIABILITY ASSESSMENT (EXISTING) */}
                  <TabsContent value="viability" className="space-y-4 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-lg font-semibold">
                          Detailed Viability Assessment
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Comprehensive evaluation of all parameters across
                          multiple clusters
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleToggleExpandAll}
                      >
                        {allClustersExpanded ? "Collapse All" : "Expand All"}
                      </Button>
                    </div>
                    <Accordion
                      type="multiple"
                      value={openAccordionItems}
                      onValueChange={setOpenAccordionItems}
                      className="w-full pt-4"
                    >
                      {reportData?.detailedViabilityAssessment?.clusters &&
                        Object.entries(
                          reportData.detailedViabilityAssessment.clusters,
                        ).map(([clusterName, clusterData]) => (
                          <AccordionItem value={clusterName} key={clusterName}>
                            <AccordionTrigger className="text-lg font-semibold text-primary hover:no-underline">
                              {clusterName}
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-0 space-y-4">
                              <Accordion
                                type="multiple"
                                value={openParameterItems}
                                onValueChange={setOpenParameterItems}
                                className="w-full"
                              >
                                {Object.entries(clusterData).map(
                                  ([paramName, paramData]) => {
                                    if (
                                      typeof paramData !== "object" ||
                                      paramData === null
                                    )
                                      return null;

                                    const scores = Object.values(paramData)
                                      .filter(
                                        (p) =>
                                          typeof p === "object" &&
                                          p !== null &&
                                          p.assignedScore !== undefined,
                                      )
                                      .map((p) => p.assignedScore);

                                    const categoryAverage =
                                      scores.length > 0
                                        ? Math.round(
                                            (scores.reduce((a, b) => a + b, 0) /
                                              scores.length) *
                                              100,
                                          ) / 100
                                        : 0;

                                    const paramKey = `${clusterName}|${paramName}`;

                                    return (
                                      <AccordionItem
                                        value={paramKey}
                                        key={paramKey}
                                      >
                                        <AccordionTrigger className="font-semibold mb-2 hover:no-underline">
                                          <div className="flex justify-between items-center w-full pr-2">
                                            <span>{paramName}</span>
                                            <span
                                              className={cn(
                                                "flex items-center justify-center text-base font-bold",
                                                getScoreColor(
                                                  Math.round(categoryAverage),
                                                ),
                                              )}
                                            >
                                              {Math.round(categoryAverage)}
                                            </span>
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                          <div className="divide-y">
                                            {Object.entries(paramData).map(
                                              ([
                                                subParamName,
                                                subParamData,
                                              ]) => {
                                                if (
                                                  typeof subParamData !==
                                                    "object" ||
                                                  subParamData === null ||
                                                  subParamData.assignedScore ===
                                                    undefined
                                                )
                                                  return null;

                                                const score =
                                                  subParamData.assignedScore;
                                                const whatWentWell =
                                                  subParamData.whatWentWell ||
                                                  "No data";
                                                const whatCanBeImproved =
                                                  subParamData.whatCanBeImproved ||
                                                  "No data";
                                                const elementId = `sub-param-${subParamName.replace(
                                                  /[^a-zA-Z0-9]/g,
                                                  "-",
                                                )}`;

                                                const subCircumference =
                                                  2 * Math.PI * 18;
                                                const subStrokeDashoffset =
                                                  subCircumference -
                                                  (score / 100) *
                                                    subCircumference;

                                                const isHighlighted =
                                                  selectedSubParameter?.clusterName ===
                                                    clusterName &&
                                                  selectedSubParameter?.paramName ===
                                                    paramName &&
                                                  selectedSubParameter?.subParamName ===
                                                    subParamName;

                                                return (
                                                  <div
                                                    key={subParamName}
                                                    id={elementId}
                                                    className={cn(
                                                      "p-3 grid grid-cols-1 md:grid-cols-12 gap-4 items-center scroll-mt-20 transition-all duration-300",
                                                      isHighlighted &&
                                                        "ring-2 ring-primary bg-primary/5",
                                                    )}
                                                  >
                                                    <div className="md:col-span-3">
                                                      <h6 className="font-medium text-sm">
                                                        {subParamName}
                                                      </h6>
                                                    </div>
                                                    <div className="md:col-span-1 flex items-center justify-start md:justify-center">
                                                      <div className="relative h-16 w-16">
                                                        <svg
                                                          className="h-full w-full"
                                                          viewBox="0 0 40 40"
                                                        >
                                                          <circle
                                                            cx="20"
                                                            cy="20"
                                                            r="18"
                                                            className="stroke-muted"
                                                            strokeWidth="3"
                                                            fill="transparent"
                                                          />
                                                          <circle
                                                            cx="20"
                                                            cy="20"
                                                            r="18"
                                                            className={cn(
                                                              "stroke-current transition-all duration-500 ease-in-out",
                                                              getScoreColor(
                                                                score,
                                                              ),
                                                            )}
                                                            strokeWidth="3"
                                                            fill="transparent"
                                                            strokeLinecap="round"
                                                            strokeDasharray={
                                                              subCircumference
                                                            }
                                                            strokeDashoffset={
                                                              subStrokeDashoffset
                                                            }
                                                            transform="rotate(-90 20 20)"
                                                          />
                                                        </svg>
                                                        <span
                                                          className={cn(
                                                            "absolute inset-0 flex items-center justify-center text-base font-bold",
                                                            getScoreColor(
                                                              score,
                                                            ),
                                                          )}
                                                        >
                                                          {score}
                                                        </span>
                                                      </div>
                                                    </div>
                                                    <div className="md:col-span-4 space-y-1">
                                                      <div className="flex items-start gap-2 text-sm">
                                                        <ThumbsUp className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                        <p className="text-muted-foreground flex-1 break-words">
                                                          <ExpandableText
                                                            text={whatWentWell}
                                                          />
                                                        </p>
                                                      </div>
                                                    </div>
                                                    <div className="md:col-span-4 space-y-1">
                                                      <div className="flex items-start gap-2 text-sm">
                                                        <Lightbulb className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                                        <p className="text-muted-foreground flex-1 break-words">
                                                          <ExpandableText
                                                            text={
                                                              whatCanBeImproved
                                                            }
                                                          />
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              },
                                            )}
                                            ;
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    );
                                  },
                                )}
                              </Accordion>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                    </Accordion>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Version Comparison Section - Conditionally Rendered */}
          {reportData?.validationResult?.version_comparison && (
            <VersionComparisonSection
              data={reportData.validationResult.version_comparison}
            />
          )}

          {/* Share Dialog */}
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Report: {idea.title}</DialogTitle>
                <DialogDescription>
                  Share your idea report with others via link or PDF.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center space-x-2">
                  <Input id="link" value={shareUrl} readOnly />
                  <Button type="button" size="sm" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Anyone with this link will be able to view the report.
                </p>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center text-muted-foreground">
                    Quick Share
                  </p>
                  <div className="flex justify-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="outline" size="icon">
                          <a
                            href={`https://api.whatsapp.com/send?text=${shareText}%20${encodedShareUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <WhatsAppIcon className="h-5 w-5" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>WhatsApp</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="outline" size="icon">
                          <a
                            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodedShareUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <TwitterIcon className="h-5 w-5" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>X / Twitter</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="outline" size="icon">
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FacebookIcon className="h-5 w-5" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Facebook</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="outline" size="icon">
                          <a
                            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedShareUrl}&title=${encodeURIComponent(
                              idea.title || "",
                            )}&summary=${shareText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <LinkedInIcon className="h-5 w-5" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>LinkedIn</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="outline" size="icon">
                          <a
                            href={`mailto:?subject=${encodeURIComponent(
                              idea.title || "",
                            )}&body=${shareText}%20${shareUrl}`}
                          >
                            <MailIcon className="h-5 w-5" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Email</TooltipContent>
                    </Tooltip>
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
        </div>
      </div>
    </TooltipProvider>
  );
}

// ✅ COMPONENT 1: BUSINESS CASE REPORT (REDESIGNED)
// ✅ COMPONENT: Consultation Status Card
function ConsultationStatusCard({
  consultation,
  loading,
}: {
  consultation: any;
  loading: boolean;
}) {
  if (loading) return null;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-blue-800 dark:text-blue-300">
          <Briefcase className="h-5 w-5" />
          Consultation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!consultation || consultation.status === "Pending" ? (
          <div className="flex items-center gap-3 text-muted-foreground p-4 bg-background/50 rounded-lg border border-dashed text-sm">
            <AlertCircle className="h-5 w-5" />
            <p>
              No consultation has been assigned or confirmed for this idea yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <Badge
                variant={
                  consultation.status?.toLowerCase() === "completed"
                    ? "default"
                    : "secondary"
                }
                className={cn(
                  "text-sm px-3 py-1",
                  consultation.status?.toLowerCase() === "completed"
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-100",
                )}
              >
                {consultation.status}
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {consultation.status?.toLowerCase() === "completed"
                  ? "Completed On"
                  : "Scheduled For"}
              </p>
              <div className="flex items-center gap-2 font-medium">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <span>
                  {consultation.scheduledAt
                    ? new Date(consultation.scheduledAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "Date not available"}
                </span>
                {consultation.scheduledAt && (
                  <span className="text-muted-foreground text-sm font-normal">
                    at{" "}
                    {new Date(consultation.scheduledAt).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                )}
              </div>
            </div>

            {consultation.mentor && (
              <div className="space-y-1 md:col-span-2 pt-2 border-t border-blue-200/50 dark:border-blue-800/50 mt-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Assigned Mentor
                </p>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {consultation.mentor.name}
                    </p>
                    {consultation.mentor.organization && (
                      <p className="text-xs text-muted-foreground">
                        {consultation.mentor.organization}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ✅ COMPONENT 1: BUSINESS CASE REPORT (REFACTORED)
function BusinessCaseReport({ data }: { data: any }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10 border-dashed">
        <FileText className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
        <h3 className="font-semibold text-lg">No Business Case Found</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          The business case analysis hasn't been generated for this idea yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Executive Summary */}
      {data.executiveSummary && (
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {data.executiveSummary}
            </p>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* The Big Idea */}
      {data.theBigIdea && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            The Big Idea
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Problem */}
            <Card className="flex flex-col h-full hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  The Problem
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {data.theBigIdea.problem}
                </p>
              </CardContent>
            </Card>

            {/* Solution */}
            <Card className="flex flex-col h-full hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  The Solution
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {data.theBigIdea.solution?.overview}
                </p>
                {data.theBigIdea.solution?.keyFeatures?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {data.theBigIdea.solution.keyFeatures.map(
                      (f: string, i: number) => (
                        <div
                          key={i}
                          className="text-xs font-normal p-[0.75rem] rounded-md bg-secondary"
                        >
                          <span className="">{f}</span>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mission */}
            <Card className="flex flex-col h-full hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {data.theBigIdea.mission}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Value Prop */}
          {data.theBigIdea.valueProposition && (
            <div className="bg-muted/40 border rounded-md p-4 flex gap-3 items-start">
              <Star className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Unique Value Proposition
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.theBigIdea.valueProposition}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accordion Sections */}
      <Accordion
        type="single"
        collapsible
        className="w-full border rounded-lg bg-card"
      >
        {/* Customer & Market */}
        {data.theCustomer && (
          <AccordionItem value="customer" className="px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-indigo-500" />
                <span className="font-semibold">
                  Customer & Market Analysis
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Target Segments
                  </h4>
                  <div className="space-y-3">
                    {[
                      ...(data.theCustomer.targetAudience || []),
                      ...(data.theCustomer.targetMarket || []),
                    ].map((segment: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-md border bg-muted/20"
                      >
                        <div className="font-medium text-sm">
                          {segment.segment}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {segment.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {data.theCustomer.marketSize && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Market Opportunity
                      </h4>
                      <div className="p-4 rounded-md border bg-muted/20 flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-sm">Market Size</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {data.theCustomer.marketSize}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {data.theCustomer.marketStrategy && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Go-To-Market
                      </h4>
                      <p className="text-sm text-muted-foreground border-l-2 border-muted pl-3">
                        {data.theCustomer.marketStrategy}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Technology & Competition */}
        {data.theMagic && (
          <AccordionItem value="magic" className="px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Cpu className="h-5 w-5 text-cyan-500" />
                <span className="font-semibold">Technology & Competition</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-none border bg-muted/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Core Technology
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {data.theMagic.coreTechnology}
                    </p>
                    {data.theMagic.technicalApproach?.architecture && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-xs font-semibold text-muted-foreground block mb-1">
                          Architecture
                        </span>
                        <p className="text-sm text-muted-foreground">
                          {data.theMagic.technicalApproach.architecture}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-none border bg-muted/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Competitive Edge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {data.theMagic.competitiveAdvantage}
                    </p>
                    {data.theMagic.comparison?.whyItMatters && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-xs font-semibold text-muted-foreground block mb-1">
                          Why It Matters
                        </span>
                        <p className="text-sm text-muted-foreground">
                          {data.theMagic.comparison.whyItMatters}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Business Model */}
        {data.businessModel && (
          <AccordionItem value="business" className="px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <BriefcaseIcon className="h-5 w-5 text-emerald-500" />
                <span className="font-semibold">Business Model</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-md bg-muted/10">
                  <h5 className="font-medium text-sm mb-2">Revenue Model</h5>
                  <p className="text-sm text-muted-foreground">
                    {data.businessModel.revenueModel || "N/A"}
                  </p>
                </div>
                <div className="p-4 border rounded-md bg-muted/10">
                  <h5 className="font-medium text-sm mb-2">Unit Economics</h5>
                  <p className="text-sm text-muted-foreground">
                    {data.businessModel.unitEconomics || "N/A"}
                  </p>
                </div>
              </div>

              {data.businessModel.revenueStreams?.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    Revenue Streams
                  </h5>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {data.businessModel.revenueStreams.map(
                      (stream: any, i: number) => (
                        <Card key={i} className="shadow-none border bg-card">
                          <CardContent className="p-3">
                            <div className="font-medium text-sm text-foreground">
                              {stream.stream}
                            </div>
                            <p
                              className="text-xs text-muted-foreground mt-1 line-clamp-2"
                              title={stream.description}
                            >
                              {stream.description}
                            </p>
                          </CardContent>
                        </Card>
                      ),
                    )}
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {/* Conclusion */}
      {data.conclusion && (
        <div className="bg-muted/30 border rounded-lg p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Conclusion
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {data.conclusion}
          </p>
        </div>
      )}
    </div>
  );
}

// ✅ COMPONENT 2: RISK ASSESSMENT REPORT (REFACTORED)
function RiskAssessmentReport({ data }: { data: any }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10 border-dashed">
        <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
        <h3 className="font-semibold text-lg">No Risk Assessment Found</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          The risk assessment analysis hasn't been generated yet.
        </p>
      </div>
    );
  }

  // Simplified color mapping for a cleaner look
  const getRiskBadgeVariant = (level: string) => {
    switch (level?.toUpperCase()) {
      case "CRITICAL":
        return "destructive";
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "secondary"; // Changed to secondary/orange via class if needed
      case "LOW":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Section: Score & Summary */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Score Card */}
        {data.overallRiskProfile && (
          <Card className="md:col-span-4 bg-muted/10 border-none shadow-none ring-1 ring-border">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center h-full">
              <Shield className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Overall Risk Level
              </h3>
              <Badge
                className={cn(
                  "text-lg px-6 py-1 mb-3",
                  data.overallRiskProfile.level === "LOW"
                    ? "bg-green-600 hover:bg-green-700"
                    : data.overallRiskProfile.level === "MEDIUM"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-destructive hover:bg-destructive/90",
                )}
              >
                {data.overallRiskProfile.level || "UNKNOWN"}
              </Badge>
              <p className="text-sm text-muted-foreground px-4">
                {data.overallRiskProfile.explanation}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Executive Summary */}
        <div className="md:col-span-8 space-y-4">
          {data.executiveSummary && (
            <div className="h-full border rounded-lg p-6 bg-card">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-primary" />
                Risk Summary
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {data.executiveSummary}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Risk Matrix Stats */}
      {data.riskMatrix && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Critical",
              count: data.riskMatrix.criticalRisks?.length || 0,
              color: "text-red-600",
              bg: "bg-red-50",
            },
            {
              label: "High",
              count: data.riskMatrix.highRisks?.length || 0,
              color: "text-orange-600",
              bg: "bg-orange-50",
            },
            {
              label: "Medium",
              count: data.riskMatrix.mediumRisks?.length || 0,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
            {
              label: "Low",
              count: data.riskMatrix.lowRisks?.length || 0,
              color: "text-green-600",
              bg: "bg-green-50",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="border rounded-md p-4 flex flex-col items-center justify-center bg-card"
            >
              <span className={cn("text-2xl font-bold", stat.color)}>
                {stat.count}
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase mt-1">
                {stat.label} Risks
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Assessment Accordion */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Search className="h-5 w-5" /> Detailed Risk Register
        </h3>

        <Accordion
          type="single"
          collapsible
          className="w-full border rounded-lg bg-card"
        >
          {[
            {
              key: "businessModelFinancial",
              title: "Business & Financial",
              icon: DollarSign,
              color: "text-green-600",
            },
            {
              key: "technicalOperational",
              title: "Technical & Operational",
              icon: Settings,
              color: "text-blue-600",
            },
            {
              key: "marketCommercial",
              title: "Market & Commercial",
              icon: TrendingUp,
              color: "text-purple-600",
            },
            {
              key: "complianceRegulatory",
              title: "Compliance & Regulatory",
              icon: Scale,
              color: "text-red-600",
            },
            {
              key: "teamOrganizational",
              title: "Team & Organizational",
              icon: Users,
              color: "text-indigo-600",
            },
          ].map((category) => {
            const risks = data.riskCategories?.[category.key];
            if (!risks?.length) return null;

            return (
              <AccordionItem
                value={category.key}
                key={category.key}
                className="px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <category.icon className={cn("h-5 w-5", category.color)} />
                    <span className="font-semibold">{category.title}</span>
                    <Badge variant="secondary" className="ml-auto mr-4">
                      {risks.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6 space-y-4">
                  {risks.map((risk: any, i: number) => (
                    <RiskCard key={i} risk={risk} />
                  ))}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Prioritized Plan */}
      {data.prioritizedMitigation?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Prioritized Mitigation
          </h3>
          <div className="grid gap-4">
            {data.prioritizedMitigation.map((item: any, idx: number) => (
              <Card
                key={idx}
                className="shadow-sm hover:border-primary/50 transition-colors"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">
                      {item.area}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Priority {item.priority}</Badge>
                      {item.timeline && (
                        <span className="text-xs text-muted-foreground">
                          {item.timeline}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {item.rationale}
                  </p>
                  {item.actions && (
                    <div className="bg-muted/30 rounded-md p-3">
                      <span className="text-xs font-semibold text-muted-foreground uppercase block mb-2">
                        Recommended Actions
                      </span>
                      <ul className="space-y-1">
                        {item.actions.map((act: string, j: number) => (
                          <li
                            key={j}
                            className="text-sm flex items-start gap-2"
                          >
                            <span className="text-primary mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardContent>
                  <div>
                    <div>
                      <div>Resources</div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.resources}
                      </p>
                    </div>
                    <div>
                      <div>Out puts</div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.successMetrics}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      <div className="">
        {data.monitoringFramework && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" /> Monitoring
                Framework
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/10 rounded-md border">
                  <div className="text-xs text-muted-foreground">
                    Review Frequency
                  </div>
                  <div className="font-semibold text-sm">
                    Monetering frequency should be{" "}
                    {data.monitoringFramework.reviewFrequency || "N/A"}
                  </div>
                </div>
                <div className="p-3 bg-muted/10 rounded-md border">
                  <div className="text-xs text-muted-foreground">
                    Escalation Process
                  </div>
                  <div className="font-semibold text-sm">
                    {data.monitoringFramework.escalationProcess || "N/A"}
                  </div>
                </div>
              </div>
              <div className="text-sm p-3 bg-muted/20 rounded-md">
                <span className="font-medium block mb-1">
                  Funding Monitoring
                </span>
                {data.monitoringFramework?.keyMetrics.map((metric) => (
                  <p key={metric}>{metric}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div>
        <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Conclusion
        </h4>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {data.conclusion}
        </p>
      </div>
    </div>
  );
}

// ✅ SUB-COMPONENT: RISK CARD (REFACTORED)
function RiskCard({ risk }: { risk: any }) {
  // Simple helper for border colors based on severity
  const borderColor =
    risk.severity?.toUpperCase() === "CRITICAL"
      ? "border-red-500"
      : risk.severity?.toUpperCase() === "HIGH"
        ? "border-orange-500"
        : risk.severity?.toUpperCase() === "MEDIUM"
          ? "border-yellow-500"
          : "border-green-500";

  return (
    <div
      className={cn(
        "group border rounded-lg p-4 bg-card hover:bg-muted/5 transition-colors border-l-4",
        borderColor,
      )}
    >
      <div className="flex justify-between items-start gap-4 mb-2">
        <h5 className="font-semibold text-sm text-foreground">{risk.name}</h5>
        <Badge
          variant={
            risk.severity?.toUpperCase() === "LOW" ? "outline" : "secondary"
          }
          className="shrink-0"
        >
          {risk.severity}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
        {risk.description}
      </p>

      <div className="flex gap-4 mb-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="font-medium">Likelihood:</span> {risk.likelihood}%
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium">Impact:</span> {risk.impact}%
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t">
        {risk.mitigation && (
          <div className="text-xs">
            <span className="font-semibold text-muted-foreground block mb-1">
              Mitigation
            </span>
            <p className="text-muted-foreground">{risk.mitigation}</p>
          </div>
        )}
        {risk.contingencyPlan && (
          <div className="text-xs">
            <span className="font-semibold text-muted-foreground block mb-1">
              Contingency
            </span>
            <p className="text-muted-foreground">{risk.contingencyPlan}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ COMPONENT 3: STRATEGIC GROWTH REPORT (REFACTORED)
function StrategicGrowthReport({ data }: { data: any }) {
  const reportData = data?.strategicGrowthViabilityJson || data;

  if (!reportData || Object.keys(reportData).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10 border-dashed">
        <Rocket className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
        <h3 className="font-semibold text-lg">No Growth Strategy Found</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          Strategic growth and viability data is unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Executive Summary */}
      {reportData.executiveSummary && (
        <Card className="border-none shadow-sm bg-muted/20">
          <CardContent className="p-6">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-background rounded-full border shadow-sm shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Executive Summary
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {reportData.executiveSummary}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vision & State */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Vision */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" /> Vision & Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reportData.visionAndIntent?.vision && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Vision
                </div>
                <p className="text-sm text-foreground italic">
                  "{reportData.visionAndIntent.vision}"
                </p>
              </div>
            )}
            {reportData.visionAndIntent?.mission && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Mission
                </div>
                <p className="text-sm text-foreground italic">
                  "{reportData.visionAndIntent.mission}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current State */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" /> Current Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-2 rounded-md bg-muted/20">
              <span className="text-sm font-medium">Phase</span>
              <Badge variant="secondary">
                {reportData.visionAndIntent?.currentPhase || "N/A"}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2 rounded-md bg-muted/20">
              <span className="text-sm font-medium">TRL Level</span>
              <Badge className="bg-green-600 hover:bg-green-700">
                {reportData.visionAndIntent?.currentTRL
                  ? `Level ${reportData.visionAndIntent.currentTRL}`
                  : "N/A"}
              </Badge>
            </div>
            {reportData.visionAndIntent?.trlJustification && (
              <p className="text-xs text-muted-foreground pt-2 border-t">
                {reportData.visionAndIntent.trlJustification}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SWOT Analysis */}
      {reportData.swotAnalysis && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" /> SWOT Analysis
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card className="border-t-4 border-t-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-green-700 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {reportData.swotAnalysis.strengths?.map(
                  (item: any, i: number) => (
                    <div key={i} className="text-sm p-2 bg-muted/20 rounded">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="border-t-4 border-t-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {reportData.swotAnalysis.weaknesses?.map(
                  (item: any, i: number) => (
                    <div key={i} className="text-sm p-2 bg-muted/20 rounded">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card className="border-t-4 border-t-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-blue-700 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" /> Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {reportData.swotAnalysis.opportunities?.map(
                  (item: any, i: number) => (
                    <div key={i} className="text-sm p-2 bg-muted/20 rounded">
                      <div className="font-medium flex justify-between">
                        {item.opportunity}
                        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 border rounded">
                          {item.timeframe}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Strategy: {item.captureStrategy}
                      </div>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            {/* Threats */}
            <Card className="border-t-4 border-t-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-orange-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Threats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {reportData.swotAnalysis.threats?.map(
                  (item: any, i: number) => (
                    <div key={i} className="text-sm p-2 bg-muted/20 rounded">
                      <div className="font-medium">{item.threat}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Mitigation: {item.mitigationStrategy}
                      </div>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Growth Strategy Timeline */}
      {reportData.growthStrategy && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Growth Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8 relative pl-2">
              {/* Vertical Line */}
              <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-border" />

              {/* Short Term */}
              {reportData.growthStrategy.shortTerm && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 h-5 w-5 rounded-full border-4 border-background bg-primary z-10" />
                  <div className="mb-2">
                    <h4 className="font-semibold text-base">
                      Short Term{" "}
                      <span className="text-muted-foreground font-normal text-sm ml-2">
                        (0-6 Months)
                      </span>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {reportData.growthStrategy.shortTerm.focus}
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {reportData.growthStrategy.shortTerm.objectives?.map(
                      (obj: string, i: number) => (
                        <div
                          key={i}
                          className="text-sm bg-muted/20 p-2 rounded border flex gap-2 items-start"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Medium Term */}
              {reportData.growthStrategy.mediumTerm && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 h-5 w-5 rounded-full border-4 border-background bg-indigo-500 z-10" />
                  <div className="mb-2">
                    <h4 className="font-semibold text-base">
                      Medium Term{" "}
                      <span className="text-muted-foreground font-normal text-sm ml-2">
                        (6-18 Months)
                      </span>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {reportData.growthStrategy.mediumTerm.focus}
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {reportData.growthStrategy.mediumTerm.objectives?.map(
                      (obj: string, i: number) => (
                        <div
                          key={i}
                          className="text-sm bg-muted/20 p-2 rounded border flex gap-2 items-start"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Long Term */}
              {reportData.growthStrategy.longTerm && (
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 h-5 w-5 rounded-full border-4 border-background bg-slate-500 z-10" />
                  <div className="mb-2">
                    <h4 className="font-semibold text-base">
                      Long Term{" "}
                      <span className="text-muted-foreground font-normal text-sm ml-2">
                        (18+ Months)
                      </span>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {reportData.growthStrategy.longTerm.focus}
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {reportData.growthStrategy.longTerm.objectives?.map(
                      (obj: string, i: number) => (
                        <div
                          key={i}
                          className="text-sm bg-muted/20 p-2 rounded border flex gap-2 items-start"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financials & Competitive */}
      <div className="grid md:grid-cols-2 gap-6">
        {reportData.financialProjections && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" /> Financial
                Projections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/10 rounded-md border">
                  <div className="text-xs text-muted-foreground">
                    Revenue Model
                  </div>
                  <div className="font-semibold text-sm">
                    {reportData.financialProjections.revenueModel || "N/A"}
                  </div>
                </div>
                <div className="p-3 bg-muted/10 rounded-md border">
                  <div className="text-xs text-muted-foreground">
                    Break Even
                  </div>
                  <div className="font-semibold text-sm">
                    {reportData.financialProjections.breakeven || "N/A"}
                  </div>
                </div>
              </div>
              <div className="text-sm p-3 bg-muted/20 rounded-md">
                <span className="font-medium block mb-1">
                  Funding Requirements
                </span>
                {reportData.financialProjections?.keyMetrics.map((metric) => (
                  <p key={metric}>{metric}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {reportData.competitiveStrategy && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-orange-500" /> Competitive
                Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Positioning
                </div>
                <p className="text-sm text-foreground">
                  {reportData.competitiveStrategy.positioning}
                </p>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Differentiators
                </div>
                <p className="text-sm text-foreground">
                  {reportData.competitiveStrategy.differentiation}
                </p>
                {/* <div className="flex flex-wrap gap-2">
                  {reportData.competitiveStrategy.differentiation?.map(
                    (diff: string, i: number) => (
                      <Badge key={i} variant="outline" className="font-normal">
                        {diff}
                      </Badge>
                    )
                  )}
                </div> */}
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Defensibility
                </div>
                <p className="text-sm text-foreground">
                  {reportData.competitiveStrategy.defensibility}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div>
        <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Strategic Outlook
        </h4>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {reportData.conclusion}
        </p>
      </div>
    </div>
  );
}
// ExpandableText Component (Unchanged)
function ExpandableText({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const maxLength = 250;

  if (!text) return null;

  const shouldTruncate = text.length > maxLength;

  return (
    <p className="text-muted-foreground flex-1 break-words">
      {isExpanded || !shouldTruncate
        ? text
        : `${text.substring(0, maxLength)}...`}
      {shouldTruncate && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="ml-1 cursor-pointer font-medium text-[12px] text-primary hover:underline"
        >
          {isExpanded ? " Read Less" : " Read More"}
        </span>
      )}
    </p>
  );
}

function VersionComparisonSection({ data }: { data: any }) {
  if (!data) return null;

  const {
    evolution_summary,
    top_improvements,
    drawbacks,
    parameter_changes,
    conclusion,
    final_verdict,
  } = data;

  // Helper for consistent color theming that works in dark mode
  const getEvolutionTypeStyle = (type: string) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("improvement") || t.includes("improved")) {
      return {
        icon: TrendingUp,
        wrapperClass: "border-l-green-500 bg-green-50 dark:bg-green-900/10",
        iconColor: "text-green-600 dark:text-green-400",
        badge:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      };
    } else if (
      t.includes("regression") ||
      t.includes("declined") ||
      t.includes("drop")
    ) {
      return {
        icon: TrendingDown,
        wrapperClass: "border-l-red-500 bg-red-50 dark:bg-red-900/10",
        iconColor: "text-red-600 dark:text-red-400",
        badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      };
    } else {
      return {
        icon: Activity,
        wrapperClass: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/10",
        iconColor: "text-blue-600 dark:text-blue-400",
        badge:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      };
    }
  };

  return (
    <Card className="mt-6 border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <History className="h-6 w-6 text-primary" />
          Version Evolution Analysis
        </CardTitle>
        <CardDescription>
          Detailed breakdown of how your idea has evolved since the last
          version.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* 1. High-Level Evolution Summary */}
        {evolution_summary && evolution_summary.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Strategic Shifts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evolution_summary.map((item: any, index: number) => {
                const style = getEvolutionTypeStyle(item.type);
                const Icon = style.icon;
                return (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-lg border-l-4 border shadow-sm",
                      style.wrapperClass,
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={cn("h-5 w-5 mt-1 shrink-0", style.iconColor)}
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-sm">
                            {item.title}
                          </h5>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] h-5", style.badge)}
                          >
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Top Improvements & Drawbacks (Side by Side) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Improvements Column */}
          {top_improvements && top_improvements.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Major Gains
              </h4>
              {top_improvements.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded border bg-card/50 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium bg-secondary px-2 py-1 rounded">
                      {item.parameter.split(">").pop().trim()}
                    </span>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                      {item.score_change}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.insight}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Drawbacks Column */}
          {drawbacks && drawbacks.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Areas of Concern
              </h4>
              {drawbacks.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded border bg-card/50 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium bg-secondary px-2 py-1 rounded">
                      {item.parameter.split(">").pop().trim()}
                    </span>
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
                      {item.score_change}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.insight}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Detailed Parameter Changes List */}
        {parameter_changes && parameter_changes.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-base flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              Detailed Analysis Log
            </h4>
            <div className="divide-y border rounded-lg overflow-hidden">
              {parameter_changes.map((change: any, index: number) => {
                const isImproved = change.change_type === "IMPROVED";
                return (
                  <div
                    key={index}
                    className="p-4 bg-card hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {change.parameter}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] h-5",
                              isImproved
                                ? "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400"
                                : "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400",
                            )}
                          >
                            {change.change_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {change.explanation}
                        </p>
                      </div>

                      <div className="md:w-1/3 shrink-0">
                        <div className="bg-secondary/50 p-3 rounded text-xs">
                          <span className="font-semibold block mb-1 text-primary">
                            Recommended Action:
                          </span>
                          {change.actionable_insight}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Conclusion & Action Plan */}
        {conclusion && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border-t border-b">
            <div>
              <h5 className="font-semibold text-sm mb-3 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-4 w-4" />
                Corrections Needed
              </h5>
              <ul className="space-y-2">
                {conclusion.corrections?.map((item: string, i: number) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-orange-400 mt-1">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-sm mb-3 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <ArrowRight className="h-4 w-4" />
                Strategic Upgrades
              </h5>
              <ul className="space-y-2">
                {conclusion.upgradations?.map((item: string, i: number) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-blue-400 mt-1">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 5. Final Verdict */}
        {final_verdict && (
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 flex gap-4 items-start">
            <Award className="h-6 w-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">
                Final Verdict
              </h4>
              <p className="text-sm text-muted-foreground">{final_verdict}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
