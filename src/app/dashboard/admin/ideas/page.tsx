"use client";

import * as React from "react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const aiApiUrl = process.env.NEXT_PUBLIC_API_AI_URL;

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-500 text-white",
  under_review: "bg-yellow-500 text-white",
  approved: "bg-green-500 text-white",
  rejected: "bg-red-500 text-white",
  draft: "bg-gray-500 text-white",
  validating: "bg-purple-500 text-white", // ✅ NEW
};

interface College {
  _id: string;
  collegeName: string;
  email: string;
}

interface Idea {
  _id: string;
  title: string;
  domain: string;
  status: string;
  innovatorName: string;
  innovatorEmail: string;
  collegeName: string;
  collegeId?: string;
  createdAt: string;
  validationStatus?: "pending" | "processing" | "completed" | "failed"; // ✅ NEW
}

export default function IdeaOversightPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterCollege, setFilterCollege] = React.useState("");
  const [filterDomain, setFilterDomain] = React.useState("all");
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  // ✅ Selection state for submitted ideas only
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // ✅ Fetch all colleges for filter dropdown
  const { data: collegesResp } = useQuery({
    queryKey: ["colleges-list"],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(`${apiUrl}/api/admin/colleges/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
  });

  const colleges: College[] = collegesResp?.data || [];

  // ✅ Fetch all ideas with filters - POLL EVERY 10 SECONDS IF ANY ARE VALIDATING
  const {
    data: ideasResp,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["all-ideas", searchTerm, filterCollege, filterDomain],
    queryFn: async () => {
      const token = getToken();
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterCollege) params.append("collegeId", filterCollege);
      if (filterDomain !== "all") params.append("domain", filterDomain);

      const { data } = await axios.get(
        `${apiUrl}/api/admin/ideas/all?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
    // ✅ Poll every 10 seconds if any idea is validating
    refetchInterval: (data) => {
      const ideas = data?.data || [];
      const hasValidating = ideas.some(
        (idea: Idea) => idea.validationStatus === "processing",
      );
      return hasValidating ? 10000 : false; // Poll every 10s if validating
    },
  });

  const ideas: Idea[] = ideasResp?.data || [];
  console.log("ideas", ideas);

  // ✅ Split ideas into validated and submitted
  const validatedIdeas = ideas.filter((idea) => idea.status !== "submitted");
  const submittedIdeas = ideas.filter((idea) => idea.status === "submitted");

  // ✅ Check if any ideas are currently validating
  const hasValidatingIdeas = ideas.some(
    (idea) => idea.validationStatus === "processing",
  );

  // Get unique domains from all ideas
  const uniqueDomains = [
    ...new Set(ideas.map((idea) => idea.domain).filter(Boolean)),
  ];

  const selectedCollege = colleges.find((c) => c._id === filterCollege);

  // ✅ Selection handlers (apply only to submitted ideas)
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select ideas that are NOT currently validating
      const selectableIds = submittedIdeas
        .filter((idea) => idea.validationStatus !== "processing")
        .map((idea) => idea._id);
      setSelectedIds(new Set(selectableIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectRow = (ideaId: string, checked: boolean) => {
    // Only allow selecting submitted ideas that aren't validating
    const idea = submittedIdeas.find((i) => i._id === ideaId);
    if (!idea || idea.validationStatus === "processing") return;

    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(ideaId);
      } else {
        newSet.delete(ideaId);
      }
      return newSet;
    });
  };

  // ✅ Batch validation mutation (used for both single and batch)
  const validateBatchMutation = useMutation({
    mutationFn: async (ideaIds: string[]) => {
      const token = getToken();
      const { data } = await axios.post(
        `${aiApiUrl}/api/validate-pitch-decks-batch`,
        { ideaIds },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
    onSuccess: (response) => {
      setSelectedIds(new Set());
      // ✅ Immediately refetch to get updated validation status
      queryClient.invalidateQueries({ queryKey: ["all-ideas"] });
    },
  });

  const handleValidateSelected = () => {
    if (selectedIds.size === 0) return;
    validateBatchMutation.mutate(Array.from(selectedIds));
  };

  const handleValidateIndividual = (ideaId: string) => {
    validateBatchMutation.mutate([ideaId]);
  };

  // ✅ Helper to check if an idea is currently validating
  const isIdeaValidating = (ideaId: string) => {
    const idea = ideas.find((i) => i._id === ideaId);
    // Check if it's in DB processing state OR currently being mutated locally
    return (
      idea?.validationStatus === "processing" ||
      (validateBatchMutation.isPending &&
        validateBatchMutation.variables?.includes(ideaId))
    );
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load ideas. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {/* ✅ Show global validation status */}
      {hasValidatingIdeas && (
        <Alert className="mb-4 border-purple-500 bg-purple-50">
          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
          <AlertDescription className="text-purple-800">
            <strong>Validation in progress...</strong> Some ideas are currently
            being validated. This page will auto-refresh.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Idea Oversight</CardTitle>
          <CardDescription>
            Search, filter, and manage all ideas across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by ID or Title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="w-full justify-between"
                >
                  {selectedCollege
                    ? selectedCollege.collegeName
                    : "Select college..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search college..." />
                  <CommandEmpty>No college found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      key="all-colleges"
                      value=""
                      onSelect={() => {
                        setFilterCollege("");
                        setPopoverOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          filterCollege === "" ? "opacity-100" : "opacity-0",
                        )}
                      />
                      All Colleges
                    </CommandItem>
                    {colleges.map((college) => (
                      <CommandItem
                        key={college._id}
                        value={college._id}
                        onSelect={(currentValue) => {
                          setFilterCollege(
                            currentValue === filterCollege ? "" : currentValue,
                          );
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filterCollege === college._id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {college.collegeName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <Select value={filterDomain} onValueChange={setFilterDomain}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Domain..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {uniqueDomains.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Validated Ideas Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Validated Ideas</h3>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading ideas...</span>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>College</TableHead>
                      <TableHead>Innovator</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validatedIdeas.length > 0 ? (
                      validatedIdeas.map((idea) => (
                        <TableRow key={idea._id}>
                          <TableCell className="font-mono text-xs">
                            {idea?._id?.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="font-medium">
                            {idea.title}
                          </TableCell>
                          <TableCell>{idea.collegeName}</TableCell>
                          <TableCell>
                            {idea.innovatorName}
                            <p className="text-xs text-muted-foreground">
                              {idea.innovatorEmail}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                STATUS_COLORS[idea.status] ||
                                "bg-gray-500 text-white"
                              }
                            >
                              {idea.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="link" asChild size="sm">
                              <Link
                                href={`/dashboard/ideas/details?id=${idea._id}&role=Super Admin`}
                              >
                                View Report
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-12 text-muted-foreground"
                        >
                          No validated ideas found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="mt-[1rem]" />
      <Card>
        <CardContent>
          {/* Submitted Ideas Table */}
          <div className="space-y-4">
            <CardHeader>
              <CardTitle>Submitted Ideas (Validation Pending)</CardTitle>
            </CardHeader>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading ideas...</span>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            submittedIdeas.filter(
                              (i) => i.validationStatus !== "processing",
                            ).length > 0 &&
                            selectedIds.size ===
                              submittedIdeas.filter(
                                (i) => i.validationStatus !== "processing",
                              ).length
                          }
                          onCheckedChange={toggleSelectAll}
                          disabled={
                            submittedIdeas.filter(
                              (i) => i.validationStatus !== "processing",
                            ).length === 0
                          }
                        />
                      </TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>College</TableHead>
                      <TableHead>Innovator</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submittedIdeas.length > 0 ? (
                      submittedIdeas.map((idea) => {
                        const isValidating = isIdeaValidating(idea._id);
                        return (
                          <TableRow
                            key={idea._id}
                            className={
                              isValidating ? "bg-purple-50/50" : undefined
                            }
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(idea._id)}
                                onCheckedChange={(checked) =>
                                  toggleSelectRow(idea._id, Boolean(checked))
                                }
                                disabled={isValidating}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {idea._id?.slice(0, 8)}...
                            </TableCell>
                            <TableCell className="font-medium">
                              {idea.title}
                            </TableCell>
                            <TableCell>{idea.collegeName}</TableCell>
                            <TableCell>
                              {idea.innovatorName}
                              <p className="text-xs text-muted-foreground">
                                {idea.innovatorEmail}
                              </p>
                            </TableCell>
                            <TableCell>
                              {isValidating ? (
                                <Badge className="bg-purple-500 text-white">
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  Validating...
                                </Badge>
                              ) : (
                                <Badge
                                  className={
                                    STATUS_COLORS[idea.status] ||
                                    "bg-gray-500 text-white"
                                  }
                                >
                                  {idea.status}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() =>
                                  handleValidateIndividual(idea._id)
                                }
                                disabled={
                                  isValidating ||
                                  validateBatchMutation.isPending
                                }
                              >
                                {isValidating ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Validating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Validate
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-12 text-muted-foreground"
                        >
                          No submitted ideas found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Batch Actions Footer - only for submitted ideas */}
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between py-4 px-4 border-t bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">
                  {selectedIds.size} of{" "}
                  {
                    submittedIdeas.filter(
                      (i) => i.validationStatus !== "processing",
                    ).length
                  }{" "}
                  ideas selected
                </div>
                <Button
                  onClick={handleValidateSelected}
                  disabled={
                    validateBatchMutation.isPending ||
                    selectedIds.size === 0 ||
                    hasValidatingIdeas
                  }
                  className="min-w-[12rem]"
                >
                  {validateBatchMutation.isPending || hasValidatingIdeas ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Validate Selected ({selectedIds.size})
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Success/Error Messages */}
          {validateBatchMutation.isSuccess && (
            <Alert className="mt-4">
              <AlertDescription>
                ✅ Batch validation complete:{" "}
                {validateBatchMutation.data.successful} successful,{" "}
                {validateBatchMutation.data.failed} failed
              </AlertDescription>
            </Alert>
          )}

          {validateBatchMutation.isError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                ❌ Batch validation failed:{" "}
                {validateBatchMutation.error?.message || "Unknown error"}
              </AlertDescription>
            </Alert>
          )}

          {/* ============ RESUBMITTED IDEAS SECTION ============ */}
          <ResubmittedIdeasSection
            onValidate={(id) => handleValidateIndividual(id)}
            isValidatingGlobal={hasValidatingIdeas}
            validatingIds={validateBatchMutation.variables}
            isMutationPending={validateBatchMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// ----------------------------------------------------------------------
// New Component for Resubmitted Ideas to keep main component cleaner
// ----------------------------------------------------------------------

function ResubmittedIdeasSection({
  onValidate,
  isValidatingGlobal,
  validatingIds,
  isMutationPending,
}: {
  onValidate: (id: string) => void;
  isValidatingGlobal: boolean;
  validatingIds?: string[];
  isMutationPending?: boolean;
}) {
  const { data: resubmittedResp, isLoading } = useQuery({
    queryKey: ["resubmitted-ideas"],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(`${apiUrl}/api/ideas/resubmitted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(data.data);

      return data.data; // Expected { validated: [], notValidated: [] }
    },
    // Poll if global validation is happening (could be one of these)
    refetchInterval: isValidatingGlobal ? 5000 : false,
  });

  const validatedList = resubmittedResp?.validated || [];
  const notValidatedList = resubmittedResp?.notValidated || [];

  if (isLoading) {
    return (
      <div className="mt-8 pt-8 border-t">
        <h3 className="text-lg font-semibold mb-4">Resubmitted Ideas</h3>
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // If no resubmitted ideas at all, don't show section
  if (validatedList.length === 0 && notValidatedList.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-8 border-t space-y-8">
      {/* 1. Pending Validation (Resubmitted) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
              Action Required
            </span>
            Resubmitted Ideas (Pending Validation)
          </h3>
          <Badge variant="secondary">{notValidatedList.length}</Badge>
        </div>

        {notValidatedList.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No pending resubmissions.
          </p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Title</TableHead>
                  <TableHead>Innovator</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notValidatedList.map((idea: any) => {
                  const isThisValidating =
                    isMutationPending &&
                    validatingIds?.includes(idea.versionId);
                  const isValidating =
                    idea.validationStatus === "processing" ||
                    isValidatingGlobal ||
                    isThisValidating;

                  return (
                    <TableRow key={idea._id}>
                      <TableCell className="font-medium">
                        {idea.title}
                        <div className="text-xs text-muted-foreground">
                          ID: {idea.versionId?.slice(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        {idea.innovatorName}
                        <div className="text-xs text-muted-foreground">
                          {idea.innovatorEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(
                          idea.updatedAt || idea.createdAt,
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => onValidate(idea.versionId)}
                          disabled={isValidating}
                        >
                          {isValidating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Validating
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Validate
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* 2. Validated (Resubmitted) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-muted-foreground">
            Resubmitted Ideas (Validated)
          </h3>
          <Badge variant="outline">{validatedList.length}</Badge>
        </div>

        {validatedList.length > 0 && (
          <div className="border rounded-lg overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Title</TableHead>
                  <TableHead>Innovator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validatedList.map((idea: any) => (
                  <TableRow key={idea.versionId}>
                    <TableCell className="font-medium">{idea.title}</TableCell>
                    <TableCell>{idea.innovatorName}</TableCell>
                    <TableCell>
                      <Badge
                        className={STATUS_COLORS[idea.status] || "bg-gray-500"}
                      >
                        {idea.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" asChild size="sm">
                        <Link
                          href={`/dashboard/ideas/details?id=${idea.versionId}&role=Super Admin`}
                        >
                          View Report
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
