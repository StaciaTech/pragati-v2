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
import { useToast } from "@/hooks/use-toast";
import { STATUS_COLORS } from "@/lib/data/platform";
import { Eye, Loader2 } from "lucide-react";

/* ----------  UI dialogs / forms  ---------- */
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
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

/* ----------  data fetching / mutations  ---------- */
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
const getToken = () => localStorage.getItem("token");

export default function PrincipalMentorManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /* ----------  local state  ---------- */
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = React.useState(false);
  const [selectedMentorId, setSelectedMentorId] = React.useState<string | null>(
    null,
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);

  /* ----------  Fetch Internal Mentors  ---------- */
  const {
    data: mentorsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["internal-mentors"],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("No token");
      const { data } = await axios.get(
        `${apiUrl}/api/principal/internal-mentors`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
    enabled: !!getToken(),
  });

  const mentors = mentorsData?.data || [];

  /* ----------  Fetch Mentor Assignments  ---------- */
  const {
    data: assignmentsData,
    isLoading: assignmentsLoading,
    error: assignmentsError,
  } = useQuery({
    queryKey: ["mentor-assignments", selectedMentorId],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("No token");
      const { data } = await axios.get(
        `${apiUrl}/api/principal/mentors/${selectedMentorId}/assignments`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
    enabled: !!selectedMentorId && isDetailsModalOpen,
  });

  // ✅ Refactored Data Processing for New Schema
  const mentorDetails = assignmentsData?.data || {};
  const assignments = mentorDetails?.assignments || [];
  const innovatorsList = mentorDetails?.innovators || [];

  // Create a lookup map for innovators
  const innovatorsMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    innovatorsList.forEach((inn: any) => {
      map[inn.id] = inn;
    });
    return map;
  }, [innovatorsList]);

  // Derived Stats
  const totalIdeas = assignments.length;
  const uniqueInnovators = innovatorsList.length;

  /* ----------  mutations  ---------- */
  const addMentorMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      expertise: string;
    }) => {
      const token = getToken();
      if (!token) throw new Error("No token");
      return axios.post(`${apiUrl}/api/principal/create-mentor`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast({ title: "Mentor added successfully" });
      queryClient.invalidateQueries({ queryKey: ["internal-mentors"] });
      setIsAddModalOpen(false);
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Failed to add mentor",
        variant: "destructive",
      }),
  });

  const bulkMutation = useMutation({
    mutationFn: async (file: File) => {
      const token = getToken();
      if (!token) throw new Error("No token");
      const form = new FormData();
      form.append("file", file);
      return axios.post(`${apiUrl}/api/principal/mentors/bulk`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: (response) => {
      const { created, errors } = response.data;
      toast({
        title: "Bulk upload complete",
        description: `${created.length} mentors created. ${errors.length} errors.`,
      });
      queryClient.invalidateQueries({ queryKey: ["internal-mentors"] });
      setIsBulkModalOpen(false);
    },
    onError: (err: any) =>
      toast({
        title: "Upload failed",
        description: err?.response?.data?.error || "Unknown error",
        variant: "destructive",
      }),
  });

  /* ----------  Toggle Status Mutation  ---------- */
  const toggleStatusMutation = useMutation({
    mutationFn: async ({
      mentorId,
      isActive,
    }: {
      mentorId: string;
      isActive: boolean;
    }) => {
      const token = getToken();
      if (!token) throw new Error("No token");
      return axios.put(
        `${apiUrl}/api/principal/internal-mentors/${mentorId}/activate`,
        { isActive },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    },
    onSuccess: () => {
      toast({ title: "Mentor status updated" });
      queryClient.invalidateQueries({ queryKey: ["internal-mentors"] });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Failed to update status",
        variant: "destructive",
      }),
  });

  /* ----------  Delete Mentor Mutation  ---------- */
  const deleteMentorMutation = useMutation({
    mutationFn: async (mentorId: string) => {
      const token = getToken();
      if (!token) throw new Error("No token");
      return axios.delete(
        `${apiUrl}/api/principal/internal-mentors/${mentorId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
    },
    onSuccess: () => {
      toast({ title: "Mentor deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["internal-mentors"] });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Failed to delete mentor",
        variant: "destructive",
      }),
  });

  /* ----------  handlers  ---------- */
  const handleAddSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addMentorMutation.mutate({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      expertise: fd.get("expertise") as string,
    });
  };

  const handleBulkFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["csv", "xlsx", "xls"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!allowed.includes(ext!)) {
      toast({
        title: "Invalid file type",
        description: "Please upload .csv or .xlsx",
        variant: "destructive",
      });
      return;
    }
    bulkMutation.mutate(file);
  };

  const handleToggleStatus = (mentorId: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ mentorId, isActive: !currentStatus });
  };

  const handleDeleteMentor = (mentorId: string) => {
    deleteMentorMutation.mutate(mentorId);
  };

  /* ----------  derived data  ---------- */
  const filteredMentors = mentors.filter(
    (m: any) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading)
    return (
      <p className="p-4 text-sm text-muted-foreground">Loading mentors…</p>
    );
  if (error)
    return (
      <p className="p-4 text-sm text-destructive">Failed to load mentors.</p>
    );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Internal Mentor Management</CardTitle>
            <CardDescription>
              View and manage all internal mentors within your institution.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsBulkModalOpen(true)}>
              Bulk Upload (.csv / .xlsx)
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>Add Mentor</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMentors.map((mentor: any) => (
                <TableRow key={mentor._id}>
                  <TableCell className="font-medium">{mentor.name}</TableCell>
                  <TableCell>{mentor.email}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p className="font-medium">{mentor.createdByName}</p>
                      <p className="text-muted-foreground">
                        {mentor.createdByRole === "college_admin"
                          ? "Principal"
                          : "TTC Coordinator"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        mentor.isActive
                          ? STATUS_COLORS.Active
                          : STATUS_COLORS.Inactive
                      }
                    >
                      {mentor.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View Details"
                        onClick={() => {
                          setSelectedMentorId(mentor._id);
                          setIsDetailsModalOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={mentor.isActive ? "outline" : "default"}
                        size="sm"
                        onClick={() =>
                          handleToggleStatus(mentor._id, mentor.isActive)
                        }
                        disabled={toggleStatusMutation.isPending}
                      >
                        {mentor.isActive ? "Deactivate" : "Activate"}
                      </Button>

                      {/* Delete Button with Confirmation */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deleteMentorMutation.isPending}
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete{" "}
                              <strong>{mentor.name}</strong> from the system.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteMentor(mentor._id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Yes, delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMentors.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No mentors found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ----------  SINGLE ADD MODAL  ---------- */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <form onSubmit={handleAddSave}>
            <DialogHeader>
              <DialogTitle>Add New Mentor</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expertise">Expertise (comma-separated)</Label>
                <Input
                  id="expertise"
                  name="expertise"
                  placeholder="e.g. AI, Machine Learning, IoT"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={addMentorMutation.isPending}>
                {addMentorMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ----------  BULK UPLOAD MODAL  ---------- */}
      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload Mentors</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="bulk-file">Choose .csv or .xlsx file</Label>
            <Input
              id="bulk-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleBulkFile}
              disabled={bulkMutation.isPending}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Expected columns: <strong>name, email, expertise</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Expertise should be comma-separated values
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ----------  VIEW DETAILS MODAL  ---------- */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Mentor Details</DialogTitle>
            <DialogDescription>
              Assignments and details for the selected mentor.
            </DialogDescription>
          </DialogHeader>

          {assignmentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading details...
              </span>
            </div>
          ) : assignmentsError ? (
            <div className="p-4 text-center text-destructive">
              Failed to load assignments.
            </div>
          ) : !mentorDetails?.mentor ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
              <span className="text-lg font-semibold">No Data Available</span>
              <span className="text-sm">
                Could not retrieve details for this mentor.
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mentor Info */}
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-secondary/10">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
                  </p>
                  <p className="text-lg font-bold">
                    {mentorDetails?.mentor?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-lg font-bold">
                    {mentorDetails?.mentor?.email || "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Expertise
                  </p>
                  <p className="text-sm">
                    {mentorDetails?.mentor?.expertise || "N/A"}
                  </p>
                </div>
              </div>

              {/* Stats Checks */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border p-4 rounded-lg text-center bg-primary/5">
                  <p className="text-2xl font-bold text-primary">
                    {totalIdeas}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Total Ideas
                  </p>
                </div>
                <div className="border p-4 rounded-lg text-center bg-primary/5">
                  <p className="text-2xl font-bold text-primary">
                    {uniqueInnovators}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Innovators
                  </p>
                </div>
              </div>

              {/* Assigned Ideas */}
              <div>
                <h3 className="text-md font-semibold mb-2">Assigned Ideas</h3>
                {assignments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Idea Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Innovator</TableHead>
                        <TableHead>Assigned Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment: any, idx: number) => {
                        const innovator =
                          innovatorsMap[assignment.innovatorId] || {};
                        return (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">
                              {assignment.title}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {assignment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {innovator.name || "Unknown"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {innovator.email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {assignment.submittedAt
                                ? new Date(
                                    assignment.submittedAt,
                                  ).toLocaleDateString()
                                : "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">
                    No ideas assigned to this mentor yet.
                  </p>
                )}
              </div>
            </div>
          )}

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
