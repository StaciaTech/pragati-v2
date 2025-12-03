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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useCollegeIncomingRequests,
  useDecideCreditRequest,
  useMyPendingRequest,
  useCancelCreditRequest,
} from "@/hooks/useCreditApis";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function PrincipalCreditRequestsPage() {
  const { toast } = useToast();
  const [rejectReason, setRejectReason] = React.useState("");
  const [rejectingId, setRejectingId] = React.useState<string | null>(null);

  // Fetch data
  const { data: allRequests = [], isLoading } = useCollegeIncomingRequests();
  const { data: myPendingRequest } = useMyPendingRequest();

  // Mutations
  const decideMutation = useDecideCreditRequest();
  const cancelMutation = useCancelCreditRequest();

  // Separate requests by status
  const pendingRequests = allRequests.filter((r) => r.status === "pending");
  const historyRequests = allRequests.filter((r) => r.status !== "pending");

  const handleApprove = async (
    requestId: string,
    amount: number,
    ttcName: string
  ) => {
    try {
      await decideMutation.mutateAsync({
        requestId,
        decision: "approved",
      });

      toast({
        title: "Request Approved",
        description: `Successfully transferred ${amount} credits to ${ttcName}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description:
          error?.response?.data?.error || "Failed to approve request.",
      });
    }
  };

  const handleReject = async (requestId: string, ttcName: string) => {
    if (!rejectReason.trim()) {
      toast({
        variant: "destructive",
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
      });
      return;
    }

    try {
      await decideMutation.mutateAsync({
        requestId,
        decision: "rejected",
        reason: rejectReason,
      });

      toast({
        title: "Request Rejected",
        description: `Credit request from ${ttcName} has been rejected.`,
      });

      setRejectingId(null);
      setRejectReason("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description:
          error?.response?.data?.error || "Failed to reject request.",
      });
    }
  };

  const handleCancelMyRequest = async () => {
    if (!myPendingRequest) return;

    try {
      await cancelMutation.mutateAsync(myPendingRequest._id);

      toast({
        title: "Request Cancelled",
        description: "Your credit request has been cancelled successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description:
          error?.response?.data?.error || "Failed to cancel request.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* My Pending Request Card */}
      {myPendingRequest && myPendingRequest.level === "ttc-college" && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle>My Pending Request</CardTitle>
            <CardDescription>
              You have a credit purchase request awaiting approval from the
              Super Admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-semibold text-muted-foreground">
                Amount:{" "}
              </span>
              {myPendingRequest.amount} credits
            </p>
            <p>
              <span className="font-semibold text-muted-foreground">
                Date:{" "}
              </span>
              {new Date(myPendingRequest.createdAt).toLocaleDateString()}
            </p>
            <p>
              <span className="font-semibold text-muted-foreground">
                Purpose:{" "}
              </span>
              {myPendingRequest.reason}
            </p>
          </CardContent>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Cancel My Request
                </Button>
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
                  <AlertDialogAction onClick={handleCancelMyRequest}>
                    Yes, cancel it
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      )}

      {/* Pending Requests from TTCs */}
      <Card>
        <CardHeader>
          <CardTitle>
            Pending Credit Requests ({pendingRequests.length})
          </CardTitle>
          <CardDescription>
            Approve or reject credit requests from your TTC Coordinators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TTC Coordinator</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell className="font-medium">
                    {req.ttcName || "Unknown"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {req.ttcEmail || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{req.amount} credits</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {req.reason}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* Approve Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" disabled={decideMutation.isPending}>
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Approve Credit Request?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will transfer{" "}
                            <strong>{req.amount} credits</strong> from your
                            college quota to <strong>{req.ttcName}</strong>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleApprove(
                                req._id,
                                req.amount,
                                req.ttcName || "TTC"
                              )
                            }
                          >
                            {decideMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Approve
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Reject Button */}
                    <AlertDialog
                      open={rejectingId === req._id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setRejectingId(null);
                          setRejectReason("");
                        }
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setRejectingId(req._id)}
                          disabled={decideMutation.isPending}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Reject Credit Request?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Please provide a reason for rejecting this request
                            from <strong>{req.ttcName}</strong>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                          <Textarea
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleReject(req._id, req.ttcName || "TTC")
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {decideMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Reject Request
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {pendingRequests.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground h-24"
                  >
                    No pending requests.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Request History */}
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>
            View all approved and rejected credit requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TTC Coordinator</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Decided On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyRequests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell className="font-medium">
                    {req.ttcName || "Unknown"}
                  </TableCell>
                  <TableCell>{req.amount} credits</TableCell>
                  <TableCell>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {req.reason}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        req.status === "approved" ? "default" : "destructive"
                      }
                    >
                      {req.status === "approved" ? "Approved" : "Rejected"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {req.decidedAt
                      ? new Date(req.decidedAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {historyRequests.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground h-24"
                  >
                    No request history.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
