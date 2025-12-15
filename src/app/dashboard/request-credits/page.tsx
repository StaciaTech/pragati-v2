"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
import {
  useMyPendingRequest,
  useRequestCredits,
} from "@/hooks/useAllCreditRequest";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function RequestCreditsPage() {
  // Hooks
  const { data: user, isLoading: isLoadingUser } = useUserProfile();
  console.log(user);
  const {
    data: pendingRequest,
    isLoading: isLoadingRequest,
    deleteRequest,
  } = useMyPendingRequest();
  const requestMutation = useRequestCredits();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (pendingRequest) {
      return; // Form is disabled if pending request exists
    }

    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get("amount"));
    const reason = formData.get("purpose") as string;

    if (!amount || !reason || amount <= 0) {
      return;
    }

    // Submit with optimistic update - card appears IMMEDIATELY
    requestMutation.mutate(
      { amount, reason },
      {
        onSuccess: () => {
          event.currentTarget.reset();
        },
      }
    );
  };

  const handleCancelRequest = (requestId: string) => {
    // Delete with optimistic update - card disappears IMMEDIATELY
    deleteRequest.mutate(requestId);
  };

  const creditFaqs = [
    {
      question: "How are credits used?",
      answer:
        "One credit is used for each idea submission that you send for AI validation. Resubmitting an idea also costs one credit.",
    },
    {
      question: "How long does it take for a credit request to be approved?",
      answer:
        "Credit requests are sent to your assigned TTC Coordinator. Approval times may vary, but you will be notified once a decision is made.",
    },
    {
      question: "What happens if my request is rejected?",
      answer:
        "If your request is rejected, you may need to speak with your TTC Coordinator to understand the reason. You can submit a new request once the previous one is resolved.",
    },
  ];

  // Loading state
  if (isLoadingUser || isLoadingRequest) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Pending Request Card - Shows/Hides INSTANTLY with optimistic updates */}
        {pendingRequest && (
          <Card className="border-purple-500 border-indigo-500 bg-[length:200%_auto] animate-background-pan">
            <CardHeader>
              <CardTitle>Pending Request</CardTitle>
              <CardDescription>
                You have a credit request awaiting approval from your TTC
                Coordinator.
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
                {new Date(pendingRequest.createdAt).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold text-muted-foreground">
                  Purpose:{" "}
                </span>
                {pendingRequest.reason}
              </p>
            </CardContent>
            <CardFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={deleteRequest.isPending}
                  >
                    {deleteRequest.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Cancel Request
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

        {/* Request Form */}
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Request Credits from TTC Coordinator</CardTitle>
              <CardDescription>
                You currently have{" "}
                <span className="font-bold text-primary">
                  {user?.creditQuota || 0}
                </span>{" "}
                credits available. Use this form to request additional credits
                from your TTC.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount of Credits Needed</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  placeholder="e.g., 5"
                  required
                  disabled={!!pendingRequest || requestMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Request</Label>
                <Textarea
                  id="purpose"
                  name="purpose"
                  placeholder="Briefly explain why you need more credits (e.g., for new project, resubmission)."
                  required
                  disabled={!!pendingRequest || requestMutation.isPending}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={!!pendingRequest || requestMutation.isPending}
              >
                {requestMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Request to TTC
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Credit Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">
                {user?.creditQuota || 0}
              </p>
              <p className="text-muted-foreground">Credits Available</p>
            </div>
            <div>
              <Label>Usage (This Month)</Label>
              <Progress value={33} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                5 / 15 credits used
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {creditFaqs.map((faq, i) => (
                <AccordionItem value={`item-${i}`} key={i}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
