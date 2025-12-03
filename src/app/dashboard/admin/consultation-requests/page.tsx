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
import { CalendarIcon } from "lucide-react";
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

export default function ConsultationRequestsPage() {
  const { toast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [ideas, setIdeas] = React.useState<Idea[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [mentors, setMentors] = React.useState<Mentor[]>([]);
  const [mentorsLoading, setMentorsLoading] = React.useState(true);

  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [selectedIdea, setSelectedIdea] = React.useState<Idea | null>(null);
  const [selectedMentorId, setSelectedMentorId] = React.useState("");
  const [consultationDate, setConsultationDate] = React.useState<
    Date | undefined
  >(undefined);

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
        const res = await fetch(
          `${apiUrl}/api/mentors/external?status=active&limit=100`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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

    loadIdeas();
    loadMentors();
  }, [toast]);

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
          headers: { Authorization: `Bearer ${token}` },
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

  return (
    <div className="space-y-6">
      {/* Validated ideas list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Validated Ideas</CardTitle>
            <CardDescription>
              Assign external mentor consultations for validated ideas.
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
                    <TableCell className="font-medium">{idea.title}</TableCell>
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

      {/* History of consultations */}
      <Card>
        <CardHeader>
          <CardTitle>Consultation History</CardTitle>
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
                  <TableHead>Mentor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultedIdeas.map((idea) => (
                  <TableRow key={idea.id}>
                    <TableCell>{idea.title}</TableCell>
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
    </div>
  );
}
