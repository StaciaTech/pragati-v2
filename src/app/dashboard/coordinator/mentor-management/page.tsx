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
  CardFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus,
  UserX,
  UserCheck,
  MessageSquare,
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface Mentor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  expertise?: string[];
  isActive: boolean;
  createdAt: string;
  ttcCoordinatorId: string;
}

export default function MentorManagementPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = localStorage.getItem("token");
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  // State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalType, setModalType] = React.useState<"add" | "message">("add");
  const [selectedMentors, setSelectedMentors] = React.useState<string[]>([]);

  // Fetch mentors
  const { data: mentorsData, isLoading: loadingMentors } = useQuery({
    queryKey: ["internal-mentors"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${apiUrl}/api/coordinator/internal-mentors`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
  });

  const mentors: Mentor[] = mentorsData?.data || [];

  // Create mentor mutation
  const createMentorMutation = useMutation({
    mutationFn: async (mentorData: {
      name: string;
      email: string;
      phone?: string;
      department?: string;
      designation?: string;
      expertise?: string[];
    }) => {
      const { data } = await axios.post(
        `${apiUrl}/api/coordinator/create-internal-mentor`,
        mentorData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internal-mentors"] });
      toast({
        title: "Mentor Created",
        description: "Internal mentor has been added successfully.",
      });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to create mentor.",
        variant: "destructive",
      });
    },
  });

  // Activate/deactivate mentor
  const toggleStatusMutation = useMutation({
    mutationFn: async ({
      mentorId,
      isActive,
    }: {
      mentorId: string;
      isActive: boolean;
    }) => {
      const { data } = await axios.put(
        `${apiUrl}/api/coordinator/internal-mentors/${mentorId}/activate`,
        { isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internal-mentors"] });
      toast({
        title: "Status Updated",
        description: "Mentor status has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to update status.",
        variant: "destructive",
      });
    },
  });

  // Delete mentor
  const deleteMentorMutation = useMutation({
    mutationFn: async (mentorId: string) => {
      const { data } = await axios.delete(
        `${apiUrl}/api/coordinator/internal-mentors/${mentorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internal-mentors"] });
      toast({
        title: "Mentor Deleted",
        description: "Internal mentor has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to delete mentor.",
        variant: "destructive",
      });
    },
  });

  const handleOpenModal = (type: "add" | "message") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (modalType === "add") {
      const name = fd.get("name") as string;
      const email = fd.get("email") as string;
      const phone = fd.get("phone") as string;
      const department = fd.get("department") as string;
      const designation = fd.get("designation") as string;
      const expertise = (fd.get("expertise") as string)
        .split(",")
        .map((e) => e.trim());

      await createMentorMutation.mutateAsync({
        name,
        email,
        phone,
        department,
        designation,
        expertise,
      });
    }
  };

  const handleToggleStatus = (mentorId: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({
      mentorId,
      isActive: !currentStatus,
    });
  };

  const handleDelete = (mentorId: string) => {
    deleteMentorMutation.mutate(mentorId);
  };

  const handleRowClick = (mentorId: string) => {
    router.push(`/dashboard/coordinator/mentors/${mentorId}`);
  };

  const toggleSelectAll = (checked: boolean | string) => {
    if (checked) {
      setSelectedMentors(mentors.map((m) => m._id));
    } else {
      setSelectedMentors([]);
    }
  };

  const toggleSelectOne = (mentorId: string) => {
    setSelectedMentors((prev) =>
      prev.includes(mentorId)
        ? prev.filter((id) => id !== mentorId)
        : [...prev, mentorId]
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Internal Mentor Management</CardTitle>
            <CardDescription>
              Add and manage internal mentors (faculty/staff) for your
              innovators.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleOpenModal("message")}
              disabled={selectedMentors.length === 0}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Message Selected ({selectedMentors.length})
            </Button>
            <Button onClick={() => handleOpenModal("add")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Internal Mentor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingMentors ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading mentors...
                    </TableCell>
                  </TableRow>
                ) : mentors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No mentors found. Add your first internal mentor!
                    </TableCell>
                  </TableRow>
                ) : (
                  mentors.map((mentor) => (
                    <TableRow
                      key={mentor._id}
                      onClick={() => handleRowClick(mentor._id)}
                      className="cursor-pointer"
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedMentors.includes(mentor._id)}
                          onCheckedChange={() => toggleSelectOne(mentor._id)}
                        />
                      </TableCell>
                      <TableCell>
                        MENTOR-
                        {mentor._id?.slice(
                          mentor._id.length - 12,
                          mentor._id.length
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-primary hover:underline">
                        {mentor.name}
                      </TableCell>
                      <TableCell>{mentor.email}</TableCell>
                      <TableCell>{mentor.department || "N/A"}</TableCell>
                      <TableCell>{mentor.designation || "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={mentor.isActive ? "default" : "destructive"}
                        >
                          {mentor.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-right space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleToggleStatus(mentor._id, mentor.isActive)
                              }
                            >
                              {mentor.isActive ? (
                                <UserX className="h-4 w-4 text-red-500" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              )}
                              <span className="sr-only">
                                {mentor.isActive ? "Deactivate" : "Activate"}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{mentor.isActive ? "Deactivate" : "Activate"}</p>
                          </TooltipContent>
                        </Tooltip>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Mentor?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {mentor.name}?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(mentor._id)}
                              >
                                Yes, Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TooltipProvider>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Total Mentors: {mentors.length}
          </p>
        </CardFooter>
      </Card>

      {/* Add Mentor Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalType === "add"
                ? "Add New Internal Mentor"
                : `Message ${selectedMentors.length} Mentor(s)`}
            </DialogTitle>
            <DialogDescription>
              {modalType === "add"
                ? "Enter the details for the new internal mentor (faculty/staff)."
                : "Write a message to be sent to all selected mentors."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid gap-4 py-4">
              {modalType === "add" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expertise">
                      Expertise (comma-separated)
                    </Label>
                    <Input
                      id="expertise"
                      name="expertise"
                      placeholder="e.g., AI, Machine Learning, IoT"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="message">Broadcast Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    placeholder="e.g., Please review innovator submissions by Friday."
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={createMentorMutation.isPending}>
                {createMentorMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
