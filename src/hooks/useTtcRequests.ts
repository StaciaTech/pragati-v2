import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface CreditRequest {
  _id: string;
  from: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  ttcName?: string;
  ttcEmail?: string;
}

export const useTtcRequests = () => {
  return useQuery({
    // <-- add return
    queryKey: ["ttc-credit-requests"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${apiUrl}/api/credits/college/incoming-requests`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log(data);
      return data.data as CreditRequest[];
    },
    staleTime: 5 * 60 * 1000,
  });
};
