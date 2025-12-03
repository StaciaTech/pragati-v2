// hooks/useTtcInnovators.ts

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () => localStorage.getItem("token");

export interface Innovator {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  creditQuota: number;
  createdBy: string;
  collegeId?: string;
  ttcCoordinatorId?: string;
  ideasCount: number;
  recentIdeas: Array<{
    _id: string;
    title: string;
    status: string;
    domain: string;
    submittedAt: string;
  }>;
  createdAt: string;
}

export interface TtcInnovatorsResponse {
  success: boolean;
  data: Innovator[];
  meta: {
    ttcId: string;
    ttcName: string;
    ttcEmail: string;
    totalInnovators: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useTtcInnovators = (ttcId: string | null) => {
  return useQuery<TtcInnovatorsResponse>({
    queryKey: ["ttc-innovators", ttcId],
    queryFn: async () => {
      if (!ttcId) throw new Error("TTC ID is required");

      const token = getToken();
      if (!token) throw new Error("No authentication token");

      const { data } = await axios.get<TtcInnovatorsResponse>(
        `${apiUrl}/api/users/ttc/${ttcId}/innovators`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    enabled: !!ttcId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });
};
