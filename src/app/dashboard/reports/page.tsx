
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FacebookIcon, LinkedInIcon, TwitterIcon, WhatsAppIcon, MailIcon } from '@/components/social-icons';
import { FileText, CalendarIcon, PlusCircle, Download, Share2, Trash2, Copy, Clock, ToggleLeft, ToggleRight, Loader2, Bot } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { REPORT_OPTIONS } from '@/lib/data/reports';
import { type Role, ROLES } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { summarizeValidationData, GeneratedReport } from '@/ai/flows/summarize-validation-data';
import { MOCK_IDEAS } from '@/lib/data/ideas';
import { MOCK_INNOVATOR_USER } from '@/lib/data/auth';
import { MOCK_TTCS } from '@/lib/data/organization';
import { Textarea } from '@/components/ui/textarea';


const initialGeneratedReports = [
    { id: 'REP-2024-001', name: 'Q2 Idea Summary (Approved)', type: 'CSV' as const, date: '2024-07-15', status: 'Ready' as const },
    { id: 'REP-2024-002', name: 'Weekly Consultation Log', type: 'PDF' as const, date: '2024-07-20', status: 'Scheduled' as const },
    { id: 'REP-2024-003', name: 'All Innovators Export', type: 'CSV' as const, date: '2024-07-18', status: 'Ready' as const },
];

type DataSource = keyof typeof REPORT_OPTIONS[Role];


