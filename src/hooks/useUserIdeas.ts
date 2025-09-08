// hooks/useUserIdeas.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface Idea {
  _id: string;
  ideaName: string;
  overallScore: number;
  validationOutcome: string;
  createdAt: string;
}

async function fetchUserIdeas(): Promise<Idea[]> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");

  const uid = localStorage.getItem("UserId");

  const { data } = await axios.get(`${apiUrl}/api/ideas/user/${uid}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export function useUserIdeas() {
  return useQuery({
    queryKey: ["userIdeas"],
    queryFn: fetchUserIdeas,
    staleTime: 1000 * 60 * 5,
  });
}
