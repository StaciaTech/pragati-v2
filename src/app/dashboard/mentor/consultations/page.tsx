"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ROLES } from "@/lib/constants";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

const STATUS_COLORS: Record<string, string> = {
  assigned: "bg-blue-500",
  scheduled: "bg-blue-500",
  rescheduled: "bg-yellow-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

interface Consultation {
  _id: string;
  ideaId: string;
  ideaTitle: string;
  innovatorName: string;
  scheduledAt: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
  domain?: string;
}

export default function MentorConsultationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("upcoming");

  // ✅ Fetch upcoming consultations
  const { data: upcomingResp, isLoading: upcomingLoading } = useQuery({
    queryKey: ["mentor-consultations-upcoming"],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(
        `${apiUrl}/api/mentors/consultations?filter=upcoming`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
  });

  // ✅ Fetch past consultations
  const { data: pastResp, isLoading: pastLoading } = useQuery({
    queryKey: ["mentor-consultations-past"],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(
        `${apiUrl}/api/mentors/consultations?filter=past`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
  });

  const upcomingConsultations = upcomingResp?.data || [];
  const pastConsultations = pastResp?.data || [];

  const handleViewIdea = (ideaId: string) => {
    router.push(`/dashboard/ideas/details?id=${ideaId}&role=${ROLES.MENTOR}`);
  };

  const ConsultationTable = ({
    consultations,
    isLoading,
  }: {
    consultations: Consultation[];
    isLoading: boolean;
  }) => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Idea Title</TableHead>
            <TableHead>Innovator</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consultations.length > 0 ? (
            consultations.map((consultation) => (
              <TableRow
                key={consultation._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleViewIdea(consultation.ideaId)}
              >
                <TableCell className="font-medium text-primary hover:underline">
                  {consultation.ideaTitle}
                  {consultation.domain && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({consultation.domain})
                    </span>
                  )}
                </TableCell>
                <TableCell>{consultation.innovatorName}</TableCell>
                <TableCell>
                  {consultation.date && consultation.time ? (
                    <>
                      {new Date(consultation.scheduledAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                      {" at "}
                      {new Date(consultation.scheduledAt).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      STATUS_COLORS[consultation.status] || "bg-gray-500",
                    )}
                  >
                    {consultation.status.charAt(0).toUpperCase() +
                      consultation.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground"
              >
                No consultations found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Consultations</CardTitle>
        <CardDescription>
          View and manage your consultation schedule.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingConsultations.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              History ({pastConsultations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            <ConsultationTable
              consultations={upcomingConsultations}
              isLoading={upcomingLoading}
            />
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            <ConsultationTable
              consultations={pastConsultations}
              isLoading={pastLoading}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
