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

/* ----------  UI dialogs / forms  ---------- */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

/* ----------  data fetching / mutations  ---------- */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useMentors } from "@/hooks/useMentors"; // ← the hook we created earlier

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
const getToken = () => localStorage.getItem("token");

export default function PrincipalMentorManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /* ----------  local state  ---------- */
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = React.useState(false);

  /* ----------  server state  ---------- */
  const { data: mentors = [], isLoading, error } = useMentors(); // hook already filters by caller's college

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
      toast({ title: "Mentor added" });
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      setIsAddModalOpen(false);
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Failed to add mentor",
      }),
  });

  const bulkMutation = useMutation({
    mutationFn: async (file: File) => {
      const token = getToken();
      if (!token) throw new Error("No token");
      const form = new FormData();
      form.append("file", file);
      return axios.post(`${apiUrl}/api/mentors/bulk`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast({ title: "Bulk upload complete" });
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
      setIsBulkModalOpen(false);
    },
    onError: (err: any) =>
      toast({
        title: "Upload failed",
        description: err?.response?.data?.error || "Unknown error",
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
      });
      return;
    }
    bulkMutation.mutate(file);
  };

  const handleToggleStatus = (mentorId: string) => {
    toast({ title: "Not implemented", description: "Toggle mentor status" });
  };

  /* ----------  derived data  ---------- */
  const filteredMentors = mentors.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMentors.map((mentor) => (
                <TableRow key={mentor._id}>
                  <TableCell className="font-medium">{mentor.name}</TableCell>
                  <TableCell>{mentor.email}</TableCell>
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
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleToggleStatus(mentor._id)}
                      disabled
                    >
                      Deactivate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMentors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
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
                <Input id="expertise" name="expertise" required />
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
              Expected columns: name, email, expertise
            </p>
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
