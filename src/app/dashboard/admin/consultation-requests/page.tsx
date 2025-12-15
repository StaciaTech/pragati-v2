"use client";

import * as React from "react";
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
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, CheckCircle, XCircle, Loader2, Eye } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

type Idea = {
  id: string;
  title: string;
  domain?: string;
  status?: string;
  overallScore?: number | null;
  innovatorName?: string;
  collegeName?: string;
  collegeId?: string;
  consultationMentorId?: string;
  consultationMentorName?: string;
  consultationScheduledAt?: string;
};

type Mentor = {
  id: string;
  name: string;
  email?: string;
  organization?: string;
};

type ConsultationRequest = {
  id: string;
  ideaId: string;
  ideaTitle: string;
  innovatorId: string;
  innovatorName: string;
  innovatorEmail: string;
  requestedBy: string;
  requesterName: string;
  requesterRole: string;
  requesterRoleDisplay: string;
  mentorId: string;
  mentorName: string;
  mentorEmail: string;
  preferredDate: string;
  questions: string;
  status: "pending" | "approved" | "rejected";
  overallScore?: number;
  requestedAt: string;
  createdAt: string;
};

export default function ConsultationRequestsPage() {
  const { toast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [ideas, setIdeas] = React.useState<Idea[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [mentors, setMentors] = React.useState<Mentor[]>([]);
  const [mentorsLoading, setMentorsLoading] = React.useState(true);

  // Consultation requests state
  const [requests, setRequests] = React.useState<ConsultationRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = React.useState(true);

  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [selectedIdea, setSelectedIdea] = React.useState<Idea | null>(null);
  const [selectedMentorId, setSelectedMentorId] = React.useState("");
  const [consultationDate, setConsultationDate] = React.useState<
    Date | undefined
  >(undefined);

  // Request review dialog
  const [reviewDialogOpen, setReviewDialogOpen] = React.useState(false);
  const [selectedRequest, setSelectedRequest] =
    React.useState<ConsultationRequest | null>(null);
  const [reviewAction, setReviewAction] = React.useState<
    "approve" | "reject" | null
  >(null);
  const [reviewScheduledAt, setReviewScheduledAt] = React.useState<
    Date | undefined
  >(undefined);
  const [reviewReason, setReviewReason] = React.useState("");
  const [reviewSubmitting, setReviewSubmitting] = React.useState(false);

  // Load validated ideas for consultation
  React.useEffect(() => {
    const loadIdeas = async () => {
      try {
        const token = getToken();
        setLoading(true);
        const res = await fetch(`${apiUrl}/api/admin/ideas/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error("Failed to load ideas");
        }
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];

        const mapped: Idea[] = data.map((raw: any) => ({
          id: raw._id ?? raw.id,
          title: raw.title,
          domain: raw.domain,
          status: raw.status,
          overallScore: raw.overallScore ?? null,
          innovatorName: raw.innovatorName,
          collegeName: raw.collegeName,
          collegeId: raw.collegeId,
          consultationMentorId: raw.consultationMentorId,
          consultationMentorName: raw.consultationMentorName,
          consultationScheduledAt: raw.consultationScheduledAt,
        }));

        // Only keep validated ideas (have report)
        setIdeas(mapped.filter((i) => i.overallScore != null));
      } catch (err: any) {
        console.error(err);
        toast({
          variant: "destructive",
          title: "Failed to load ideas",
          description: err?.message ?? "Something went wrong.",
        });
      } finally {
        setLoading(false);
      }
    };

    const loadMentors = async () => {
      try {
        const token = getToken();
        setMentorsLoading(true);
        const res = await fetch(`${apiUrl}/api/users/mentors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error("Failed to load external mentors");
        }
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];

        const mapped: Mentor[] = data.map((m: any) => ({
          id: m._id ?? m.id,
          name: m.name,
          email: m.email,
          organization: m.organization,
        }));

        setMentors(mapped);
      } catch (err: any) {
        console.error(err);
        toast({
          variant: "destructive",
          title: "Failed to load mentors",
          description: err?.message ?? "Something went wrong.",
        });
      } finally {
        setMentorsLoading(false);
      }
    };

    const loadRequests = async () => {
      try {
        const token = getToken();
        setRequestsLoading(true);

        // TODO: Replace with actual consultation requests endpoint
        const res = await fetch(
          `${apiUrl}/api/admin/consultation-requests?status=pending`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to load consultation requests");
        }

        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];

        const mapped: ConsultationRequest[] = data.map((r: any) => ({
          id: r._id ?? r.id,
          ideaId: r.ideaId,
          ideaTitle: r.ideaTitle,
          innovatorId: r.innovatorId,
          innovatorName: r.innovatorName,
          innovatorEmail: r.innovatorEmail,
          requestedBy: r.requestedBy,
          requesterName: r.requesterName,
          requesterRole: r.requesterRole,
          requesterRoleDisplay: r.requesterRoleDisplay,
          mentorId: r.mentorId,
          mentorName: r.mentorName,
          mentorEmail: r.mentorEmail,
          preferredDate: r.preferredDate,
          questions: r.questions,
          status: r.status,
          overallScore: r.overallScore,
          requestedAt: r.requestedAt,
          createdAt: r.createdAt,
        }));

        setRequests(mapped);
      } catch (err: any) {
        console.error(err);
        // Don't show error toast for requests - might not be implemented yet
      } finally {
        setRequestsLoading(false);
      }
    };

    loadIdeas();
    loadMentors();
    loadRequests();
  }, [toast, apiUrl]);

  const validatedIdeas = ideas;
  const consultedIdeas = ideas.filter((i) => i.consultationMentorId);

  const openAssignDialog = (idea: Idea) => {
    setSelectedIdea(idea);
    setSelectedMentorId("");
    setConsultationDate(undefined);
    setAssignDialogOpen(true);
  };

  const handleAssignConsultation = async () => {
    if (!selectedIdea) return;
    if (!selectedMentorId) {
      toast({
        variant: "destructive",
        title: "Select a mentor",
        description: "Please choose an external mentor before assigning.",
      });
      return;
    }

    const mentor = mentors.find((m) => m.id === selectedMentorId);
    if (!mentor) {
      toast({
        variant: "destructive",
        title: "Invalid mentor",
        description: "Selected mentor could not be found.",
      });
      return;
    }

    try {
      const payload: any = {
        mentorId: selectedMentorId,
      };
      if (consultationDate) {
        payload.scheduledAt = consultationDate.toISOString();
      }
      const token = getToken();
      const res = await fetch(
        `${apiUrl}/api/ideas/${selectedIdea.id}/consultation`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || "Failed to assign consultation");
      }

      const json = await res.json();
      const apiData = json.data || {};

      const scheduledAt =
        apiData.scheduledAt ||
        apiData.consultationScheduledAt ||
        payload.scheduledAt;

      setIdeas((prev) =>
        prev.map((i) =>
          i.id === selectedIdea.id
            ? {
                ...i,
                consultationMentorId: mentor.id,
                consultationMentorName: mentor.name,
                consultationScheduledAt: scheduledAt,
              }
            : i
        )
      );

      toast({
        title: "Consultation assigned",
        description: `Consultation with ${mentor.name} has been assigned.`,
      });

      setAssignDialogOpen(false);
      setSelectedIdea(null);
      setSelectedMentorId("");
      setConsultationDate(undefined);
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Failed to assign consultation",
        description: err?.message ?? "Something went wrong.",
      });
    }
  };

  const openReviewDialog = (
    request: ConsultationRequest,
    action: "approve" | "reject"
  ) => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewScheduledAt(
      request.preferredDate ? new Date(request.preferredDate) : undefined
    );
    setReviewReason("");
    setReviewDialogOpen(true);
  };

  const handleReviewSubmit = async () => {
    if (!selectedRequest || !reviewAction) return;

    if (reviewAction === "approve" && !reviewScheduledAt) {
      toast({
        variant: "destructive",
        title: "Select a date",
        description: "Please select a consultation date for approval.",
      });
      return;
    }

    setReviewSubmitting(true);

    try {
      const token = getToken();
      const endpoint =
        reviewAction === "approve"
          ? `${apiUrl}/api/admin/consultation-requests/${selectedRequest.id}/approve`
          : `${apiUrl}/api/admin/consultation-requests/${selectedRequest.id}/reject`;

      const payload: any = {};

      if (reviewAction === "approve" && reviewScheduledAt) {
        payload.scheduledAt = reviewScheduledAt.toISOString();
      }

      if (reviewAction === "reject" && reviewReason.trim()) {
        payload.reason = reviewReason.trim();
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(
          errJson?.error || `Failed to ${reviewAction} consultation request`
        );
      }

      // Remove from pending requests
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));

      // If approved, update the ideas list
      if (reviewAction === "approve") {
        setIdeas((prev) =>
          prev.map((i) =>
            i.id === selectedRequest.ideaId
              ? {
                  ...i,
                  consultationMentorId: selectedRequest.mentorId,
                  consultationMentorName: selectedRequest.mentorName,
                  consultationScheduledAt: reviewScheduledAt?.toISOString(),
                }
              : i
          )
        );
      }

      toast({
        title: `Request ${reviewAction}d`,
        description: `Consultation request from ${selectedRequest.requesterName} has been ${reviewAction}d.`,
      });

      setReviewDialogOpen(false);
      setSelectedRequest(null);
      setReviewAction(null);
      setReviewScheduledAt(undefined);
      setReviewReason("");
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: `Failed to ${reviewAction} request`,
        description: err?.message ?? "Something went wrong.",
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div className="space-y-6">
      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">
            Pending Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="validated">Validated Ideas</TabsTrigger>
          <TabsTrigger value="history">Consultation History</TabsTrigger>
        </TabsList>

        {/* Pending Consultation Requests */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Pending Consultation Requests</CardTitle>
              <CardDescription>
                Review and approve/reject consultation requests from innovators
                and TTC coordinators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading requests...
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                  No pending consultation requests.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Idea</TableHead>
                      <TableHead>Innovator</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Mentor</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Preferred Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.ideaTitle}
                        </TableCell>
                        <TableCell>{request.innovatorName}</TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span>{request.requesterName}</span>
                            <span className="text-xs text-muted-foreground">
                              {request.requesterRoleDisplay}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{request.mentorName}</TableCell>
                        <TableCell>
                          {request.overallScore
                            ? Math.round(request.overallScore)
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {request.preferredDate
                            ? format(new Date(request.preferredDate), "PPP")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openReviewDialog(request, "approve")
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                openReviewDialog(request, "reject")
                              }
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validated Ideas */}
        <TabsContent value="validated">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Validated Ideas</CardTitle>
                <CardDescription>
                  Directly assign external mentor consultations for validated
                  ideas.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                  Loading ideas...
                </div>
              ) : validatedIdeas.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                  No validated ideas available for consultation.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Idea</TableHead>
                      <TableHead>Innovator</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Consultation</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validatedIdeas.map((idea) => (
                      <TableRow key={idea.id}>
                        <TableCell className="font-medium">
                          {idea.title}
                        </TableCell>
                        <TableCell>{idea.innovatorName ?? "—"}</TableCell>
                        <TableCell>{idea.collegeName ?? "—"}</TableCell>
                        <TableCell>
                          {idea.overallScore != null
                            ? Math.round(idea.overallScore)
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {idea.consultationMentorId ? (
                            <div className="flex flex-col text-sm">
                              <span>{idea.consultationMentorName}</span>
                              {idea.consultationScheduledAt && (
                                <span className="text-xs text-muted-foreground">
                                  {format(
                                    new Date(idea.consultationScheduledAt),
                                    "PPP p"
                                  )}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline">Not assigned</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => openAssignDialog(idea)}
                            disabled={mentorsLoading}
                          >
                            {idea.consultationMentorId
                              ? "Update Consultation"
                              : "Assign Consultation"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consultation History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Consultation History</CardTitle>
              <CardDescription>
                All consultations that have been assigned.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consultedIdeas.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                  No consultations have been assigned yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Idea</TableHead>
                      <TableHead>Innovator</TableHead>
                      <TableHead>Mentor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultedIdeas.map((idea) => (
                      <TableRow key={idea.id}>
                        <TableCell>{idea.title}</TableCell>
                        <TableCell>{idea.innovatorName ?? "—"}</TableCell>
                        <TableCell>{idea.consultationMentorName}</TableCell>
                        <TableCell>
                          {idea.consultationScheduledAt
                            ? format(
                                new Date(idea.consultationScheduledAt),
                                "PPP p"
                              )
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Assigned</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign consultation dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedIdea
                ? `Assign Consultation – ${selectedIdea.title}`
                : "Assign Consultation"}
            </DialogTitle>
            <DialogDescription>
              Choose an external mentor and optional date for this consultation.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>External Mentor</Label>
              <Select
                value={selectedMentorId}
                onValueChange={setSelectedMentorId}
                disabled={mentorsLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      mentorsLoading
                        ? "Loading mentors..."
                        : "Select external mentor"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {mentors.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                      {m.organization ? ` – ${m.organization}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Consultation Date (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !consultationDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {consultationDate ? (
                      format(consultationDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={consultationDate}
                    onSelect={setConsultationDate}
                    initialFocus
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignConsultation}>Confirm & Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Request Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve"
                ? "Approve Consultation Request"
                : "Reject Consultation Request"}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest &&
                `Request from ${selectedRequest.requesterName} for "${selectedRequest.ideaTitle}"`}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              {/* Request Details */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Innovator
                  </Label>
                  <p className="text-sm">{selectedRequest.innovatorName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Requested Mentor
                  </Label>
                  <p className="text-sm">{selectedRequest.mentorName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Questions/Topics
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.questions}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Approval fields */}
              {reviewAction === "approve" && (
                <div className="space-y-2">
                  <Label>
                    Consultation Date <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !reviewScheduledAt && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reviewScheduledAt ? (
                          format(reviewScheduledAt, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={reviewScheduledAt}
                        onSelect={setReviewScheduledAt}
                        initialFocus
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Rejection reason */}
              {reviewAction === "reject" && (
                <div className="space-y-2">
                  <Label>Reason for Rejection (Optional)</Label>
                  <Textarea
                    placeholder="Explain why this request is being rejected..."
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={reviewSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={reviewSubmitting}
              variant={reviewAction === "reject" ? "destructive" : "default"}
            >
              {reviewSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : reviewAction === "approve" ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve & Assign
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
