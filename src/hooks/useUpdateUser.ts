import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useUpdateUser() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uid, data, queryKey }) => {
      const res = await axios.put(`${apiUrl}/api/users/${uid}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      console.log("User updated:", data);
      // Invalidate the specified query key
      queryClient.invalidateQueries({ queryKey: variables.queryKey });
    },
    onError: (error) => {
      console.error("Failed to update user:", error);
    },
  });
}
