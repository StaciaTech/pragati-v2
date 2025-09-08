import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const token = localStorage.getItem("token");

export const useColleges = () =>
  useQuery({
    queryKey: ["all-colleges"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${apiUrl}/api/users?role=college_admin`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data.docs;
    },
    staleTime: 5 * 60 * 1000,
  });