export default function ReportsPage() {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') as Role || ROLES.INNOVATOR;

    const [isClient, setIsClient] = React.useState(false);
    const [isBuilderOpen, setIsBuilderOpen] = React.useState(false);
    const [isShareOpen, setIsShareOpen] = React.useState(false);
    const [generatedReports, setGeneratedReports] = React.useState<GeneratedReport[]>(initialGeneratedReports);
    const [selectedReport, setSelectedReport] = React.useState<GeneratedReport | null>(null);
    
    // State for the custom report builder
    const roleReportOptions = REPORT_OPTIONS[role] || REPORT_OPTIONS[ROLES.INNOVATOR];
    const defaultDataSource = Object.keys(roleReportOptions)[0] as DataSource;

    const [dataSource, setDataSource] = React.useState<DataSource>(defaultDataSource);
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
    const [scheduleType, setScheduleType] = React.useState('now');
    const [scheduleFrequency, setScheduleFrequency] = React.useState('daily');
    const [monthlyScheduleType, setMonthlyScheduleType] = React.useState('day_of_month');
    
    // State for AI Bot
    const [aiQuery, setAiQuery] = React.useState('Identify promising ideas and highlight any notable trends.');
    const [aiReport, setAiReport] = React.useState('');
    const [isGeneratingReport, setIsGeneratingReport] = React.useState(false);

    React.useEffect(() => {
        setDataSource(Object.keys(REPORT_OPTIONS[role] || REPORT_OPTIONS[ROLES.INNOVATOR])[0] as DataSource);
    }, [role]);

     React.useEffect(() => {
        setIsClient(true);
    }, []);

    const handleGenerateReport = (type: string) => {
        toast({
            title: "Generating Report",
            description: `A ${type} report is being generated and will be available for download shortly.`,
        });
    };

    const handleCustomReportSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        toast({
            title: "Custom Report Scheduled",
            description: "Your custom report is being generated based on your specifications.",
        });
        setIsBuilderOpen(false);
    }

    const handleShareClick = (report: GeneratedReport) => {
        setSelectedReport(report);
        setIsShareOpen(true);
    };

    const handleCopyLink = () => {
        if (!selectedReport) return;
        navigator.clipboard.writeText(`${window.location.origin}/reports/${selectedReport.id}`);
        toast({ title: 'Link Copied!' });
    };

    const handleGenerateAiReport = async () => {
        setIsGeneratingReport(true);
        setAiReport('');

        try {
            let ideasForSummary = MOCK_IDEAS;
            const userTTC = MOCK_TTCS[0]; // mock
            const principalCollegeId = 'COL001'; // mock
            
            // Scope data based on role
            switch(role) {
                case ROLES.INNOVATOR:
                    ideasForSummary = MOCK_IDEAS.filter(idea => idea.innovatorEmail === MOCK_INNOVATOR_USER.email);
                    break;
                case ROLES.COORDINATOR:
                    ideasForSummary = MOCK_IDEAS.filter(idea => idea.ttcAssigned === userTTC.id);
                    break;
                case ROLES.PRINCIPAL:
                    ideasForSummary = MOCK_IDEAS.filter(idea => idea.collegeId === principalCollegeId);
                    break;
                case ROLES.SUPER_ADMIN:
                    // Super admin gets all ideas
                    break;
                default:
                    ideasForSummary = [];
            }
            
            if (ideasForSummary.length === 0) {
                 toast({
                    variant: 'destructive',
                    title: 'No Data',
                    description: 'There is no data available for your role to generate a summary.'
                });
                setIsGeneratingReport(false);
                return;
            }

            const validationData = ideasForSummary.map(idea => ({
                ideaId: idea.id,
                validationScore: idea.report?.overallScore || 0,
                keyInsights: [idea.report?.recommendationText || 'No recommendation text available.'],
            }));

            const result = await summarizeValidationData({ validationData, query: aiQuery });
            
            setAiReport(result.summary);
            
            if (result.generatedReport) {
                 setGeneratedReports(prev => [result.generatedReport!, ...prev]);
                 toast({
                    title: 'Report Generated!',
                    description: `The report "${result.generatedReport.name}" has been added to your generated reports list.`
                 });
            }

        } catch (error) {
            console.error("Failed to generate summary:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to generate AI report. Please try again.'
            });
        } finally {
            setIsGeneratingReport(false);
        }
    };

  if (!isClient) {
    return null; 
  }

  const currentReportOptions = roleReportOptions[dataSource];

  return (
    <>
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Reports Hub</CardTitle>
                <CardDescription>Generate, manage, and share reports based on your role and data.</CardDescription>
            </CardHeader>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bot className="h-6 w-6 text-primary" /> AI-Powered Insights</CardTitle>
            <CardDescription>Ask a question in natural language to get a quick summary or generate a full report.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Textarea 
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="e.g., 'Which ideas have the highest market potential?' or 'Generate a CSV of all approved ideas.'"
              />
              {aiReport && (
                <div className="p-4 bg-muted/50 rounded-lg text-sm">
                  <h4 className="font-semibold mb-2">AI Response:</h4>
                  <p className="whitespace-pre-wrap">{aiReport}</p>
                </div>
              )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateAiReport} disabled={isGeneratingReport}>
                {isGeneratingReport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGeneratingReport ? 'Generating...' : 'Generate AI Report'}
            </Button>
          </CardFooter>
        </Card>
        
        <Tabs defaultValue="manage">
            <div className="flex justify-between items-center">
                 <TabsList>
                    <TabsTrigger value="manage">Manage Reports</TabsTrigger>
                    <TabsTrigger value="standard">Standard Reports</TabsTrigger>
                </TabsList>
                 <Button onClick={() => setIsBuilderOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Custom Report
                </Button>
            </div>
            <TabsContent value="manage" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Generated Reports</CardTitle>
                        <CardDescription>View, download, or share your generated reports.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Report Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {generatedReports.map(report => (
                                    <TableRow key={report.id}>
                                        <TableCell className="font-medium">{report.name}</TableCell>
                                        <TableCell>{report.type}</TableCell>
                                        <TableCell>{report.date}</TableCell>
                                        <TableCell>{report.status}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" disabled={report.status !== 'Ready'}><Download className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleShareClick(report)}><Share2 className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="standard" className="mt-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Standard Reports</CardTitle>
                        <CardDescription>One-click reports for common data exports.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p className="font-medium">All Ideas Summary</p>
                                <p className="text-sm text-muted-foreground">A CSV export of all submitted ideas.</p>
                            </div>
                            <Button onClick={() => handleGenerateReport('All Ideas')}>Generate</Button>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <p className="font-medium">Consultation History</p>
                                <p className="text-sm text-muted-foreground">A PDF report of all consultations.</p>
                            </div>
                            <Button onClick={() => handleGenerateReport('Consultation History')}>Generate</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
    
    <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Custom Report Builder</DialogTitle>
                <DialogDescription>Select your criteria to generate a custom report.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCustomReportSubmit} className="flex-1 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 pr-6 -mr-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    <div className="space-y-6">
                        {/* Column 1: Basic Info & Data Source */}
                        <div className="space-y-4">
                            <h4 className="font-semibold">1. Report Details</h4>
                            <div className="space-y-2">
                                <Label htmlFor="report-name">Report Name</Label>
                                <Input id="report-name" placeholder="e.g., Q3 Approved HealthTech Ideas" />
                            </div>
                            <div className="space-y-2">
                                <Label>Report Format</Label>
                                <RadioGroup defaultValue="csv" className="flex gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="csv" id="csv" /><Label htmlFor="csv">CSV</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="pdf" id="pdf" /><Label htmlFor="pdf">PDF</Label></div>
                                </RadioGroup>
                            </div>
                        </div>

                         <div className="space-y-4">
                            <h4 className="font-semibold">2. Data Source</h4>
                            <Select value={dataSource} onValueChange={(value) => setDataSource(value as DataSource)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Object.keys(roleReportOptions).map(source => (
                                        <SelectItem key={source} value={source}>
                                            {roleReportOptions[source as DataSource].title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                         <div className="space-y-4">
                            <h4 className="font-semibold">3. Filters</h4>
                             <div className="space-y-2">
                                <Label>Date Range</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn("w-full justify-start text-left font-normal",!dateRange && "text-muted-foreground")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                                                ) : (format(dateRange.from, "LLL dd, y"))
                                            ) : (<span>Pick a date range</span>)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="range" selected={dateRange} onSelect={setDateRange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {currentReportOptions?.filters.map(filter => (
                                <div key={filter.key} className="space-y-2">
                                    <Label>{filter.label}</Label>
                                    <Select>
                                        <SelectTrigger><SelectValue placeholder={`Filter by ${filter.label.toLowerCase()}`} /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            {filter.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        {/* Column 2: Dynamic Fields & Scheduling */}
                         <div className="space-y-4">
                            <h4 className="font-semibold">4. Select Columns</h4>
                            <ScrollArea className="h-60 pr-2">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm border rounded-md p-4">
                                  {currentReportOptions?.columns.map(col => (
                                      <div key={col} className="flex items-center space-x-2">
                                          <Checkbox id={`col-${col}`} defaultChecked />
                                          <Label htmlFor={`col-${col}`} className="font-normal">{col}</Label>
                                      </div>
                                  ))}
                              </div>
                            </ScrollArea>
                        </div>
                         <div className="space-y-4">
                            <h4 className="font-semibold">5. Schedule & Delivery</h4>
                            <RadioGroup defaultValue="now" onValueChange={setScheduleType} className="flex gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="now" id="now" /><Label htmlFor="now">Run Now</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="schedule" id="schedule" /><Label htmlFor="schedule">Schedule</Label></div>
                            </RadioGroup>

                            {scheduleType === 'schedule' && (
                                <div className="space-y-4 p-4 border rounded-md">
                                     <div className="space-y-2">
                                        <Label>Frequency</Label>
                                        <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    {scheduleFrequency === 'weekly' && (
                                        <div className="p-3 border rounded-md bg-muted/50">
                                            <Label className="text-xs text-muted-foreground">Day of Week</Label>
                                            <ToggleGroup type="multiple" variant="outline" className="justify-start gap-1 mt-2 flex-wrap">
                                                <ToggleGroupItem value="mon" size="sm" className="h-8">Mon</ToggleGroupItem>
                                                <ToggleGroupItem value="tue" size="sm" className="h-8">Tue</ToggleGroupItem>
                                                <ToggleGroupItem value="wed" size="sm" className="h-8">Wed</ToggleGroupItem>
                                                <ToggleGroupItem value="thu" size="sm" className="h-8">Thu</ToggleGroupItem>
                                                <ToggleGroupItem value="fri" size="sm" className="h-8">Fri</ToggleGroupItem>
                                                <ToggleGroupItem value="sat" size="sm" className="h-8">Sat</ToggleGroupItem>
                                                <ToggleGroupItem value="sun" size="sm" className="h-8">Sun</ToggleGroupItem>
                                            </ToggleGroup>
                                        </div>
                                    )}

                                    {scheduleFrequency === 'monthly' && (
                                        <div className="p-3 border rounded-md bg-muted/50 space-y-4">
                                            <RadioGroup defaultValue="day_of_month" onValueChange={setMonthlyScheduleType}>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="day_of_month" id="day_of_month" />
                                                    <Label htmlFor="day_of_month" className="flex items-center gap-2">On day <Input id="day-of-month-input" type="number" min="1" max="31" defaultValue="1" className="h-8 w-16" disabled={monthlyScheduleType !== 'day_of_month'} /></Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="day_of_week" id="day_of_week" />
                                                    <Label htmlFor="day_of_week" className="flex items-center gap-2">On the
                                                        <Select disabled={monthlyScheduleType !== 'day_of_week'}><SelectTrigger className="h-8 w-28"><SelectValue placeholder="first" /></SelectTrigger><SelectContent><SelectItem value="first">first</SelectItem><SelectItem value="second">second</SelectItem><SelectItem value="third">third</SelectItem><SelectItem value="fourth">fourth</SelectItem><SelectItem value="last">last</SelectItem></SelectContent></Select>
                                                        <Select disabled={monthlyScheduleType !== 'day_of_week'}><SelectTrigger className="h-8 w-32"><SelectValue placeholder="Monday" /></SelectTrigger><SelectContent><SelectItem value="mon">Monday</SelectItem><SelectItem value="tue">Tuesday</SelectItem><SelectItem value="wed">Wednesday</SelectItem><SelectItem value="thu">Thursday</SelectItem><SelectItem value="fri">Friday</SelectItem><SelectItem value="sat">Saturday</SelectItem><SelectItem value="sun">Sunday</SelectItem></SelectContent></Select>
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="time-of-day">Time of Day (UTC)</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input id="time-of-day" type="time" defaultValue="09:00" className="pl-10 h-8"/>
                                        </div>
                                    </div>
                                </div>
                            )}

                             <div className="space-y-2">
                                <Label htmlFor="delivery-email">Delivery Emails</Label>
                                <Input id="delivery-email" type="email" placeholder="email1@example.com, email2@example.com" />
                                <p className="text-xs text-muted-foreground">Separate multiple emails with a comma. Leave blank for no email delivery.</p>
                            </div>
                        </div>
                    </div>
                </div>
              </ScrollArea>
              <DialogFooter className="pt-4 border-t">
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button type="submit">Generate Report</Button>
              </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>

    <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Share Report: {selectedReport?.name}</DialogTitle>
            <DialogDescription>
                Share this report with others via a secure link.
            </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
                <Input
                id="link"
                value={`${window.location.origin}/reports/${selectedReport?.id}`}
                readOnly
                />
                <Button type="button" size="sm" className="px-3" onClick={handleCopyLink}>
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
                </Button>
            </div>
            <Separator />
            <div className="space-y-2">
                <p className="text-sm font-medium text-center text-muted-foreground">Quick Share</p>
                    <div className="flex justify-center gap-2">
                    <TooltipProvider>
                        <Tooltip><TooltipTrigger asChild><Button asChild variant="outline" size="icon"><a href="#"><WhatsAppIcon className="h-5 w-5" /></a></Button></TooltipTrigger><TooltipContent>WhatsApp</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><Button asChild variant="outline" size="icon"><a href="#"><TwitterIcon className="h-5 w-5" /></a></Button></TooltipTrigger><TooltipContent>X / Twitter</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><Button asChild variant="outline" size="icon"><a href="#"><LinkedInIcon className="h-5 w-5" /></a></Button></TooltipTrigger><TooltipContent>LinkedIn</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><Button asChild variant="outline" size="icon"><a href="#"><MailIcon className="h-5 w-5" /></a></Button></TooltipTrigger><TooltipContent>Email</TooltipContent></Tooltip>
                    </TooltipProvider>
                    </div>
            </div>
            </div>
            <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
