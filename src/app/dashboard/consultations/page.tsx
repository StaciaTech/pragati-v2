
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOCK_CONSULTATIONS, STATUS_COLORS } from '@/lib/data/platform';
import { MOCK_IDEAS } from '@/lib/data/ideas';
import { MOCK_TTCS } from '@/lib/data/organization';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, MessageSquare, CheckCircle, Clock, PlusCircle, MoreHorizontal, Expand, FileText, CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


type Consultation = (typeof MOCK_CONSULTATIONS)[0];

const ConsultationTable = ({ consultations, onRowClick, onActionSelect }: { consultations: Consultation[], onRowClick: (c: Consultation) => void, onActionSelect: (action: 'reschedule' | 'cancel', c: Consultation) => void }) => (
    <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Idea</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {consultations.map((consultation) => (
                <TableRow key={consultation.id} className="cursor-pointer" onClick={() => onRowClick(consultation)}>
                    <TableCell className="font-medium">
                    {consultation.title}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{consultation.date} at {consultation.time}</TableCell>
                    <TableCell>{consultation.mentor}</TableCell>
                    <TableCell>
                    <Badge className={cn(STATUS_COLORS[consultation.status])}>{consultation.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => onRowClick(consultation)}>View Details</DropdownMenuItem>
                                {consultation.status === 'Scheduled' && <DropdownMenuItem onSelect={() => onActionSelect('reschedule', consultation)}>Reschedule</DropdownMenuItem>}
                                {consultation.status === 'Scheduled' && <DropdownMenuItem className="text-red-500" onSelect={() => onActionSelect('cancel', consultation)}>Cancel</DropdownMenuItem>}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);


export default function ConsultationsPage() {
  const [consultations, setConsultations] = React.useState(MOCK_CONSULTATIONS);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = React.useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = React.useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = React.useState(false);
  const [selectedConsultation, setSelectedConsultation] = React.useState<Consultation | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const { toast } = useToast();
  
  const myIdeas = MOCK_IDEAS.filter(idea => idea.innovatorName === 'Jane Doe');
  
  const consultationDates = React.useMemo(() => {
    return MOCK_CONSULTATIONS.map(c => new Date(c.date));
  }, []);

  const handleViewDetails = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsModalOpen(true);
  }

  const handleAction = (action: 'reschedule' | 'cancel', consultation: Consultation) => {
    if (action === 'reschedule') {
        setSelectedConsultation(consultation);
        setIsModalOpen(false); // Close details modal first
        setIsRescheduleModalOpen(true);
    } else if (action === 'cancel') {
        toast({ title: 'Feature in Development', description: 'Cancellation is not yet implemented.' });
    }
  }
  
  const handleRequestSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast({
        title: "Request Submitted",
        description: "Your consultation request has been sent to the TTC Coordinator.",
    });
    setIsRequestModalOpen(false);
  };
  
  const handleRescheduleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast({
        title: "Reschedule Request Submitted",
        description: `Your request to reschedule the meeting for "${selectedConsultation?.title}" has been sent.`,
    });
    setIsRescheduleModalOpen(false);
    setSelectedConsultation(null);
  };

  const upcomingConsultations = consultations.filter(c => c.status === 'Scheduled' || c.status === 'Pending');
  const pastConsultations = consultations.filter(c => c.status === 'Completed' || c.status === 'Cancelled');


  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold">Consultations</h1>
                <p className="text-muted-foreground">Manage and request consultations with mentors.</p>
            </div>
             <Button onClick={() => setIsRequestModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Request Consultation
            </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                 <Card>
                    <Tabs defaultValue="upcoming">
                        <CardHeader>
                             <div className="flex items-center justify-between">
                                 <div>
                                    <CardTitle>My Consultations</CardTitle>
                                    <CardDescription>A list of your scheduled and past consultations.</CardDescription>
                                 </div>
                                <TabsList>
                                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                                    <TabsTrigger value="past">Past</TabsTrigger>
                                </TabsList>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <TabsContent value="upcoming">
                                {upcomingConsultations.length > 0 ? (
                                   <ConsultationTable consultations={upcomingConsultations} onRowClick={handleViewDetails} onActionSelect={handleAction} />
                                ) : (
                                     <div className="text-center py-10">
                                        <p className="text-muted-foreground">You have no upcoming consultations.</p>
                                    </div>
                                )}
                            </TabsContent>
                             <TabsContent value="past">
                                 {pastConsultations.length > 0 ? (
                                   <ConsultationTable consultations={pastConsultations} onRowClick={handleViewDetails} onActionSelect={handleAction} />
                                 ) : (
                                     <div className="text-center py-10">
                                        <p className="text-muted-foreground">You have no past consultations.</p>
                                    </div>
                                 )}
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>
            
            <div className="lg:col-span-1 space-y-6 sticky top-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Calendar</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsCalendarModalOpen(true)}>
                            <Expand className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            modifiers={{ scheduled: consultationDates }}
                            modifiersClassNames={{
                                scheduled: 'has-dot',
                            }}
                            className="p-0"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>

      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/> {selectedConsultation?.status === 'Completed' ? 'Minutes of Meeting' : 'Consultation Details'}</DialogTitle>
                <DialogDescription>
                    {selectedConsultation?.status === 'Completed' ? `Summary for consultation on ` : 'Details for upcoming consultation on '} 
                    <span className="font-semibold text-foreground">"{selectedConsultation?.title}"</span> held on {selectedConsultation?.date}.
                </DialogDescription>
            </DialogHeader>
            <Separator />
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                
                {selectedConsultation?.status === 'Completed' && (
                  <>
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Summary</h4>
                        <p className="text-sm text-muted-foreground">{selectedConsultation.pointsDiscussed.join(' ')}</p>
                    </div>
                    <Separator />
                  </>
                )}
                
                <div>
                    <h4 className="font-semibold text-sm mb-2">Agenda / Milestones</h4>
                    <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                        {selectedConsultation?.agenda.map((milestone, i) => (
                            <li key={i}>{milestone}</li>
                        ))}
                    </ul>
                </div>
                <Separator />

                {selectedConsultation?.status === 'Completed' && (
                  <>
                     <div>
                        <h4 className="font-semibold text-sm mb-2">Action Items / To-Dos</h4>
                        <ul className="space-y-2">
                           {selectedConsultation?.actionItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0"/>
                                    <div className="flex-1">
                                       <span className="text-foreground">{item.task}</span>
                                       <p className="text-xs text-muted-foreground">Owner: {item.owner} - Due: {item.dueDate}</p>
                                    </div>
                                </li>
                           ))}
                        </ul>
                    </div>
                    <Separator />
                  </>
                )}
                
                <div>
                    <h4 className="font-semibold text-sm mb-2">Attached Files</h4>
                     {selectedConsultation?.files && selectedConsultation.files.length > 0 ? (
                        <div className="space-y-2">
                            {selectedConsultation.files.map((file, i) => (
                                <Button key={i} variant="outline" size="sm" className="w-full justify-start">{file}</Button>
                            ))}
                        </div>
                     ) : <p className="text-sm text-muted-foreground">No files attached.</p>}
                </div>

                 {selectedConsultation?.status === 'Scheduled' && (
                    <div className="pt-4 flex gap-2">
                       <Button className="w-full">Join Meeting</Button>
                       <Button variant="outline" className="w-full" onClick={() => {
                           if(selectedConsultation) {
                               handleAction('reschedule', selectedConsultation);
                           }
                        }}>Request Reschedule</Button>
                       <Button variant="destructive" className="w-full" onClick={() => {
                           if (selectedConsultation) {
                               handleAction('cancel', selectedConsultation);
                           }
                        }}>Cancel</Button>
                    </div>
                 )}
            </div>
        </DialogContent>
      </Dialog>

       <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Request a New Consultation</DialogTitle>
                <DialogDescription>
                    Fill out the details below to request a meeting with a mentor.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRequestSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="idea">Idea to Discuss</Label>
                         <Select required>
                            <SelectTrigger id="idea"><SelectValue placeholder="Select an idea" /></SelectTrigger>
                            <SelectContent>
                                {myIdeas.map(idea => (
                                    <SelectItem key={idea.id} value={idea.id}>{idea.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="mentor">Preferred Mentor</Label>
                         <Select required>
                            <SelectTrigger id="mentor"><SelectValue placeholder="Select a mentor" /></SelectTrigger>
                            <SelectContent>
                                {MOCK_TTCS.map(ttc => (
                                    <SelectItem key={ttc.id} value={ttc.id}>{ttc.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">Preferred Date</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="questions">Questions / Topics</Label>
                        <Textarea id="questions" placeholder="What would you like to discuss? e.g., 'Market entry strategy', 'Technical feasibility concerns'." required />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit">Submit Request</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Request to Reschedule</DialogTitle>
                <DialogDescription>
                    Propose a new date and time for your consultation on "{selectedConsultation?.title}".
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRescheduleSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="reschedule-date">New Preferred Date</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="comment">Reason for Rescheduling (Optional)</Label>
                        <Textarea id="comment" name="comment" placeholder="Add a comment to explain the reason for rescheduling..." />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit">Send Reschedule Request</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

       <Dialog open={isCalendarModalOpen} onOpenChange={setIsCalendarModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>My Calendar</DialogTitle>
            <DialogDescription>
              A full view of your upcoming consultations.
            </DialogDescription>
          </DialogHeader>
           <div className="flex justify-center p-4">
               <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{ scheduled: consultationDates }}
                modifiersClassNames={{
                    scheduled: 'has-dot',
                }}
                className="p-0"
                numberOfMonths={1}
            />
           </div>
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
