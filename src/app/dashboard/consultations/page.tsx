"use client";

import * as React from "react";
import { useConsultations, type Consultation } from "@/hooks/useConsultations";
import { useToast } from "@/hooks/use-toast";
import { isAfter, isBefore, startOfDay, format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  MoreHorizontal,
  Expand,
  FileText,
  CheckCircle2,
  PlusCircle,
  Loader2,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Scheduled: "bg-blue-100 text-blue-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

const ConsultationTable = ({
  consultations,
  onRowClick,
  onActionSelect,
}: {
  consultations: Consultation[];
  onRowClick: (c: Consultation) => void;
  onActionSelect: (action: "reschedule" | "cancel", c: Consultation) => void;
}) => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Idea</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Mentor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {consultations.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center py-8 text-muted-foreground"
            >
              No consultations available
            </TableCell>
          </TableRow>
        ) : (
          consultations.map((consultation) => (
            <TableRow
              key={consultation.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(consultation)}
            >
              <TableCell className="font-medium">
                {consultation.title}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {consultation.date} at {consultation.time}
              </TableCell>
              <TableCell>{consultation.mentor}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    STATUS_COLORS[consultation.status] ||
                      "bg-gray-100 text-gray-800"
                  )}
                >
                  {consultation.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onRowClick(consultation)}>
                      View Details
                    </DropdownMenuItem>
                    {consultation.status === "Scheduled" && (
                      <DropdownMenuItem
                        onSelect={() =>
                          onActionSelect("reschedule", consultation)
                        }
                      >
                        Reschedule
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
);

export default function ConsultationsPage() {
  const {
    consultations,
    loading,
    error,
    fetchEligibleIdeas,
    fetchExternalMentors,
    requestConsultation,
    rescheduleConsultation,
    refreshConsultations,
  } = useConsultations();

  const { toast } = useToast();

  const isTTC =
    typeof window !== "undefined"
      ? localStorage.getItem("role") === "ttc_coordinator"
      : false;

  // State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = React.useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] =
    React.useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = React.useState(false);
  const [selectedConsultation, setSelectedConsultation] =
    React.useState<Consultation | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date()
  );

  // ✅ Request form state
  const [eligibleIdeas, setEligibleIdeas] = React.useState<any[]>([]);
  const [mentors, setMentors] = React.useState<any[]>([]);
  const [loadingIdeas, setLoadingIdeas] = React.useState(false);
  const [loadingMentors, setLoadingMentors] = React.useState(false);
  const [selectedIdea, setSelectedIdea] = React.useState("");
  const [selectedMentor, setSelectedMentor] = React.useState("");
  const [requestDate, setRequestDate] = React.useState<Date | undefined>();
  const [questions, setQuestions] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // ✅ Reschedule form state
  const [rescheduleDate, setRescheduleDate] = React.useState<
    Date | undefined
  >();
  const [rescheduleReason, setRescheduleReason] = React.useState("");

  // Load eligible ideas and mentors when request modal opens
  React.useEffect(() => {
    if (isRequestModalOpen) {
      loadRequestData();
    }
  }, [isRequestModalOpen]);

  const loadRequestData = async () => {
    try {
      setLoadingIdeas(true);
      setLoadingMentors(true);

      const [ideas, mentorsList] = await Promise.all([
        fetchEligibleIdeas(),
        fetchExternalMentors(),
      ]);

      setEligibleIdeas(ideas);
      setMentors(mentorsList);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to load data",
      });
    } finally {
      setLoadingIdeas(false);
      setLoadingMentors(false);
    }
  };

  React.useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading consultations",
        description: error,
      });
    }
  }, [error, toast]);

  const consultationDates = React.useMemo(() => {
    return consultations
      .filter((c) => c.date)
      .map((c) => {
        const [year, month, day] = c.date.split("-").map(Number);
        return new Date(year, month - 1, day);
      });
  }, [consultations]);

  const handleViewDetails = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsModalOpen(true);
  };

  const handleAction = (
    action: "reschedule" | "cancel",
    consultation: Consultation
  ) => {
    if (action === "reschedule") {
      setSelectedConsultation(consultation);
      setIsModalOpen(false);
      setIsRescheduleModalOpen(true);
    }
  };

  // ✅ Request consultation submit
  const handleRequestSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedIdea || !selectedMentor || !requestDate || !questions.trim()) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await requestConsultation(selectedIdea, {
        mentorId: selectedMentor,
        preferredDate: requestDate.toISOString(),
        questions: questions,
      });

      const messageText = isTTC
        ? "Consultation request submitted for your innovator! They will be notified."
        : "Consultation request submitted! You'll be notified once it's reviewed.";

      toast({
        title: "Success",
        description: messageText,
      });

      setIsRequestModalOpen(false);

      // Reset form
      setSelectedIdea("");
      setSelectedMentor("");
      setRequestDate(undefined);
      setQuestions("");

      await refreshConsultations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Reschedule submit
  const handleRescheduleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!rescheduleDate || !selectedConsultation) {
      toast({
        title: "Error",
        description: "Please select a new date",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await rescheduleConsultation(selectedConsultation.ideaId, {
        scheduledAt: rescheduleDate.toISOString(),
        reason: rescheduleReason.trim() || "Rescheduling consultation",
      });

      toast({
        title: "Reschedule Request Submitted",
        description: `Your request to reschedule "${selectedConsultation.title}" has been sent.`,
      });

      setIsRescheduleModalOpen(false);
      setSelectedConsultation(null);
      setRescheduleDate(undefined);
      setRescheduleReason("");

      await refreshConsultations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reschedule",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const upcomingConsultations = React.useMemo(() => {
    const today = startOfDay(new Date());

    return consultations.filter((c) => {
      if (!c.scheduledAt) return false;
      const consultationDate = new Date(c.scheduledAt);
      return (
        isAfter(consultationDate, today) &&
        (c.status === "Scheduled" ||
          c.status === "Pending" ||
          c.status === "assigned")
      );
    });
  }, [consultations]);

  const pastConsultations = React.useMemo(() => {
    const today = startOfDay(new Date());

    return consultations.filter((c) => {
      if (!c.scheduledAt) return false;
      const consultationDate = new Date(c.scheduledAt);
      return (
        isBefore(consultationDate, today) ||
        c.status === "Completed" ||
        c.status === "Cancelled"
      );
    });
  }, [consultations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {isTTC ? "Innovator Consultations" : "My Consultations"}
            </h1>
            <p className="text-muted-foreground">
              {isTTC
                ? "Manage and request consultations for your innovators."
                : "Manage and request consultations with mentors."}
            </p>
          </div>
          <Button onClick={() => setIsRequestModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Request Consultation
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <Tabs defaultValue="upcoming">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {isTTC ? "Innovator Consultations" : "My Consultations"}
                      </CardTitle>
                      <CardDescription>
                        A list of scheduled and past consultations.
                      </CardDescription>
                    </div>
                    <TabsList>
                      <TabsTrigger value="upcoming">
                        Upcoming ({upcomingConsultations.length})
                      </TabsTrigger>
                      <TabsTrigger value="past">
                        Past ({pastConsultations.length})
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>
                <CardContent>
                  <TabsContent value="upcoming">
                    {upcomingConsultations.length > 0 ? (
                      <ConsultationTable
                        consultations={upcomingConsultations}
                        onRowClick={handleViewDetails}
                        onActionSelect={handleAction}
                      />
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-muted-foreground">
                          {isTTC
                            ? "No upcoming consultations for your innovators."
                            : "You have no upcoming consultations."}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="past">
                    {pastConsultations.length > 0 ? (
                      <ConsultationTable
                        consultations={pastConsultations}
                        onRowClick={handleViewDetails}
                        onActionSelect={handleAction}
                      />
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-muted-foreground">
                          {isTTC
                            ? "No past consultations for your innovators."
                            : "You have no past consultations."}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6 sticky top-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Calendar</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCalendarModalOpen(true)}
                >
                  <Expand className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{ scheduled: consultationDates }}
                  modifiersClassNames={{
                    scheduled: "has-dot",
                  }}
                  className="p-0"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ✅ Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedConsultation?.status === "Completed"
                ? "Minutes of Meeting"
                : "Consultation Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedConsultation?.status === "Completed"
                ? `Summary for consultation on `
                : "Details for upcoming consultation on "}
              <span className="font-semibold text-foreground">
                "{selectedConsultation?.title}"
              </span>
              {selectedConsultation?.date && ` on ${selectedConsultation.date}`}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Mentor</h4>
              <div className="text-sm space-y-1">
                <p className="font-medium">{selectedConsultation?.mentor}</p>
                <p className="text-muted-foreground">
                  {selectedConsultation?.mentorEmail}
                </p>
                {selectedConsultation?.mentorOrganization && (
                  <p className="text-muted-foreground">
                    {selectedConsultation.mentorOrganization}
                  </p>
                )}
              </div>
            </div>
            <Separator />

            {selectedConsultation?.status === "Completed" && (
              <>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedConsultation.pointsDiscussed?.length > 0
                      ? selectedConsultation.pointsDiscussed.join(" ")
                      : "No summary provided"}
                  </p>
                </div>
                <Separator />
              </>
            )}

            <div>
              <h4 className="font-semibold text-sm mb-2">
                Agenda / Milestones
              </h4>
              {selectedConsultation?.agenda &&
              selectedConsultation.agenda.length > 0 ? (
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                  {selectedConsultation.agenda.map((milestone, i) => (
                    <li key={i}>{milestone}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No agenda items</p>
              )}
            </div>
            <Separator />

            {selectedConsultation?.status === "Completed" && (
              <>
                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    Action Items / To-Dos
                  </h4>
                  {selectedConsultation?.actionItems &&
                  selectedConsultation.actionItems.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedConsultation.actionItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <span className="text-foreground">{item.task}</span>
                            <p className="text-xs text-muted-foreground">
                              Owner: {item.owner} - Due: {item.dueDate}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No action items
                    </p>
                  )}
                </div>
                <Separator />
              </>
            )}

            <div>
              <h4 className="font-semibold text-sm mb-2">Attached Files</h4>
              {selectedConsultation?.files &&
              selectedConsultation.files.length > 0 ? (
                <div className="space-y-2">
                  {selectedConsultation.files.map((file, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      {file}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No files attached
                </p>
              )}
            </div>

            {selectedConsultation?.status === "Scheduled" && (
              <div className="pt-4 flex gap-2">
                <Button className="w-full">Join Meeting</Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (selectedConsultation) {
                      handleAction("reschedule", selectedConsultation);
                    }
                  }}
                >
                  Request Reschedule
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Request Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a New Consultation</DialogTitle>
            <DialogDescription>
              Fill out the details below to request a meeting with a mentor.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRequestSubmit}>
            <div className="grid gap-4 py-4">
              {/* Idea Selection */}
              <div className="space-y-2">
                <Label htmlFor="idea">Idea to Discuss *</Label>
                {loadingIdeas ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading eligible ideas...
                  </div>
                ) : (
                  <Select value={selectedIdea} onValueChange={setSelectedIdea}>
                    <SelectTrigger id="idea">
                      <SelectValue placeholder="Select an idea" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleIdeas.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No eligible ideas (score ≥ 85 required)
                        </div>
                      ) : (
                        eligibleIdeas.map((idea) => (
                          <SelectItem key={idea.id} value={idea.id}>
                            {idea.title} ({idea.overallScore}/100)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Mentor Selection */}
              <div className="space-y-2">
                <Label htmlFor="mentor">Preferred Mentor *</Label>
                {loadingMentors ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading mentors...
                  </div>
                ) : (
                  <Select
                    value={selectedMentor}
                    onValueChange={setSelectedMentor}
                  >
                    <SelectTrigger id="mentor">
                      <SelectValue placeholder="Select a mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mentors.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No mentors available
                        </div>
                      ) : (
                        mentors.map((mentor) => (
                          <SelectItem key={mentor.id} value={mentor.id}>
                            {mentor.name}
                            {mentor.organization && ` - ${mentor.organization}`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !requestDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {requestDate ? (
                        format(requestDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={requestDate}
                      onSelect={setRequestDate}
                      initialFocus
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Questions */}
              <div className="space-y-2">
                <Label htmlFor="questions">Questions / Topics *</Label>
                <Textarea
                  id="questions"
                  placeholder="What would you like to discuss?"
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ✅ Reschedule Modal */}
      <Dialog
        open={isRescheduleModalOpen}
        onOpenChange={setIsRescheduleModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request to Reschedule</DialogTitle>
            <DialogDescription>
              Propose a new date for your consultation on "
              {selectedConsultation?.title}".
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRescheduleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reschedule-date">New Preferred Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !rescheduleDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {rescheduleDate ? (
                        format(rescheduleDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={rescheduleDate}
                      onSelect={setRescheduleDate}
                      initialFocus
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">
                  Reason for Rescheduling (Optional)
                </Label>
                <Textarea
                  id="comment"
                  placeholder="Explain the reason..."
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reschedule Request"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Calendar Modal */}
      <Dialog open={isCalendarModalOpen} onOpenChange={setIsCalendarModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>My Calendar</DialogTitle>
            <DialogDescription>
              A full view of your consultations.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{ scheduled: consultationDates }}
              modifiersClassNames={{
                scheduled: "has-dot",
              }}
              className="p-0"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
