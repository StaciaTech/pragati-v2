
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_CREDIT_REQUESTS } from '@/lib/data/platform';
import { MOCK_TTCS, MOCK_INNOVATORS, MOCK_COLLEGES } from '@/lib/data/organization';
import { MOCK_IDEAS } from '@/lib/data/ideas';
import { STATUS_COLORS } from '@/lib/data/platform';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lightbulb } from 'lucide-react';
import { ROLES } from '@/lib/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


type Ttc = (typeof MOCK_TTCS)[0];

const getInitials = (name: string) => {
    return name?.split(' ').map((n) => n[0]).join('') || '';
};

export default function TTCManagementPage() {
    const { toast } = useToast();
    const [ttcs, setTtcs] = React.useState(MOCK_TTCS);
    const [requests, setRequests] = React.useState(MOCK_CREDIT_REQUESTS);
    
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [modalType, setModalType] = React.useState<'add' | 'edit'>('add');
    const [currentTtc, setCurrentTtc] = React.useState<Ttc | null>(null);
    
    const [isRequestsModalOpen, setIsRequestsModalOpen] = React.useState(false);
    const [isInnovatorModalOpen, setIsInnovatorModalOpen] = React.useState(false);
    const [selectedTtcForInnovators, setSelectedTtcForInnovators] = React.useState<Ttc | null>(null);
    
    const pendingTTCRequests = requests.filter(req => req.requesterType === 'TTC' && req.status === 'Pending');

    // Assuming a single college for the principal view
    const collegeId = MOCK_COLLEGES[0].id; 
    const collegeTtcs = ttcs.filter(ttc => ttc.collegeId === collegeId);
    const collegeInnovators = MOCK_INNOVATORS.filter(inv => inv.collegeId === collegeId);

    const innovatorsByTtc = collegeTtcs.reduce((acc, ttc, index) => {
        acc[ttc.id] = collegeInnovators.filter((_, invIndex) => invIndex % collegeTtcs.length === index);
        return acc;
    }, {} as Record<string, typeof collegeInnovators>);

    const handleOpenEditModal = (type: 'add' | 'edit', ttc?: Ttc) => {
        setModalType(type);
        setCurrentTtc(ttc || null);
        setIsEditModalOpen(true);
    };

    const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        toast({
            title: `TTC ${modalType === 'add' ? 'Added' : 'Updated'}`,
            description: `${name} has been successfully saved.`,
        });
        setIsEditModalOpen(false);
    }
    
    const handleToggleStatus = (id: string) => {
        setTtcs(prev => prev.map(ttc => ttc.id === id ? {...ttc, status: ttc.status === 'Active' ? 'Inactive' : 'Active'} as any : ttc));
        toast({ title: "Status Updated", description: "TTC status has been toggled."});
    }

    const handleRequestAction = (requestId: string, action: 'Approved' | 'Rejected') => {
        setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: action } : req));
        toast({
            title: `Request ${action}`,
            description: `The credit request has been ${action.toLowerCase()}.`,
        });
    };

    const handleTtcClick = (ttc: Ttc) => {
        setSelectedTtcForInnovators(ttc);
        setIsInnovatorModalOpen(true);
    };

    const getIdeasForInnovator = (innovatorEmail: string) => {
        return MOCK_IDEAS.filter(idea => idea.innovatorEmail === innovatorEmail);
    }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>TTC Management</CardTitle>
                <CardDescription>Add, edit, and manage TTCs for your college.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setIsRequestsModalOpen(true)} disabled={pendingTTCRequests.length === 0}>
                    Pending Requests <Badge className="ml-2">{pendingTTCRequests.length}</Badge>
                </Button>
                <Button onClick={() => handleOpenEditModal('add')}>Add New TTC</Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {collegeTtcs.map(ttc => (
                    <Card key={ttc.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleTtcClick(ttc)}>
                        <CardHeader className="flex flex-row items-start justify-between">
                             <div className="flex flex-row items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={`https://avatar.vercel.sh/${ttc.name}.png`} alt={ttc.name} />
                                    <AvatarFallback>{getInitials(ttc.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>{ttc.name}</CardTitle>
                                    <CardDescription>{ttc.email}</CardDescription>
                                    <div className="flex gap-1 mt-1">
                                        {ttc.expertise.map(e => <Badge key={e} variant="secondary">{e}</Badge>)}
                                    </div>
                                </div>
                            </div>
                             <Badge variant={ttc.status === 'Active' ? 'default' : 'destructive'}>
                                {ttc.status}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                             <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <p>
                                    Assigned Innovators: <span className="font-bold text-foreground">{innovatorsByTtc[ttc.id]?.length || 0}</span>
                                </p>
                                <div className="flex gap-2">
                                     <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenEditModal('edit', ttc)}}>Edit</Button>
                                     <Button 
                                        variant={ttc.status === 'Active' ? 'destructive' : 'default'} 
                                        size="sm" 
                                        onClick={(e) => {e.stopPropagation(); handleToggleStatus(ttc.id)}}
                                    >
                                      {ttc.status === 'Active' ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                 {collegeTtcs.length === 0 && (
                    <p className="text-muted-foreground text-center col-span-full py-10">No TTCs found for your college.</p>
                )}
            </div>
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{modalType === 'add' ? 'Add New TTC' : 'Edit TTC'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave}>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">TTC Name</Label>
                        <Input id="name" name="name" defaultValue={currentTtc?.name} required/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" defaultValue={currentTtc?.email} required/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="expertise">Expertise (comma-separated)</Label>
                        <Input id="expertise" name="expertise" defaultValue={currentTtc?.expertise.join(', ')} required/>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit">Save</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isRequestsModalOpen} onOpenChange={setIsRequestsModalOpen}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Pending TTC Credit Requests</DialogTitle>
                <DialogDescription>Approve or reject credit requests from your TTCs.</DialogDescription>
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
                    {pendingTTCRequests.map(req => (
                        <TableRow key={req.id}>
                            <TableCell>{req.requesterName}</TableCell>
                            <TableCell>{req.amount}</TableCell>
                            <TableCell>{req.date}</TableCell>
                            <TableCell className="max-w-xs truncate">{req.purpose}</TableCell>
                            <TableCell className="text-right space-x-2">
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild><Button size="sm">Approve</Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Approve Request?</AlertDialogTitle>
                                            <AlertDialogDescription>Are you sure you want to approve this request for {req.amount} credits?</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRequestAction(req.id, 'Approved')}>Yes, Approve</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Reject</Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Reject Request?</AlertDialogTitle>
                                            <AlertDialogDescription>Are you sure you want to reject this request? This action cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRequestAction(req.id, 'Rejected')}>Yes, Reject</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                     {pendingTTCRequests.length === 0 && (
                         <TableRow>
                            <TableCell colSpan={5} className="text-center">No pending TTC requests.</TableCell>
                         </TableRow>
                     )}
                </TableBody>
            </Table>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isInnovatorModalOpen} onOpenChange={setIsInnovatorModalOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Innovators under {selectedTtcForInnovators?.name}</DialogTitle>
                <DialogDescription>
                    List of innovators managed by this TTC. Click an innovator to see their ideas.
                </DialogDescription>
            </DialogHeader>
            {innovatorsByTtc[selectedTtcForInnovators?.id || '']?.length > 0 ? (
                 <Accordion type="single" collapsible className="w-full">
                    {innovatorsByTtc[selectedTtcForInnovators?.id || ''].map(innovator => {
                        const ideas = getIdeasForInnovator(innovator.email);
                        return (
                        <AccordionItem value={innovator.id} key={innovator.id}>
                            <AccordionTrigger>
                                <div className="flex items-center justify-between w-full pr-4">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6 text-xs">
                                            <AvatarImage src={`https://avatar.vercel.sh/${innovator.name}.png`} alt={innovator.name} />
                                            <AvatarFallback>{getInitials(innovator.name)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{innovator.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <Lightbulb className="h-3 w-3" />
                                            {ideas.length}
                                        </Badge>
                                        <Badge variant={innovator.status === 'Active' ? 'default' : 'destructive'}>{innovator.status}</Badge>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                {ideas.length > 0 ? (
                                    <ul className="space-y-1 pl-8 pr-4">
                                        {ideas.map(idea => (
                                            <li key={idea.id} className="text-xs flex justify-between items-center">
                                                <span>- {idea.title}</span>
                                                <Badge className={`${STATUS_COLORS[idea.status]} text-white`}>{idea.status}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-muted-foreground pl-8">No ideas submitted by this innovator.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    )})}
                </Accordion>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No innovators assigned to this TTC.</p>
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

    
