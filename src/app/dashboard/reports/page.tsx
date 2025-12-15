"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FacebookIcon,
  LinkedInIcon,
  TwitterIcon,
  WhatsAppIcon,
  MailIcon,
} from "@/components/social-icons";
import {
  FileText,
  CalendarIcon,
  PlusCircle,
  Download,
  Share2,
  Trash2,
  Copy,
  Clock,
  Loader2,
  Bot,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { REPORT_OPTIONS } from "@/lib/data/reports";
import { type Role, ROLES } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type DataSource = keyof (typeof REPORT_OPTIONS)[Role];

interface GeneratedReport {
  id: string;
  name: string;
  type: "CSV" | "PDF" | "AI";
  date: string;
  status: "Ready" | "Scheduled" | "Processing";
}

export default function ReportsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") as Role) || ROLES.INNOVATOR;

  const [isClient, setIsClient] = React.useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = React.useState(false);
  const [isShareOpen, setIsShareOpen] = React.useState(false);
  const [generatedReports, setGeneratedReports] = React.useState<
    GeneratedReport[]
  >([]);
  const [selectedReport, setSelectedReport] =
    React.useState<GeneratedReport | null>(null);
  const [isLoadingReports, setIsLoadingReports] = React.useState(false);

  // State for the custom report builder
  const roleReportOptions =
    REPORT_OPTIONS[role] || REPORT_OPTIONS[ROLES.INNOVATOR];
  const defaultDataSource = Object.keys(roleReportOptions)[0] as DataSource;

  const [dataSource, setDataSource] =
    React.useState<DataSource>(defaultDataSource);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [scheduleType, setScheduleType] = React.useState("now");
  const [scheduleFrequency, setScheduleFrequency] = React.useState("daily");
  const [monthlyScheduleType, setMonthlyScheduleType] =
    React.useState("day_of_month");
  const [reportName, setReportName] = React.useState("");
  const [reportFormat, setReportFormat] = React.useState("csv");
  const [selectedColumns, setSelectedColumns] = React.useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = React.useState<
    Record<string, string>
  >({});

  // State for AI Bot
  const [aiQuery, setAiQuery] = React.useState(
    "Identify promising ideas and highlight any notable trends."
  );
  const [aiReport, setAiReport] = React.useState("");
  const [isGeneratingReport, setIsGeneratingReport] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState<string | null>(null);

  // Get auth token
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  // Fetch generated reports on mount
  React.useEffect(() => {
    setIsClient(true);
    fetchGeneratedReports();
  }, []);

  React.useEffect(() => {
    setDataSource(
      Object.keys(
        REPORT_OPTIONS[role] || REPORT_OPTIONS[ROLES.INNOVATOR]
      )[0] as DataSource
    );
  }, [role]);

  // Initialize selected columns
  React.useEffect(() => {
    const currentReportOptions = roleReportOptions[dataSource];
    if (currentReportOptions?.columns) {
      setSelectedColumns(currentReportOptions.columns);
    }
  }, [dataSource, roleReportOptions]);

  // =========================================================================
  // API FUNCTIONS
  // =========================================================================

  const fetchGeneratedReports = async () => {
    setIsLoadingReports(true);
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/reports/hub/list?page=1&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch reports");

      const data = await response.json();
      if (data.success) {
        setGeneratedReports(data.data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load generated reports.",
      });
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleGenerateStandardReport = async (
    reportType: "ideas" | "consultations"
  ) => {
    setIsDownloading(reportType);
    try {
      const token = getToken();
      const endpoint =
        reportType === "ideas"
          ? "/api/reports/standard/ideas-summary"
          : "/api/reports/standard/consultations";

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate report");
      }

      // Download the CSV file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Report Downloaded",
        description: `Your ${reportType} report has been downloaded successfully.`,
      });

      // Refresh the reports list
      fetchGeneratedReports();
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description:
          error.message || "Failed to generate report. Please try again.",
      });
    } finally {
      setIsDownloading(null);
    }
  };

  const handleCustomReportSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      const token = getToken();

      // Build request payload
      const payload = {
        reportName:
          reportName ||
          `Custom Report ${new Date().toISOString().split("T")[0]}`,
        format: reportFormat,
        dataSource: dataSource,
        dateRange: dateRange
          ? {
              from: dateRange.from?.toISOString(),
              to: dateRange.to?.toISOString(),
            }
          : undefined,
        filters: selectedFilters,
        columns: selectedColumns,
        schedule:
          scheduleType === "schedule"
            ? {
                type: "scheduled",
                frequency: scheduleFrequency,
              }
            : { type: "now" },
      };

      const response = await fetch(`${API_URL}/api/reports/custom/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate custom report");
      }

      // If it's a CSV download
      if (reportFormat === "csv" && scheduleType === "now") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${reportName.replace(/\s+/g, "_")}_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Report Generated",
          description: "Your custom report has been downloaded.",
        });
      } else {
        const data = await response.json();
        toast({
          title: "Report Scheduled",
          description: data.message || "Your custom report has been scheduled.",
        });
      }

      setIsBuilderOpen(false);
      fetchGeneratedReports();
    } catch (error: any) {
      console.error("Error generating custom report:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Failed to generate custom report.",
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/api/hub/reports/${reportId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete report");

      setGeneratedReports((prev) => prev.filter((r) => r.id !== reportId));

      toast({
        title: "Report Deleted",
        description: "The report has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete report.",
      });
    }
  };

  const handleShareClick = (report: GeneratedReport) => {
    setSelectedReport(report);
    setIsShareOpen(true);
  };

  const handleCopyLink = () => {
    if (!selectedReport) return;
    navigator.clipboard.writeText(
      `${window.location.origin}/reports/${selectedReport.id}`
    );
    toast({ title: "Link Copied!" });
  };

  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
    );
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
            <CardDescription>
              Generate, manage, and share reports based on your role and data.
            </CardDescription>
          </CardHeader>
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
                <CardDescription>
                  View, download, or share your generated reports.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingReports ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : generatedReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No reports generated yet. Create your first report above!
                  </div>
                ) : (
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
                      {generatedReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">
                            {report.name}
                          </TableCell>
                          <TableCell>{report.type}</TableCell>
                          <TableCell>{report.date}</TableCell>
                          <TableCell>{report.status}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={report.status !== "Ready"}
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleShareClick(report)}
                              title="Share"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteReport(report.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="standard" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Standard Reports</CardTitle>
                <CardDescription>
                  One-click reports for common data exports.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">All Ideas Summary</p>
                    <p className="text-sm text-muted-foreground">
                      A CSV export of all submitted ideas.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleGenerateStandardReport("ideas")}
                    disabled={isDownloading === "ideas"}
                  >
                    {isDownloading === "ideas" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      "Generate"
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Consultation History</p>
                    <p className="text-sm text-muted-foreground">
                      A CSV export of all consultations.
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      handleGenerateStandardReport("consultations")
                    }
                    disabled={isDownloading === "consultations"}
                  >
                    {isDownloading === "consultations" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      "Generate"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Custom Report Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Custom Report Builder</DialogTitle>
            <DialogDescription>
              Select your criteria to generate a custom report.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleCustomReportSubmit}
            className="flex-1 overflow-hidden flex flex-col"
          >
            <ScrollArea className="flex-1 pr-6 -mr-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                <div className="space-y-6">
                  {/* Column 1: Basic Info & Data Source */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">1. Report Details</h4>
                    <div className="space-y-2">
                      <Label htmlFor="report-name">Report Name</Label>
                      <Input
                        id="report-name"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                        placeholder="e.g., Q3 Approved HealthTech Ideas"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Report Format</Label>
                      <RadioGroup
                        value={reportFormat}
                        onValueChange={setReportFormat}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="csv" id="csv" />
                          <Label htmlFor="csv">CSV</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pdf" id="pdf" />
                          <Label htmlFor="pdf">PDF</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">2. Data Source</h4>
                    <Select
                      value={dataSource}
                      onValueChange={(value) =>
                        setDataSource(value as DataSource)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(roleReportOptions).map((source) => (
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
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateRange && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "LLL dd, y")} -{" "}
                                  {format(dateRange.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(dateRange.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {currentReportOptions?.filters.map((filter) => (
                      <div key={filter.key} className="space-y-2">
                        <Label>{filter.label}</Label>
                        <Select
                          onValueChange={(value) =>
                            setSelectedFilters((prev) => ({
                              ...prev,
                              [filter.key]: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={`Filter by ${filter.label.toLowerCase()}`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {filter.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  {/* Column 2: Columns & Scheduling */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">4. Select Columns</h4>
                    <ScrollArea className="h-60 pr-2">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm border rounded-md p-4">
                        {currentReportOptions?.columns.map((col) => (
                          <div
                            key={col}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`col-${col}`}
                              checked={selectedColumns.includes(col)}
                              onCheckedChange={() => handleColumnToggle(col)}
                            />
                            <Label
                              htmlFor={`col-${col}`}
                              className="font-normal"
                            >
                              {col}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">5. Schedule & Delivery</h4>
                    <RadioGroup
                      value={scheduleType}
                      onValueChange={setScheduleType}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="now" id="now" />
                        <Label htmlFor="now">Run Now</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="schedule" id="schedule" />
                        <Label htmlFor="schedule">Schedule</Label>
                      </div>
                    </RadioGroup>

                    {scheduleType === "schedule" && (
                      <div className="space-y-4 p-4 border rounded-md">
                        <div className="space-y-2">
                          <Label>Frequency</Label>
                          <Select
                            value={scheduleFrequency}
                            onValueChange={setScheduleFrequency}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4 border-t">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Generate Report</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
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
              <Button
                type="button"
                size="sm"
                className="px-3"
                onClick={handleCopyLink}
              >
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium text-center text-muted-foreground">
                Quick Share
              </p>
              <div className="flex justify-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="icon">
                        <a href="#">
                          <WhatsAppIcon className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>WhatsApp</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="icon">
                        <a href="#">
                          <TwitterIcon className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>X / Twitter</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="icon">
                        <a href="#">
                          <LinkedInIcon className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>LinkedIn</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="icon">
                        <a href="#">
                          <MailIcon className="h-5 w-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Email</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
