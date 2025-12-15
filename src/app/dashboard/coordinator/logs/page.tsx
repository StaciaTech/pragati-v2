"use client";

import * as React from "react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

export default function CoordinatorLogsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const token = getToken();

  // ============ FETCH CREDIT REQUESTS ============
  const { data: creditRequestsData } = useQuery({
    queryKey: ["credit-requests"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${apiUrl}/api/coordinator/credit-requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    enabled: !!token,
  });

  // ============ FETCH AUDIT TRAIL ============
  const { data: auditTrailData } = useQuery({
    queryKey: ["audit-trail"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${apiUrl}/api/coordinator/audit-trail`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    enabled: !!token,
  });

  // ============ FETCH CREDIT HISTORY ============
  const { data: creditHistoryData } = useQuery({
    queryKey: ["credit-history"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${apiUrl}/api/coordinator/credit-history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    enabled: !!token,
  });

  // ============ FETCH USER PROFILE ============
  const { data: profileData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    enabled: !!token,
  });

  const creditRequests = creditRequestsData?.data || [];
  const auditTrail = auditTrailData?.data || [];
  const creditHistory = creditHistoryData?.data || [];
  const profile = profileData?.user;

  const pendingRequest = creditRequests.find(
    (req: any) => req.status === "pending"
  );

  // ============ CREATE CREDIT REQUEST MUTATION ============
  const createRequestMutation = useMutation({
    mutationFn: async (formData: { amount: number; purpose: string }) => {
      const { data } = await axios.post(
        `${apiUrl}/api/coordinator/credit-requests`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-requests"] });
      toast({
        title: "Request Sent",
        description: `Your credit request has been sent to the Principal for approval.`,
      });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create request",
        variant: "destructive",
      });
    },
  });

  // ============ CANCEL CREDIT REQUEST MUTATION ============
  const cancelRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { data } = await axios.delete(
        `${apiUrl}/api/coordinator/credit-requests/${requestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-requests"] });
      toast({
        title: "Request Cancelled",
        description: "Your credit request has been successfully cancelled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to cancel request",
        variant: "destructive",
      });
    },
  });

  const handleRequestCredits = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get("amount"));
    const purpose = formData.get("purpose") as string;

    createRequestMutation.mutate({ amount, purpose });
  };

  const handleCancelRequest = (requestId: string) => {
    cancelRequestMutation.mutate(requestId);
  };

  return (
    <>
      <div className="space-y-6">
        {pendingRequest && (
          <Card className="border-yellow-500">
            <CardHeader>
              <CardTitle>My Pending Request</CardTitle>
              <CardDescription>
                You have a credit request awaiting approval from your Principal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-semibold text-muted-foreground">
                  Amount:{" "}
                </span>
                {pendingRequest.amount} credits
              </p>
              <p>
                <span className="font-semibold text-muted-foreground">
                  Date:{" "}
                </span>
                {format(new Date(pendingRequest.createdAt), "PPP")}
              </p>
              <p>
                <span className="font-semibold text-muted-foreground">
                  Purpose:{" "}
                </span>
                {pendingRequest.purpose}
              </p>
            </CardContent>
            <CardFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Cancel Request</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently cancel your credit request. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Back</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleCancelRequest(pendingRequest._id)}
                    >
                      Yes, cancel it
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Logs & Requests</CardTitle>
            <CardDescription>
              View your activity logs and request credits from your college
              principal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Your Current Credit Quota:{" "}
              <span className="font-bold text-primary">
                {profile?.creditQuota || 0}
              </span>
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              disabled={!!pendingRequest || createRequestMutation.isPending}
            >
              {createRequestMutation.isPending
                ? "Sending..."
                : "Request Credits from Principal"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Credit Assignment History</CardTitle>
            <CardDescription>
              Credits you've assigned to innovators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Innovator</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creditHistory.map((log: any) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      {format(new Date(log.timestamp), "PPP")}
                    </TableCell>
                    <TableCell>
                      {log.innovatorName || log.innovatorId}
                    </TableCell>
                    <TableCell>{log.amount}</TableCell>
                    <TableCell>{log.action}</TableCell>
                  </TableRow>
                ))}
                {creditHistory.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No credit assignment history.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Audit Trail</CardTitle>
            <CardDescription>All your recent activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditTrail.map((log: any) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      {format(new Date(log.timestamp), "PPpp")}
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                  </TableRow>
                ))}
                {auditTrail.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground"
                    >
                      No audit trail entries.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Credits from Principal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRequestCredits}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Request</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  name="purpose"
                  placeholder="Explain why you need these credits."
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
              <Button type="submit" disabled={createRequestMutation.isPending}>
                {createRequestMutation.isPending
                  ? "Sending..."
                  : "Send Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
