import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const useMyPendingRequest = () => {
  const queryClient = useQueryClient();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const uid =
    typeof window !== "undefined" ? localStorage.getItem("UserId") : null;

  const query = useQuery({
    queryKey: ["myPendingRequest", uid],
    queryFn: async () => {
      const { data } = await axios.get(
        `${apiUrl}/api/credits/my-pending-request/${uid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data.data; // returns the single object or null
    },
    staleTime: 5 * 60 * 1000,
  });

  const deleteRequest = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`${apiUrl}/api/credits/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPendingRequest"] });
    },
  });

  return { ...query, deleteRequest };
};
