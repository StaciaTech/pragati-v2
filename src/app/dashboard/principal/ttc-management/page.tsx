"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_CREDIT_REQUESTS } from "@/lib/data/platform";
import {
  MOCK_TTCS,
  MOCK_INNOVATORS,
  MOCK_COLLEGES,
} from "@/lib/data/organization";
import { MOCK_IDEAS } from "@/lib/data/ideas";
import { STATUS_COLORS } from "@/lib/data/platform";
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
  AlertDialogTrigger,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lightbulb } from "lucide-react";
import { ROLES } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTtcRequests } from "@/hooks/useTtcRequests";
import { useAllInnovators } from "@/hooks/useAllInnovators";
import { useTtcs } from "@/hooks/useTtcs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import axios from "axios";

type Ttc = (typeof MOCK_TTCS)[0];

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () => localStorage.getItem("token");
const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export default function TTCManagementPage() {
  const { toast } = useToast();
  //   const [ttcs, setTtcs] = React.useState(MOCK_TTCS);
  // const [requests, setRequests] = React.useState(MOCK_CREDIT_REQUESTS);

  const { data: requests = [], isLoading: loadingTtcRequest } =
    useTtcRequests();

  const { data: innovators = [], isLoading: loadingInoovators } =
    useAllInnovators();

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [modalType, setModalType] = React.useState<"add" | "edit">("add");
  const [currentTtc, setCurrentTtc] = React.useState<Ttc | null>(null);

  const [isRequestsModalOpen, setIsRequestsModalOpen] = React.useState(false);
  const [isInnovatorModalOpen, setIsInnovatorModalOpen] = React.useState(false);
  const [selectedTtcForInnovators, setSelectedTtcForInnovators] =
    React.useState<Ttc | null>(null);

  const pendingTTCRequests = requests.filter(
    (req) => req.requesterType === "TTC" && req.status === "Pending"
  );

  // Assuming a single college for the principal view
  const token = getToken();
  const collegeId = React.useMemo(() => {
    if (!token) return "";
    try {
      return JSON.parse(atob(token.split(".")[1])).uid;
    } catch {
      return "";
    }
  }, [token]);

  const { data: ttcs = [], isLoading: loadingTtcs } = useTtcs(collegeId);

  // const collegeTtcs = ttcs.filter((ttc) => ttc.collegeId === collegeId);
  //   const collegeInnovators = MOCK_INNOVATORS.filter(
  //     (inv) => inv.collegeId === collegeId
  //   );

  const innovatorsByTtc = React.useMemo(() => {
    const map: Record<string, typeof innovators> = {};
    for (const innovator of innovators) {
      const key = innovator.createdBy;
      (map[key] ??= []).push(innovator);
    }
    return map;
  }, [innovators]);

  const handleOpenEditModal = (type: "add" | "edit", ttc?: Ttc) => {
    setModalType(type);
    setCurrentTtc(ttc || null);
    setIsEditModalOpen(true);
  };

  //   const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
  //     event.preventDefault();
  //     const formData = new FormData(event.currentTarget);
  //     const name = formData.get("name") as string;
  //     toast({
  //       title: `TTC ${modalType === "add" ? "Added" : "Updated"}`,
  //       description: `${name} has been successfully saved.`,
  //     });
  //     setIsEditModalOpen(false);
  //   };

  //   const handleToggleStatus = (id: string) => {
  //     setTtcs((prev) =>
  //       prev.map((ttc) =>
  //         ttc.id === id
  //           ? ({
  //               ...ttc,
  //               status: ttc.status === "Active" ? "Inactive" : "Active",
  //             } as any)
  //           : ttc
  //       )
  //     );
  //     toast({
  //       title: "Status Updated",
  //       description: "TTC status has been toggled.",
  //     });
  //   };

  const queryClient = useQueryClient();

  /* ---- ADD / EDIT TTC ---- */
  const saveTtcMutation = useMutation({
    mutationFn: async (payload: {
      id?: string;
      name: string;
      email: string;
      expertise: string[]; // <-- still typed as array internally
    }) => {
      const token = getToken();
      if (!token) throw new Error("No token");

      const body = {
        name: payload.name,
        email: payload.email,
        expertise: payload.expertise.join(","), // <-- fix: send CSV
      };

      if (!payload.id) {
        // ADD
        return axios.post(`${apiUrl}/api/principal/create-coordinator`, body, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      // EDIT (PUT /api/users/:id)
      return axios.put(`${apiUrl}/api/users/${payload.id}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-ttcs", collegeId] });
      toast({ title: `TTC ${modalType === "add" ? "added" : "updated"}` });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Unexpected error",
      }),
  });

  const updateUser = useUpdateUser();

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const payload = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      expertise: (form.get("expertise") as string)
        .split(",")
        .map((s) => s.trim()),
    };

    if (modalType === "edit" && currentTtc?._id) {
      updateUser.mutate(
        {
          uid: currentTtc._id,
          data: payload,
          queryKey: ["all-ttcs", collegeId],
        },
        { onSuccess: () => setIsEditModalOpen(false) }
      );
    } else {
      saveTtcMutation.mutate(payload, {
        onSuccess: () => setIsEditModalOpen(false),
      });
    }
  };

  /* ---- TOGGLE STATUS ---- */
  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = getToken();
      if (!token) throw new Error("No token");
      return axios.put(
        `${apiUrl}/api/users/${id}/toggle-active`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    // inside saveTtcMutation & toggleStatusMutation
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-ttcs", collegeId] });
    },
    onError: () => toast({ title: "Failed to toggle status" }),
  });

  const handleToggleStatus = (id: string) => toggleStatusMutation.mutate(id);

  const decideRequestMutation = useMutation({
    mutationFn: async ({
      requestId,
      action,
    }: {
      requestId: string;
      action: "approved" | "rejected";
    }) => {
      const token = getToken();
      if (!token) throw new Error("No token");
      return axios.put(
        `${apiUrl}/api/credits/college/incoming-requests/${requestId}/decide`,
        { decision: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      toast({ title: "Request updated" });
      // refresh the pending-requests list
      queryClient.invalidateQueries({ queryKey: ["ttc-credit-requests"] });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Unexpected error",
      }),
  });

  const handleRequestAction = (
    requestId: string,
    action: "approved" | "rejected"
  ) => decideRequestMutation.mutate({ requestId, action });

  const handleTtcClick = (ttc: Ttc) => {
    setSelectedTtcForInnovators(ttc);
    setIsInnovatorModalOpen(true);
  };

  const getIdeasForInnovator = (innovatorEmail: string) => {
    return MOCK_IDEAS.filter((idea) => idea.innovatorEmail === innovatorEmail);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>TTC Management</CardTitle>
            <CardDescription>
              Add, edit, and manage TTCs for your college.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsRequestsModalOpen(true)}
              disabled={pendingTTCRequests.length === 0}
            >
              Pending Requests{" "}
              <Badge className="ml-2">{pendingTTCRequests.length}</Badge>
            </Button>
            <Button onClick={() => handleOpenEditModal("add")}>
              Add New TTC
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ttcs.map((ttc) => (
              <Card
                key={ttc._id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleTtcClick(ttc)}
              >
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="flex flex-row items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${ttc.name}.png`}
                        alt={ttc.name}
                      />
                      <AvatarFallback>{getInitials(ttc.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{ttc.name}</CardTitle>
                      <CardDescription>{ttc.email}</CardDescription>
                      <div className="flex gap-1 mt-1">
                        {ttc.expertise.map((e) => (
                          <Badge key={e} variant="secondary">
                            {e}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Badge variant={ttc.isActive ? "default" : "destructive"}>
                    {ttc.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <p>
                      Assigned Innovators:{" "}
                      <span className="font-bold text-foreground">
                        {innovatorsByTtc[ttc.id]?.length || 0}
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal("edit", ttc);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant={ttc.isActive ? "destructive" : "default"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(ttc.id);
                        }}
                      >
                        {ttc.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {ttcs.length === 0 && (
              <p className="text-muted-foreground text-center col-span-full py-10">
                No TTCs found for your college.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalType === "add" ? "Add New TTC" : "Edit TTC"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">TTC Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={currentTtc?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={currentTtc?.email}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expertise">Expertise (comma-separated)</Label>
                <Input
                  id="expertise"
                  name="expertise"
                  defaultValue={currentTtc?.expertise.join(", ")}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRequestsModalOpen} onOpenChange={setIsRequestsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pending TTC Credit Requests</DialogTitle>
            <DialogDescription>
              Approve or reject credit requests from your TTCs.
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingTTCRequests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>{req.name}</TableCell>
                  <TableCell>{req.amount}</TableCell>
                  <TableCell>{req.createdAt}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {req.reason}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm">Approve</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Approve Request?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to approve this request for{" "}
                            {req.amount} credits?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleRequestAction(req._id, "Approved")
                            }
                          >
                            Yes, Approve
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Request?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject this request? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleRequestAction(req._id, "Rejected")
                            }
                          >
                            Yes, Reject
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {pendingTTCRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No pending TTC requests.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isInnovatorModalOpen}
        onOpenChange={setIsInnovatorModalOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Innovators under {selectedTtcForInnovators?.name}
            </DialogTitle>
            <DialogDescription>
              List of innovators managed by this TTC. Click an innovator to see
              their ideas.
            </DialogDescription>
          </DialogHeader>
          {innovatorsByTtc[selectedTtcForInnovators?._id || ""]?.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {innovatorsByTtc[selectedTtcForInnovators?._id || ""].map(
                (innovator) => {
                  const ideas = getIdeasForInnovator(innovator.email);
                  return (
                    <AccordionItem value={innovator._id} key={innovator._id}>
                      <AccordionTrigger>
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 text-xs">
                              <AvatarImage
                                src={`https://avatar.vercel.sh/${innovator.name}.png`}
                                alt={innovator.name}
                              />
                              <AvatarFallback>
                                {getInitials(innovator.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {innovator.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Lightbulb className="h-3 w-3" />
                              {ideas.length}
                            </Badge>
                            <Badge
                              variant={
                                innovator.isActive ? "default" : "destructive"
                              }
                            >
                              {innovator.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {ideas.length > 0 ? (
                          <ul className="space-y-1 pl-8 pr-4">
                            {ideas.map((idea) => (
                              <li
                                key={idea.id}
                                className="text-xs flex justify-between items-center"
                              >
                                <span>- {idea.title}</span>
                                <Badge
                                  className={`${
                                    STATUS_COLORS[idea.status]
                                  } text-white`}
                                >
                                  {idea.status}
                                </Badge>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground pl-8">
                            No ideas submitted by this innovator.
                          </p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                }
              )}
            </Accordion>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No innovators assigned to this TTC.
            </p>
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
