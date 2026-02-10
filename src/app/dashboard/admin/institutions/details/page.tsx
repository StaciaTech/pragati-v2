"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lightbulb, Loader2, AlertCircle } from "lucide-react";
import { ROLES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-500",
  under_review: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  draft: "bg-gray-500",
};

interface TTC {
  _id: string;
  name: string;
  email: string;
  expertise?: string[];
  innovatorCount: number;
}

interface Idea {
  _id: string;
  title: string;
  status: string;
  domain?: string;
  createdAt: string;
}

interface Innovator {
  _id: string;
  name: string;
  email: string;
  status: string;
  isActive: boolean;
  ideas: Idea[];
}

interface CollegeDetails {
  college: {
    _id: string;
    collegeName: string;
    email: string;
    ttcCoordinatorLimit: number;
    creditQuota: number;
  };
  ttcs: TTC[];
}

interface TTCInnovators {
  ttc: {
    _id: string;
    name: string;
    email: string;
  };
  innovators: Innovator[];
}

const getInitials = (name: string) => {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("") || ""
  );
};

export default function InstitutionDetailsPage() {
  // const params = useParams();
  const searchParams = useSearchParams();
  const collegeId = searchParams.get("id") || "";
  const role = searchParams.get("role") || ROLES.SUPER_ADMIN;

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedTtcId, setSelectedTtcId] = React.useState<string | null>(null);

  // ✅ Fetch College Details with TTCs
  const {
    data: collegeData,
    isLoading: collegeLoading,
    error: collegeError,
  } = useQuery<CollegeDetails>({
    queryKey: ["college-details", collegeId],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(
        `${apiUrl}/api/admin/colleges/${collegeId}/details`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data.data;
    },
    enabled: !!collegeId,
  });

  // ✅ Fetch Innovators for Selected TTC
  const { data: innovatorsData, isLoading: innovatorsLoading } =
    useQuery<TTCInnovators>({
      queryKey: ["ttc-innovators", selectedTtcId],
      queryFn: async () => {
        const token = getToken();
        const { data } = await axios.get(
          `${apiUrl}/api/admin/ttc/${selectedTtcId}/innovators`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        return data.data;
      },
      enabled: !!selectedTtcId && isModalOpen,
    });

  const handleTtcClick = (ttcId: string) => {
    setSelectedTtcId(ttcId);
    setIsModalOpen(true);
  };

  if (collegeLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading college details...</span>
      </div>
    );
  }

  if (collegeError || !collegeData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load college details. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const college = collegeData.college;
  const ttcs = collegeData.ttcs;

  return (
    <>
      <div className="space-y-6">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/admin/institutions?role=${role}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Institutions
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{college.collegeName}</CardTitle>
            <CardDescription>
              A detailed view of the Technology Transfer Cells (TTCs) and
              Innovators. Click on a TTC to view their innovators.
            </CardDescription>
            <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
              <span>
                TTC Limit: <strong>{college.ttcCoordinatorLimit}</strong>
              </span>
              <span>
                Credit Quota: <strong>{college.creditQuota}</strong>
              </span>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ttcs.map((ttc) => (
            <Card
              key={ttc._id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTtcClick(ttc._id)}
            >
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${ttc.name}.png`}
                    alt={ttc.name}
                  />
                  <AvatarFallback>{getInitials(ttc.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle>{ttc.name}</CardTitle>
                  <CardDescription>{ttc.email}</CardDescription>
                  {ttc.expertise && ttc.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ttc.expertise.map((e) => (
                        <Badge key={e} variant="secondary">
                          {e}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Assigned Innovators:{" "}
                  <span className="font-bold text-foreground">
                    {ttc.innovatorCount || 0}
                  </span>
                </p>
              </CardContent>
            </Card>
          ))}
          {ttcs.length === 0 && (
            <p className="text-muted-foreground text-center col-span-full">
              No TTCs found for this college.
            </p>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Innovators under {innovatorsData?.ttc.name || "TTC"}
            </DialogTitle>
            <DialogDescription>
              List of innovators managed by this TTC. Click an innovator to see
              their ideas.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            {innovatorsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : innovatorsData?.innovators &&
              innovatorsData.innovators.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {innovatorsData.innovators.map((innovator) => (
                  <AccordionItem value={innovator._id} key={innovator._id}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 text-xs">
                            <AvatarImage
                              src={`https://avatar.vercel.sh/${innovator.name}.png`}
                              alt={innovator.name}
                            />
                            <AvatarFallback>
                              {getInitials(innovator.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {innovator.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="secondary"
                            className="hidden sm:flex items-center gap-1"
                          >
                            <Lightbulb className="h-3 w-3" />
                            {innovator.ideas?.length || 0}
                          </Badge>
                          <Badge
                            variant={
                              innovator.isActive ? "default" : "destructive"
                            }
                          >
                            {innovator.status}
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {innovator.ideas && innovator.ideas.length > 0 ? (
                        <ul className="space-y-1 pl-8 pr-4">
                          {innovator.ideas.map((idea) => (
                            <li
                              key={idea._id}
                              className="text-xs flex justify-between items-center"
                            >
                              <span>- {idea.title}</span>
                              <Badge
                                className={`${
                                  STATUS_COLORS[idea.status] || "bg-gray-500"
                                } text-white`}
                              >
                                {idea.status}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground pl-8">
                          No ideas submitted by this innovator.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No innovators assigned to this TTC.
              </p>
            )}
          </ScrollArea>
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
