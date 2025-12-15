"use client";

import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
}

export default function IdeaOversightPage() {
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

  // ✅ Fetch all ideas with filters
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
  });

  const ideas: Idea[] = ideasResp?.data || [];
  console.log("ideas", ideas);

  // ✅ Split ideas into validated and submitted
  const validatedIdeas = ideas.filter((idea) => idea.status !== "submitted");
  const submittedIdeas = ideas.filter((idea) => idea.status === "submitted");

  // Get unique domains from all ideas
  const uniqueDomains = [
    ...new Set(ideas.map((idea) => idea.domain).filter(Boolean)),
  ];

  const selectedCollege = colleges.find((c) => c._id === filterCollege);

  // ✅ Selection handlers (apply only to submitted ideas)
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(submittedIdeas.map((idea) => idea._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectRow = (ideaId: string, checked: boolean) => {
    // Only allow selecting submitted ideas
    const idea = submittedIdeas.find((i) => i._id === ideaId);
    if (!idea) return;

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

  // ✅ Batch validation mutation
  const validateBatchMutation = useMutation({
    mutationFn: async (ideaIds: string[]) => {
      const token = getToken();
      const { data } = await axios.post(
        `${aiApiUrl}/api/validate-pitch-decks-batch`,
        { ideaIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: (response) => {
      setSelectedIds(new Set());
      refetch();
    },
  });

  const handleValidateSelected = () => {
    if (selectedIds.size === 0) return;
    console.log(selectedIds);

    validateBatchMutation.mutate(Array.from(selectedIds));
  };

  // ✅ Individual validation mutation
  const validateIndividualMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      const token = getToken();
      console.log("ideaId", ideaId);

      const { data } = await axios.post(
        `${aiApiUrl}/api/validate-pitch-deck`,
        { ideaId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const handleValidateIndividual = (ideaId: string) => {
    validateIndividualMutation.mutate(ideaId);
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
                          filterCollege === "" ? "opacity-100" : "opacity-0"
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
                            currentValue === filterCollege ? "" : currentValue
                          );
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filterCollege === college._id
                              ? "opacity-100"
                              : "opacity-0"
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
                                href={`/dashboard/ideas/${idea._id}?role=Super Admin`}
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
            {/* <h3 className="text-lg font-semibold">
              Submitted Ideas (Validation Pending)
            </h3> */}
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
                            submittedIdeas.length > 0 &&
                            selectedIds.size === submittedIdeas.length
                          }
                          onCheckedChange={toggleSelectAll}
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
                      submittedIdeas.map((idea) => (
                        <TableRow key={idea._id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(idea._id)}
                              onCheckedChange={(checked) =>
                                toggleSelectRow(idea._id, Boolean(checked))
                              }
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
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => handleValidateIndividual(idea._id)}
                              disabled={validateIndividualMutation.isPending}
                            >
                              {validateIndividualMutation.isPending &&
                              validateIndividualMutation.variables ===
                                idea._id ? (
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
                      ))
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
                  {selectedIds.size} of {submittedIdeas.length} ideas selected
                </div>
                <Button
                  onClick={handleValidateSelected}
                  disabled={
                    validateBatchMutation.isPending || selectedIds.size === 0
                  }
                  className="min-w-[12rem]"
                >
                  {validateBatchMutation.isPending ? (
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

          {validateIndividualMutation.isSuccess && (
            <Alert className="mt-4">
              <AlertDescription>
                ✅ Idea validated successfully
              </AlertDescription>
            </Alert>
          )}

          {validateIndividualMutation.isError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                ❌ Idea validation failed:{" "}
                {validateIndividualMutation.error?.message || "Unknown error"}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
