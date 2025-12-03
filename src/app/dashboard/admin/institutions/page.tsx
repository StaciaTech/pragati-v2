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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { FileText, Award, Mail, Building, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useColleges } from "@/hooks/useColleges";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

interface ExternalMentor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  organization: string;
  designation?: string;
  domains?: string[];
  bio?: string;
  ideasMentored?: number;
  isActive: boolean;
  createdAt: string;
}

export default function SuperAdminManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /* ========================================================================
     INSTITUTIONS SECTION
  ======================================================================== */
  const { data: colleges = [], isLoading: collegesLoading } = useColleges();

  const saveCollegeMutation = useMutation({
    mutationFn: async (payload: {
      id?: string;
      name: string;
      principalEmail: string;
      ttcLimit: number;
      creditQuota: number;
    }) => {
      const token = getToken();
      if (!token) throw new Error("No token");

      if (!payload.id) {
        return axios.post(
          `${apiUrl}/api/admin/create-principal`,
          {
            collegeName: payload.name,
            email: payload.principalEmail,
            ttcCoordinatorLimit: payload.ttcLimit,
            creditQuota: payload.creditQuota,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      return axios.put(
        `${apiUrl}/api/users/${payload.id}`,
        {
          collegeName: payload.name,
          email: payload.principalEmail,
          ttcCoordinatorLimit: payload.ttcLimit,
          creditQuota: payload.creditQuota,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: (_, vars) => {
      toast({
        title: `College ${vars.id ? "updated" : "created"}`,
        description: vars.name + " has been saved.",
      });
      setIsCollegeModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["all-colleges"] });
    },
    onError: (err: any) =>
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.response?.data?.error || "Unexpected error",
      }),
  });

  const toggleCollegeMutation = useMutation({
    mutationFn: async (id: string) =>
      axios.put(
        `${apiUrl}/api/users/${id}/toggle-active`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      ),
    onSuccess: () => {
      toast({ title: "College status toggled" });
      queryClient.invalidateQueries({ queryKey: ["all-colleges"] });
    },
  });

  const [isCollegeModalOpen, setIsCollegeModalOpen] = React.useState(false);
  const [collegeModalType, setCollegeModalType] = React.useState<
    "add" | "edit"
  >("add");
  const [currentCollege, setCurrentCollege] = React.useState<any>(null);

  const handleOpenCollegeModal = (type: "add" | "edit", college?: any) => {
    setCollegeModalType(type);
    setCurrentCollege(college || null);
    setIsCollegeModalOpen(true);
  };

  const handleSaveCollege = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveCollegeMutation.mutate({
      id: currentCollege?._id,
      name: fd.get("name") as string,
      principalEmail: fd.get("principalEmail") as string,
      ttcLimit: Number(fd.get("ttcLimit")),
      creditQuota: Number(fd.get("creditsAvailable")),
    });
  };

  const handleToggleCollege = (id: string) => toggleCollegeMutation.mutate(id);

  /* ========================================================================
     EXTERNAL MENTORS SECTION
  ======================================================================== */
  const { data: mentorsResp, isLoading: mentorsLoading } = useQuery({
    queryKey: ["external-mentors"],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(`${apiUrl}/api/mentors/external`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
  });

  const mentors: ExternalMentor[] = mentorsResp?.data || [];

  const saveMentorMutation = useMutation({
    mutationFn: async (payload: {
      id?: string;
      name: string;
      email: string;
      phone: string;
      organization: string;
      designation: string;
      domains: string[];
      bio: string;
    }) => {
      const token = getToken();
      if (!token) throw new Error("No token");

      if (!payload.id) {
        return axios.post(`${apiUrl}/api/mentors/external`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      return axios.put(
        `${apiUrl}/api/mentors/external/${payload.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: (response, vars) => {
      const tempPass = response.data?.tempPassword;
      toast({
        title: `Mentor ${vars.id ? "updated" : "created"}`,
        description: tempPass
          ? `Temporary password: ${tempPass}`
          : `${vars.name} has been saved.`,
      });
      setIsMentorModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["external-mentors"] });
    },
    onError: (err: any) =>
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.response?.data?.error || "Unexpected error",
      }),
  });

  const toggleMentorMutation = useMutation({
    mutationFn: async (id: string) =>
      axios.put(
        `${apiUrl}/api/mentors/external/${id}/toggle-active`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      ),
    onSuccess: () => {
      toast({ title: "Mentor status toggled" });
      queryClient.invalidateQueries({ queryKey: ["external-mentors"] });
    },
  });

  const [isMentorModalOpen, setIsMentorModalOpen] = React.useState(false);
  const [mentorModalType, setMentorModalType] = React.useState<"add" | "edit">(
    "add"
  );
  const [currentMentor, setCurrentMentor] =
    React.useState<ExternalMentor | null>(null);
  const [selectedDomains, setSelectedDomains] = React.useState<string[]>([]);

  const handleOpenMentorModal = (
    type: "add" | "edit",
    mentor?: ExternalMentor
  ) => {
    setMentorModalType(type);
    setCurrentMentor(mentor || null);
    setSelectedDomains(mentor?.domains || []);
    setIsMentorModalOpen(true);
  };

  const handleSaveMentor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveMentorMutation.mutate({
      id: currentMentor?._id,
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      organization: fd.get("organization") as string,
      designation: fd.get("designation") as string,
      domains: selectedDomains,
      bio: fd.get("bio") as string,
    });
  };

  const handleToggleMentor = (id: string) => toggleMentorMutation.mutate(id);

  const availableDomains = [
    "EdTech",
    "HealthTech",
    "FinTech",
    "AgriTech",
    "CleanTech",
    "AI/ML",
    "IoT",
    "Blockchain",
    "Cybersecurity",
    "Other",
  ];

  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domain)
        ? prev.filter((d) => d !== domain)
        : [...prev, domain]
    );
  };

  /* ========================================================================
     RENDER
  ======================================================================== */
  return (
    <div className="space-y-8">
      {/* ==================== INSTITUTIONS CARD ==================== */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Institution Management</CardTitle>
            <CardDescription>
              Add, edit, and manage colleges and their settings.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenCollegeModal("add")}>
            Add New College
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Principal Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collegesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : colleges.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No colleges found. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  colleges.map((college: any) => (
                    <TableRow key={college._id}>
                      <TableCell>{college._id}</TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/admin/institutions/${college._id}?role=Super Admin`}
                          className="hover:underline text-primary"
                        >
                          {college.collegeName}
                        </Link>
                      </TableCell>
                      <TableCell>{college.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={college.isActive ? "default" : "destructive"}
                        >
                          {college.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{college.creditQuota}</TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/dashboard/admin/institutions/${college._id}/legal`}
                          >
                            <FileText className="mr-2 h-4 w-4" /> Legal
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleOpenCollegeModal("edit", college)
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          variant={college.isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleCollege(college._id)}
                          disabled={toggleCollegeMutation.isPending}
                        >
                          {college.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ==================== EXTERNAL MENTORS CARD ==================== */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              External Mentors Management
            </CardTitle>
            <CardDescription>
              Add, edit, and manage external industry mentors.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenMentorModal("add")}>
            Add New Mentor
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Domains</TableHead>
                  <TableHead>Ideas Mentored</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mentorsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : mentors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No external mentors found. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  mentors.map((mentor) => (
                    <TableRow key={mentor._id}>
                      <TableCell className="font-medium">
                        {mentor.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {mentor.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {mentor.organization}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {mentor.domains?.slice(0, 2).map((domain) => (
                            <Badge
                              key={domain}
                              variant="secondary"
                              className="text-xs"
                            >
                              {domain}
                            </Badge>
                          ))}
                          {(mentor.domains?.length || 0) > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(mentor.domains?.length || 0) - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{mentor.ideasMentored || 0}</TableCell>
                      <TableCell>
                        <Badge
                          variant={mentor.isActive ? "default" : "destructive"}
                        >
                          {mentor.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenMentorModal("edit", mentor)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant={mentor.isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleMentor(mentor._id)}
                          disabled={toggleMentorMutation.isPending}
                        >
                          {mentor.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ==================== COLLEGE MODAL ==================== */}
      <Dialog open={isCollegeModalOpen} onOpenChange={setIsCollegeModalOpen}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>
              {collegeModalType === "add" ? "Add New College" : "Edit College"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCollege}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">College Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={currentCollege?.collegeName}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="principalEmail">Principal Email</Label>
                <Input
                  id="principalEmail"
                  name="principalEmail"
                  type="email"
                  defaultValue={currentCollege?.email}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ttcLimit">TTC Limit</Label>
                  <Input
                    id="ttcLimit"
                    name="ttcLimit"
                    type="number"
                    defaultValue={currentCollege?.ttcCoordinatorLimit}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditsAvailable">Credits Available</Label>
                  <Input
                    id="creditsAvailable"
                    name="creditsAvailable"
                    type="number"
                    defaultValue={currentCollege?.creditQuota}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={saveCollegeMutation.isPending}>
                {saveCollegeMutation.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==================== MENTOR MODAL ==================== */}
      <Dialog open={isMentorModalOpen} onOpenChange={setIsMentorModalOpen}>
        <DialogContent className="z-50 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mentorModalType === "add" ? "Add New Mentor" : "Edit Mentor"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveMentor}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mentor-name">Full Name *</Label>
                  <Input
                    id="mentor-name"
                    name="name"
                    defaultValue={currentMentor?.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mentor-email">Email *</Label>
                  <Input
                    id="mentor-email"
                    name="email"
                    type="email"
                    defaultValue={currentMentor?.email}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={currentMentor?.phone}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization *</Label>
                  <Input
                    id="organization"
                    name="organization"
                    defaultValue={currentMentor?.organization}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  name="designation"
                  defaultValue={currentMentor?.designation}
                  placeholder="e.g., CTO, Senior Engineer"
                />
              </div>

              <div className="space-y-2">
                <Label>Expertise Domains</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                  {availableDomains.map((domain) => (
                    <Badge
                      key={domain}
                      variant={
                        selectedDomains.includes(domain) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleDomain(domain)}
                    >
                      {domain}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Click to select/deselect domains
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={currentMentor?.bio}
                  placeholder="Brief professional background..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={saveMentorMutation.isPending}>
                {saveMentorMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving…
                  </>
                ) : (
                  "Save Mentor"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
