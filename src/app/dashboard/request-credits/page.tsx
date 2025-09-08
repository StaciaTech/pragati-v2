
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MOCK_INNOVATOR_USER } from '@/lib/data/auth';
import { MOCK_CREDIT_REQUESTS } from '@/lib/data/platform';
import { useToast } from '@/hooks/use-toast';
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
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


export default function RequestCreditsPage() {
  const { toast } = useToast();
  const user = MOCK_INNOVATOR_USER;
  const [requests, setRequests] = React.useState(MOCK_CREDIT_REQUESTS);

  const pendingRequest = requests.find(
    (req) => req.requesterId === user.id && req.status === 'Pending' && req.requesterType === 'Innovator'
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (pendingRequest) {
      toast({
        variant: 'destructive',
        title: 'Request Already Pending',
        description:
          'You already have a credit request awaiting approval. Please wait for it to be resolved.',
      });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const amount = formData.get('amount');
    const purpose = formData.get('purpose');

    if (!amount || !purpose || Number(amount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description:
          'Please enter a valid amount and purpose for your credit request.',
      });
      return;
    }

    // Simulate adding to mock data
    const newRequest = {
      id: `CR-INV-${Date.now()}`,
      requesterType: 'Innovator' as const,
      requesterId: user.id,
      requesterName: user.name,
      amount: Number(amount),
      status: 'Pending' as const,
      date: new Date().toISOString().split('T')[0],
      purpose: purpose as string,
    };
    setRequests((prev) => [...prev, newRequest]);
    MOCK_CREDIT_REQUESTS.push(newRequest);

    toast({
      title: 'Request Submitted',
      description: `Your request for ${amount} credits has been submitted to your TTC Coordinator.`,
    });
    event.currentTarget.reset();
  };

  const handleCancelRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((req) => req.id !== requestId));
    const index = MOCK_CREDIT_REQUESTS.findIndex((req) => req.id === requestId);
    if (index > -1) {
      MOCK_CREDIT_REQUESTS.splice(index, 1);
    }
    toast({
      title: 'Request Cancelled',
      description: 'Your credit request has been successfully cancelled.',
    });
  };

  const creditFaqs = [
    {
      question: "How are credits used?",
      answer: "One credit is used for each idea submission that you send for AI validation. Resubmitting an idea also costs one credit.",
    },
    {
      question: "How long does it take for a credit request to be approved?",
      answer: "Credit requests are sent to your assigned TTC Coordinator. Approval times may vary, but you will be notified once a decision is made.",
    },
    {
      question: "What happens if my request is rejected?",
      answer: "If your request is rejected, you may need to speak with your TTC Coordinator to understand the reason. You can submit a new request once the previous one is resolved.",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            {pendingRequest && (
                <Card className="border-purple-500 border-indigo-500 bg-[length:200%_auto] animate-background-pan">
                <CardHeader>
                    <CardTitle>Pending Request</CardTitle>
                    <CardDescription>
                    You have a credit request awaiting approval from your TTC Coordinator.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p>
                    <span className="font-semibold text-muted-foreground">
                        Amount:{' '}
                    </span>
                    {pendingRequest.amount} credits
                    </p>
                    <p>
                    <span className="font-semibold text-muted-foreground">
                        Date:{' '}
                    </span>
                    {pendingRequest.date}
                    </p>
                    <p>
                    <span className="font-semibold text-muted-foreground">
                        Purpose:{' '}
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
                            onClick={() => handleCancelRequest(pendingRequest.id)}
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
                <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Request Credits from TTC Coordinator</CardTitle>
                    <CardDescription>
                    You currently have{' '}
                    <span className="font-bold text-primary">{user.credits}</span>{' '}
                    credits available. Use this form to request additional credits from your TTC.
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
                        disabled={!!pendingRequest}
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose of Request</Label>
                    <Textarea
                        id="purpose"
                        name="purpose"
                        placeholder="Briefly explain why you need more credits (e.g., for new project, resubmission)."
                        required
                        disabled={!!pendingRequest}
                    />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={!!pendingRequest}>
                    Submit Request to TTC
                    </Button>
                </CardFooter>
                </form>
            </Card>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Credit Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-primary">{user.credits}</p>
                        <p className="text-muted-foreground">Credits Available</p>
                    </div>
                    <div>
                        <Label>Usage (This Month)</Label>
                        <Progress value={33} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1 text-right">5 / 15 credits used</p>
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
