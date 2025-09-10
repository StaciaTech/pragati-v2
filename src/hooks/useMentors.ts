import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
const getToken = () => localStorage.getItem("token");

/* -------  hook  ------- */
export const useMentors = () =>
  useQuery({
    queryKey: ["mentors"],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error("No token");
      const { data } = await axios.get(`${apiUrl}/api/mentors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.data; // ← mentors array
    },
    staleTime: 5 * 60 * 1000,
    // enabled: !!collegeId,
  });
