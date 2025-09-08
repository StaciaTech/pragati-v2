
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_CREDIT_REQUESTS } from '@/lib/data/platform';
import { MOCK_PRINCIPAL_USERS } from '@/lib/data/auth';
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


export default function PrincipalCreditRequestsPage() {
    const { toast } = useToast();
    const [requests, setRequests] = React.useState(MOCK_CREDIT_REQUESTS);
    const principalUser = MOCK_PRINCIPAL_USERS[0];

    const handleAction = (requestId: string, status: 'Approved' | 'Rejected') => {
        setRequests(prev => prev.map(req => req.id === requestId ? {...req, status} : req));
        toast({
            title: `Request ${status}`,
            description: `The credit request has been ${status.toLowerCase()}.`,
        });
    };
    
    const handleCancelMyRequest = (requestId: string) => {
        setRequests((prev) => prev.filter((req) => req.id !== requestId));
        const index = MOCK_CREDIT_REQUESTS.findIndex((req) => req.id === requestId);
        if (index > -1) {
            MOCK_CREDIT_REQUESTS.splice(index, 1);
        }
        toast({
            title: 'Request Cancelled',
            description: 'Your own credit request has been cancelled.',
        });
    };

    const myPendingRequest = requests.find(r => r.requesterId === principalUser.collegeId && r.status === 'Pending' && r.requesterType === 'College');
    const pendingRequests = requests.filter(r => r.status === 'Pending' && r.requesterId !== principalUser.collegeId);
    const historyRequests = requests.filter(r => r.status !== 'Pending');

  return (
    <div className="space-y-6">
        {myPendingRequest && (
            <Card className="border-yellow-500">
            <CardHeader>
                <CardTitle>My Pending Request</CardTitle>
                <CardDescription>
                You have a credit purchase request awaiting approval from the Super Admin.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p><span className="font-semibold text-muted-foreground">Amount: </span>{myPendingRequest.amount} credits</p>
                <p><span className="font-semibold text-muted-foreground">Date: </span>{myPendingRequest.date}</p>
                <p><span className="font-semibold text-muted-foreground">Purpose: </span>{myPendingRequest.purpose}</p>
            </CardContent>
            <CardFooter>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">Cancel My Request</Button>
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
                            onClick={() => handleCancelMyRequest(myPendingRequest.id)}
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
                <CardTitle>Pending Credit Requests ({pendingRequests.length})</CardTitle>
                <CardDescription>Approve or reject credit requests from your TTCs and Innovators.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Requester</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Purpose</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pendingRequests.map(req => (
                             <TableRow key={req.id}>
                                <TableCell>{req.requesterName}</TableCell>
                                <TableCell>{req.requesterType}</TableCell>
                                <TableCell>{req.amount}</TableCell>
                                <TableCell>{req.date}</TableCell>
                                <TableCell className="max-w-xs truncate">{req.purpose}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="sm" onClick={() => handleAction(req.id, 'Approved')}>Approve</Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleAction(req.id, 'Rejected')}>Reject</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {pendingRequests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">No pending requests.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Request History</CardTitle>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Requester</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {historyRequests.map(req => (
                             <TableRow key={req.id}>
                                <TableCell>{req.requesterName}</TableCell>
                                <TableCell>{req.amount}</TableCell>
                                <TableCell>{req.date}</TableCell>
                                <TableCell>
                                    <Badge variant={req.status === 'Approved' ? 'default' : 'destructive'}>
                                        {req.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                         {historyRequests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">No request history.</TableCell>
                            </TableRow>
                         )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
