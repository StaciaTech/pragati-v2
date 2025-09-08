import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const getToken = () => localStorage.getItem("token");

export const useAllInnovators = () =>
  useQuery({
    queryKey: ["allInnovators"],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(`${apiUrl}/api/innovators`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.data as import("./types").Innovator[];
    },
    staleTime: 5 * 60 * 1000,
  });
