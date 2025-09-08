import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const useCreditRequests = () =>
  useQuery({
    queryKey: ["ttc-credit-requests"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${apiUrl}/api/credits/ttc/incoming-requests`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return data.data as import("./types").CreditRequest[];
    },
    staleTime: 5 * 60 * 1000,
  });
