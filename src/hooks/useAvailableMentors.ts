import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Mentor {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  expertise?: string[];
  phone?: string;
  profileImage?: string;
  ttcCoordinatorId: string;
  isActive: boolean;
  createdAt: string;
}

interface AvailableMentorsResponse {
  success: boolean;
  data: Mentor[];
  meta: {
    ttcCoordinatorId: string;
    ttcCoordinatorName: string;
    totalMentors: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useAvailableMentors(filters?: {
  department?: string;
  expertise?: string;
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = localStorage.getItem("token");

  return useQuery<AvailableMentorsResponse>({
    queryKey: ["available-mentors", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.department) params.append("department", filters.department);
      if (filters?.expertise) params.append("expertise", filters.expertise);

      const { data } = await axios.get(
        `${apiUrl}/api/users/available-mentors?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    enabled: !!token, // Only run query if token exists
  });
}
