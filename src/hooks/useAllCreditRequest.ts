// hooks/useCredits.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Type definitions
interface PendingRequest {
  id: string;
  from: string;
  to: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  level: "innovator-ttc" | "ttc-college";
  createdAt: string;
  decidedAt?: string;
  fromName?: string;
  fromEmail?: string;
}

// Hook for fetching and managing pending request
export const useMyPendingRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const uid =
    typeof window !== "undefined" ? localStorage.getItem("UserId") : null;

  // Query to fetch pending request
  const query = useQuery({
    queryKey: ["myPendingRequest", uid],
    queryFn: async () => {
      const { data } = await axios.get(
        `${apiUrl}/api/credits/my-pending-request/${uid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data.data as PendingRequest | null;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!uid && !!token,
  });

  // Mutation to delete request with OPTIMISTIC UPDATE
  const deleteRequest = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`${apiUrl}/api/credits/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },

    // OPTIMISTIC UPDATE - Remove card immediately
    onMutate: async (requestId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["myPendingRequest", uid],
      });

      // Snapshot previous value
      const previousRequest = queryClient.getQueryData<PendingRequest | null>([
        "myPendingRequest",
        uid,
      ]);

      // Optimistically remove (set to null)
      queryClient.setQueryData(["myPendingRequest", uid], null);

      // Return context for rollback
      return { previousRequest };
    },

    // On success
    onSuccess: () => {
      toast({
        title: "Request Cancelled",
        description: "Your credit request has been successfully cancelled.",
      });
    },

    // On error - rollback
    onError: (error: any, variables, context) => {
      if (context?.previousRequest !== undefined) {
        queryClient.setQueryData(
          ["myPendingRequest", uid],
          context.previousRequest
        );
      }

      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description:
          error?.response?.data?.message || "Failed to cancel request",
      });
    },

    // Refetch after completion
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["myPendingRequest", uid],
      });
    },
  });

  return { ...query, deleteRequest };
};

// Hook for requesting credits with OPTIMISTIC UPDATE
export const useRequestCredits = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const uid =
    typeof window !== "undefined" ? localStorage.getItem("UserId") : null;

  return useMutation({
    mutationFn: async (payload: { amount: number; reason: string }) => {
      const { data } = await axios.post(
        `${apiUrl}/api/credits/request-from-ttc`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data.data as PendingRequest;
    },

    // OPTIMISTIC UPDATE - Show card immediately
    onMutate: async (newRequest) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["myPendingRequest", uid],
      });

      // Snapshot previous value
      const previousRequest = queryClient.getQueryData<PendingRequest | null>([
        "myPendingRequest",
        uid,
      ]);

      // Create optimistic request
      const optimisticRequest: PendingRequest = {
        id: `temp-${Date.now()}`,
        from: uid || "",
        to: "",
        amount: newRequest.amount,
        reason: newRequest.reason,
        status: "pending",
        level: "innovator-ttc",
        createdAt: new Date().toISOString(),
      };

      // Set optimistic data
      queryClient.setQueryData(["myPendingRequest", uid], optimisticRequest);

      // Return context for rollback
      return { previousRequest };
    },

    // On success - replace with real data
    onSuccess: (data) => {
      queryClient.setQueryData(["myPendingRequest", uid], data);

      toast({
        title: "Request Submitted",
        description: `Your request for ${data.amount} credits has been submitted to your TTC Coordinator.`,
      });
    },

    // On error - rollback
    onError: (error: any, variables, context) => {
      if (context?.previousRequest !== undefined) {
        queryClient.setQueryData(
          ["myPendingRequest", uid],
          context.previousRequest
        );
      }

      toast({
        variant: "destructive",
        title: "Request Failed",
        description:
          error?.response?.data?.message || "Failed to submit request",
      });
    },

    // Refetch after completion
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["myPendingRequest", uid],
      });
    },
  });
};

// Hook to get user profile (for credit balance)
export const useUserProfile = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.user;
    },
    staleTime: 60 * 1000,
    enabled: !!token,
  });
};
