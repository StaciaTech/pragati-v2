import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const getToken = () => localStorage.getItem("token");

export const useTtcs = (college_id: string) =>
  useQuery({
    queryKey: ["all-ttcs", college_id], // ← dynamic cache key
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("No token");
      const { data } = await axios.get(`${apiUrl}/api/users`, {
        params: { college_id, role: "ttc_coordinator" },
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.docs;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!college_id, // ← skip while id is empty
  });
