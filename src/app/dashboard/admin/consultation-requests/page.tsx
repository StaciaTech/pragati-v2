
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from '@/components/ui/checkbox';
import { MOCK_CONSULTATIONS } from '@/lib/data/platform';
import { MOCK_IDEAS } from '@/lib/data/ideas';
import { MOCK_COLLEGES } from '@/lib/data/organization';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

type Consultation = typeof MOCK_CONSULTATIONS[0];

export default function ConsultationRequestsPage() {
    const { toast } = useToast();
    const [requests, setRequests] = React.useState(MOCK_CONSULTATIONS);
    const [selected, setSelected] = React.useState<string[]>([]);
    const [isPoolModalOpen, setIsPoolModalOpen] = React.useState(false);
    const [poolDate, setPoolDate] = React.useState<Date | undefined>(undefined);

    const pendingRequests = requests.filter(r => r.status === 'Pending');
    const pastRequests = requests.filter(r => r.status !== 'Pending');

    const handleAction = (id: string, newStatus: 'Scheduled' | 'Rejected') => {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
        toast({ title: `Consultation ${newStatus}`, description: `The consultation request has been ${newStatus.toLowerCase()}.` });
    };

    const handlePoolRequests = () => {
        if (!poolDate) {
            toast({ variant: 'destructive', title: 'Please select a date.' });
            return;
        }
        
        const newDate = format(poolDate, 'yyyy-MM-dd');
        setRequests(prev => prev.map(req => selected.includes(req.id) ? { ...req, status: 'Scheduled', date: newDate, time: '12:00 PM' } : req));

        toast({
            title: 'Requests Pooled & Approved',
            description: `${selected.length} requests have been scheduled for ${newDate}.`,
        });
        setSelected([]);
        setIsPoolModalOpen(false);
        setPoolDate(undefined);
    };

    const toggleSelectAll = (checked: boolean | string) => {
        if (checked) {
            setSelected(pendingRequests.map(r => r.id));
        } else {
            setSelected([]);
        }
    };
    
    const getCollegeForIdea = (ideaId: string) => {
        const idea = MOCK_IDEAS.find(i => i.id === ideaId);
        return idea ? MOCK_COLLEGES.find(c => c.id === idea.collegeId)?.name : 'Unknown';
    }
    
    const isPoolButtonDisabled = () => {
        if (selected.length < 2) return true;
        const firstSelectedIdea = MOCK_IDEAS.find(i => i.id === requests.find(r => r.id === selected[0])?.ideaId);
        if (!firstSelectedIdea) return true;
        const firstSelectedCollege = getCollegeForIdea(firstSelectedIdea.id);

        return !selected.every(id => {
             const idea = MOCK_IDEAS.find(i => i.id === requests.find(r => r.id === id)?.ideaId);
             return idea && getCollegeForIdea(idea.id) === firstSelectedCollege;
        });
    };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Mentor Consultation Requests</CardTitle>
                <CardDescription>Approve and manage consultation requests from external mentors.</CardDescription>
            </div>
             <Button onClick={() => setIsPoolModalOpen(true)} disabled={isPoolButtonDisabled()}>
                Pool Selected Requests
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                    <Checkbox
                        checked={selected.length > 0 && selected.length === pendingRequests.length}
                        onCheckedChange={toggleSelectAll}
                    />
                </TableHead>
                <TableHead>Idea</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Proposed Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.length > 0 ? pendingRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <Checkbox
                        checked={selected.includes(req.id)}
                        onCheckedChange={(checked) => {
                            setSelected(prev => checked ? [...prev, req.id] : prev.filter(sId => sId !== req.id))
                        }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{req.title}</TableCell>
                  <TableCell>{req.mentor}</TableCell>
                   <TableCell>{getCollegeForIdea(req.ideaId)}</TableCell>
                  <TableCell>{req.date} at {req.time}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" onClick={() => handleAction(req.id, 'Scheduled')}>Approve</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleAction(req.id, 'Rejected')}>Reject</Button>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow><TableCell colSpan={6} className="text-center h-24">No pending requests.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Idea</TableHead>
                        <TableHead>Mentor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pastRequests.map(req => (
                        <TableRow key={req.id}>
                            <TableCell>{req.title}</TableCell>
                            <TableCell>{req.mentor}</TableCell>
                            <TableCell>{req.date} at {req.time}</TableCell>
                            <TableCell><Badge variant={req.status === 'Scheduled' ? 'default' : 'destructive'}>{req.status}</Badge></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
        </CardContent>
      </Card>

      <Dialog open={isPoolModalOpen} onOpenChange={setIsPoolModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Pool Consultation Requests</DialogTitle>
                <DialogDescription>
                    Select a single date to schedule all selected consultations. All will be set to 12:00 PM.
                </DialogDescription>
            </DialogHeader>
             <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="pool-date">New Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal",!poolDate && "text-muted-foreground")}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {poolDate ? format(poolDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={poolDate} onSelect={setPoolDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
             </div>
             <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handlePoolRequests}>Confirm & Approve</Button>
             </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
