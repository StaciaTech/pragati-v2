"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  UserCheck,
  Sparkles,
  Filter,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ROLES } from "@/lib/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

interface EnrichedData {
  industry: string;
  companySize: string;
  persona: string;
  personaScore: number;
  attributeScores?: Record<string, number>;
}

interface Innovator {
  _id: string;
  name: string;
  email: string;
  domain?: string;
  enriched?: EnrichedData | null;
}

export default function GodsEyeViewPage() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [personaFilter, setPersonaFilter] = React.useState("all");
  const [isEnhanceModalOpen, setIsEnhanceModalOpen] = React.useState(false);
  const [selectedInnovator, setSelectedInnovator] =
    React.useState<Innovator | null>(null);

  // ✅ Fetch all innovators with psychometric data
  const {
    data: innovatorsResp,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["all-innovators", searchTerm, personaFilter],
    queryFn: async () => {
      const token = getToken();
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (personaFilter !== "all") params.append("persona", personaFilter);

      const { data } = await axios.get(
        `${apiUrl}/api/admin/innovators/all?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
  });
  console.log("innovatorsResp", innovatorsResp);

  const innovators: Innovator[] = innovatorsResp?.data || [];

  // ✅ AI Enhancement Mutation
  const enhanceMutation = useMutation({
    mutationFn: async (innovatorId: string) => {
      const token = getToken();
      const { data } = await axios.post(
        `${apiUrl}/api/admin/innovators/${innovatorId}/ai-enhance`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Enrichment Complete!",
        description: `Profile has been updated with AI insights.`,
      });
      setIsEnhanceModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["all-innovators"] });
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || "Enhancement failed";
      const requiresAssessment = error.response?.data?.requiresAssessment;

      toast({
        variant: "destructive",
        title: "Enhancement Failed",
        description: requiresAssessment
          ? "User must complete psychometric assessment first"
          : errorMsg,
      });
    },
  });

  // ✅ Impersonation Mutation
  const impersonateMutation = useMutation({
    mutationFn: async (innovatorId: string) => {
      const token = getToken();
      const { data } = await axios.post(
        `${apiUrl}/api/admin/impersonate/${innovatorId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
    onSuccess: (data) => {
      // Store impersonation token
      localStorage.setItem("token", data.token);
      localStorage.setItem("isImpersonation", "true");
      localStorage.setItem("impersonatedUser", JSON.stringify(data.user));

      toast({
        title: "Impersonation Mode Activated",
        description: `You are now viewing the platform as ${data.user.name}.`,
      });

      // Reload to apply new token
      setTimeout(() => (window.location.href = "/dashboard"), 1000);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Impersonation Failed",
        description:
          error.response?.data?.error || "Failed to impersonate user",
      });
    },
  });

  const handleOpenEnhanceModal = (innovator: Innovator) => {
    setSelectedInnovator(innovator);
    setIsEnhanceModalOpen(true);
  };

  const handleEnhance = () => {
    if (!selectedInnovator) return;
    enhanceMutation.mutate(selectedInnovator._id);
  };

  const handleImpersonate = (innovator: Innovator) => {
    impersonateMutation.mutate(innovator._id);
  };

  const handleRowClick = (innovatorId: string) => {
    router.push(
      `/dashboard/admin/innovators/details?id=${innovatorId}&role=${ROLES.SUPER_ADMIN}`,
    );
  };

  // Get unique personas for filter
  const uniquePersonas = [
    ...new Set(innovators.map((i) => i.enriched?.persona).filter(Boolean)),
  ] as string[];

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load innovators. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="text-primary" /> God's Eye View - Master Innovator
            Pool
          </CardTitle>
          <CardDescription>
            A centralized database of all innovators. Use AI to enrich and
            segment data automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={personaFilter} onValueChange={setPersonaFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by Persona..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Personas</SelectItem>
                {uniquePersonas.map((persona) => (
                  <SelectItem key={persona} value={persona}>
                    {persona}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading innovators...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Innovator</TableHead>
                  <TableHead>AI Persona</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Company Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {innovators.map((innovator) => (
                  <TableRow
                    key={innovator._id}
                    onClick={() => handleRowClick(innovator._id)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium text-primary hover:underline">
                      {innovator.name}
                      <p className="text-muted-foreground text-xs">
                        {innovator.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      {innovator.enriched ? (
                        <Badge variant="secondary">
                          {innovator.enriched.persona} (
                          {innovator.enriched.personaScore})
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Analyzed</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {innovator.enriched?.industry || "N/A"}
                    </TableCell>
                    <TableCell>
                      {innovator.enriched?.companySize || "N/A"}
                    </TableCell>
                    <TableCell
                      className="text-right space-x-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEnhanceModal(innovator)}
                      >
                        <Sparkles className="mr-2 h-4 w-4" /> AI Enhance
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="secondary" size="sm">
                            <Eye className="mr-2 h-4 w-4" /> Impersonate
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Impersonate User?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              You are about to view the platform as{" "}
                              <span className="font-bold">
                                {innovator.name}
                              </span>
                              . All actions you take will be logged as the Super
                              Admin. Are you sure?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleImpersonate(innovator)}
                              disabled={impersonateMutation.isPending}
                            >
                              {impersonateMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Yes, Impersonate
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {innovators.length === 0 && !isLoading && (
            <p className="text-center py-12 text-muted-foreground">
              No innovators found matching your criteria.
            </p>
          )}
        </CardContent>
      </Card>

      {/* AI Enhancement Modal */}
      <Dialog open={isEnhanceModalOpen} onOpenChange={setIsEnhanceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Profile Enrichment</DialogTitle>
            <DialogDescription>
              Use AI to analyze and enrich the profile of{" "}
              <span className="font-bold">{selectedInnovator?.name}</span> with
              predicted attributes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h4 className="font-semibold mb-2">Current Data</h4>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Industry:</span>{" "}
                {selectedInnovator?.enriched?.industry || "Not set"}
              </p>
              <p>
                <span className="text-muted-foreground">Persona:</span>{" "}
                {selectedInnovator?.enriched?.persona || "Not set"}
              </p>
            </div>
            <div className="h-[200px] w-full mt-4">
              <ChartContainer config={{}} className="h-full w-full">
                <ResponsiveContainer>
                  <BarChart
                    data={[
                      {
                        name: "Score",
                        score: selectedInnovator?.enriched?.personaScore || 0,
                      },
                    ]}
                    layout="vertical"
                    margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                  >
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      content={<ChartTooltipContent />}
                    />
                    <Bar
                      dataKey="score"
                      fill="hsl(var(--primary))"
                      radius={5}
                      background={{ fill: "hsl(var(--muted))" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleEnhance}
              disabled={enhanceMutation.isPending}
            >
              {enhanceMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {selectedInnovator?.enriched
                    ? "Re-Analyze"
                    : "Run AI Analysis"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
