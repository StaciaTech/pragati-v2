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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useConsultations, type Consultation } from "@/hooks/useConsultations";
import { STATUS_COLORS } from "@/lib/data/platform";

export default function CoordinatorConsultationsPage() {
  const { toast } = useToast();
  const { consultations, loading, error } = useConsultations();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<
    "all" | "Pending" | "Scheduled" | "Completed"
  >("all");

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] =
    React.useState(false);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = React.useState(false);

  const [selectedConsultation, setSelectedConsultation] =
    React.useState<Consultation | null>(null);
  const [rescheduleDate, setRescheduleDate] = React.useState<Date | undefined>(
    undefined
  );
  const [rescheduleTime, setRescheduleTime] = React.useState("");

  // Show error toast if hook failed
  React.useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Failed to load consultations",
        description: error,
      });
    }
  }, [error, toast]);

  // Filter consultations by search + status
  const filteredConsultations = React.useMemo(() => {
    return consultations.filter((c) => {
      const title = c.title?.toLowerCase() || "";
      const innovator = c.innovatorName?.toLowerCase() || "";

      const matchesSearch =
        title.includes(searchTerm.toLowerCase()) ||
        innovator.includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "all" || c.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [consultations, searchTerm, filterStatus]);

  const handleRsvp = (
    consultationId: string,
    action: "Accepted" | "Declined" | "Tentative"
  ) => {
    toast({
      title: `Consultation ${action}`,
      description: `The consultation has been ${action.toLowerCase()}.`,
    });
    setIsRsvpModalOpen(false);
    // TODO: call backend to store TTC's RSVP decision
  };

  const openRescheduleModal = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsRescheduleModalOpen(true);
    setIsRsvpModalOpen(false);
  };

  const openRsvpModal = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsRsvpModalOpen(true);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Reschedule Suggested",
      description: `A new time has been suggested for the consultation on "${selectedConsultation?.title}".`,
    });
    setIsRescheduleModalOpen(false);
    setRescheduleDate(undefined);
    setRescheduleTime("");
    // TODO: call backend /api/ideas/<id>/consultation/reschedule from TTC side
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Consultation Management</CardTitle>
          <CardDescription>
            Manage your assigned consultations with innovators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              placeholder="Search by Idea Title or Innovator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={filterStatus}
              onValueChange={(v) =>
                setFilterStatus(
                  v as "all" | "Pending" | "Scheduled" | "Completed"
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Idea Title</TableHead>
                <TableHead>Innovator</TableHead>
                <TableHead>Date &amp; Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsultations.map((c) => {
                const hasSchedule = !!c.scheduledAt;
                const dateStr = hasSchedule
                  ? format(new Date(c.scheduledAt), "PPP")
                  : "Pending";
                const timeStr = hasSchedule
                  ? format(new Date(c.scheduledAt), "p")
                  : "";

                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>{c.innovatorName ?? "—"}</TableCell>
                    <TableCell>
                      {hasSchedule ? `${dateStr} at ${timeStr}` : "Pending"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          STATUS_COLORS[
                            c.status as keyof typeof STATUS_COLORS
                          ] || ""
                        }
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {c.status === "Pending" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRsvpModal(c)}
                        >
                          Respond
                        </Button>
                      ) : (
                        <Button variant="link" size="sm">
                          View Details
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredConsultations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No consultations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* RSVP Dialog */}
      <Dialog open={isRsvpModalOpen} onOpenChange={setIsRsvpModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Consultation Request</DialogTitle>
            <DialogDescription>
              Review the request from {selectedConsultation?.innovatorName} for
              the idea "{selectedConsultation?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>
              <span className="font-semibold text-muted-foreground">
                Requested Date &amp; Time:
              </span>{" "}
              {selectedConsultation?.scheduledAt
                ? `${format(
                    new Date(selectedConsultation.scheduledAt),
                    "PPP"
                  )} at ${format(
                    new Date(selectedConsultation.scheduledAt),
                    "p"
                  )}`
                : "Not specified"}
            </p>
            <p>
              <span className="font-semibold text-muted-foreground">
                Topics for Discussion:
              </span>{" "}
              {/* You can replace this with real agenda from backend */}A mock
              set of topics would go here.
            </p>
          </div>
          <DialogFooter className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="sm:col-span-2">Accept</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Accept Consultation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will confirm your availability for the proposed time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      selectedConsultation &&
                      handleRsvp(selectedConsultation.id, "Accepted")
                    }
                  >
                    Yes, Accept
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="destructive"
              onClick={() =>
                selectedConsultation &&
                handleRsvp(selectedConsultation.id, "Declined")
              }
            >
              Decline
            </Button>
            <Button
              className="sm:col-span-4"
              variant="secondary"
              onClick={() =>
                selectedConsultation &&
                openRescheduleModal(selectedConsultation)
              }
            >
              Suggest New Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={isRescheduleModalOpen}
        onOpenChange={setIsRescheduleModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Consultation</DialogTitle>
            <DialogDescription>
              Propose a new date and time for the consultation on "
              {selectedConsultation?.title}".
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRescheduleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">New Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
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
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">New Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Comment (Optional)</Label>
                <Textarea
                  id="comment"
                  name="comment"
                  placeholder="Add a comment to explain the reason for rescheduling..."
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Suggest New Time</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
