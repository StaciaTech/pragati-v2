"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Lightbulb, MessageSquare, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ROLES } from "@/lib/constants";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

export default function MentorDashboardPage() {
  const router = useRouter();

  // ✅ Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["mentor-dashboard-stats"],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(
        `${apiUrl}/api/mentors/dashboard/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data.data;
    },
  });

  // ✅ Fetch assigned ideas for table
  const { data: ideasResp, isLoading: ideasLoading } = useQuery({
    queryKey: ["mentor-assigned-ideas"],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(`${apiUrl}/api/mentors/my-ideas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
  });

  const assignedIdeas = ideasResp?.data || [];

  if (statsLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ✅ Assigned Innovators Card */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() =>
            router.push(`/dashboard/mentor/innovators?role=${ROLES.MENTOR}`)
          }
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Innovators
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats?.assignedInnovators || 0}
            </p>
          </CardContent>
        </Card>

        {/* ✅ Assigned Ideas Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Ideas
            </CardTitle>
            <Lightbulb className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.assignedIdeas || 0}</p>
          </CardContent>
        </Card>

        {/* ✅ Upcoming Consultations Card */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() =>
            router.push(`/dashboard/mentor/consultations?role=${ROLES.MENTOR}`)
          }
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Consultations
            </CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats?.consultations?.upcoming || 0}
            </p>
          </CardContent>
        </Card>

        {/* ✅ Completed Consultations Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Consultations
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats?.consultations?.completed || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Ideas Table - Keep existing table code */}
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Ideas</CardTitle>
        </CardHeader>
        <CardContent>{/* Your existing table code */}</CardContent>
      </Card>
    </div>
  );
}
