// hooks/useUserIdeas.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export interface ConsultationDetails {
  status: "Scheduled" | "Pending" | "Completed" | "Cancelled" | "Assigned";
  scheduledAt?: string;
  mentor?: {
    name: string;
    email: string;
    organization?: string;
  };
  meetingLink?: string;
}

export interface Idea {
  _id: string;
  title: string; // Changed from ideaName to title based on page.tsx usage
  ideaName?: string; // Keeping as optional just in case
  concept?: string;
  domain?: string;
  status: string; // 'approved', 'pending', etc.
  overallScore: number;
  validationOutcome: string;
  createdAt: string;
  isOwner: boolean;
  consultation?: ConsultationDetails | null;
}

async function fetchUserIdeas(): Promise<Idea[]> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");

  const uid = localStorage.getItem("UserId");

  const { data } = await axios.get(`${apiUrl}/api/ideas/user/${uid}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // console.log(data); // Removed log for cleaner prod code
  return data.data;
}

export function useUserIdeas() {
  return useQuery({
    queryKey: ["userIdeas"],
    queryFn: fetchUserIdeas,
    staleTime: 1000 * 60 * 5,
  });
}
