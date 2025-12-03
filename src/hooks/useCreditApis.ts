import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
export interface CreditRequest {
  _id: string;
  from: string;
  to: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  level: "innovator-ttc" | "ttc-college";
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
  rejectionReason?: string;
  // Enriched fields
  ttcName?: string;
  ttcEmail?: string;
  innovatorName?: string;
  innovatorEmail?: string;
  fromName?: string;
  fromEmail?: string;
  toName?: string;
  toEmail?: string;
}

const getToken = () => localStorage.getItem("token");
const getUserId = () => {
  const token = getToken();
  if (!token) return null;
  const { uid } = JSON.parse(atob(token.split(".")[1]));
  return uid;
};

// ============================================================================
// COLLEGE ADMIN HOOKS
// ============================================================================

/**
 * Get all incoming credit requests (from TTCs) for college admin
 */
export const useCollegeIncomingRequests = () => {
  return useQuery({
    queryKey: ["college-credit-requests"],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(
        `${API_URL}/api/credits/college/incoming-requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data.data as CreditRequest[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Approve or reject a TTC credit request
 */
export const useDecideCreditRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      decision,
      reason,
    }: {
      requestId: string;
      decision: "approved" | "rejected";
      reason?: string;
    }) => {
      const token = getToken();
      const { data } = await axios.put(
        `${API_URL}/api/credits/college/incoming-requests/${requestId}/decide`,
        {
          decision,
          reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    onSuccess: () => {
      // Refetch the requests list
      queryClient.invalidateQueries({ queryKey: ["college-credit-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-pending-request"] });
    },
  });
};

/**
 * Get user's own pending credit request
 */
export const useMyPendingRequest = () => {
  const userId = getUserId();

  return useQuery({
    queryKey: ["my-pending-request", userId],
    queryFn: async () => {
      if (!userId) return null;
      const token = getToken();
      const { data } = await axios.get(
        `${API_URL}/api/credits/my-pending-request/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data.data as CreditRequest | null;
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
};

/**
 * Cancel/delete own pending credit request
 */
export const useCancelCreditRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const token = getToken();
      const { data } = await axios.delete(
        `${API_URL}/api/credits/${requestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-pending-request"] });
      queryClient.invalidateQueries({ queryKey: ["college-credit-requests"] });
    },
  });
};

// ============================================================================
// TTC COORDINATOR HOOKS
// ============================================================================

/**
 * TTC requests credits from college admin
 */
export const useRequestCreditsFromCollege = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      reason,
    }: {
      amount: number;
      reason: string;
    }) => {
      const token = getToken();
      const { data } = await axios.post(
        `${API_URL}/api/credits/ttc/request-from-college`,
        {
          amount,
          reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-pending-request"] });
    },
  });
};

/**
 * Get incoming credit requests for TTC (from innovators)
 */
export const useTTCIncomingRequests = () => {
  return useQuery({
    queryKey: ["ttc-credit-requests"],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(
        `${API_URL}/api/credits/ttc/incoming-requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data.data as CreditRequest[];
    },
    staleTime: 30 * 1000,
  });
};

/**
 * TTC approves/rejects innovator credit request
 */
export const useTTCDecideCreditRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      decision,
      reason,
    }: {
      requestId: string;
      decision: "approved" | "rejected";
      reason?: string;
    }) => {
      const token = getToken();
      const { data } = await axios.put(
        `${API_URL}/api/credits/ttc/incoming-requests/${requestId}/decide`,
        {
          decision,
          reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ttc-credit-requests"] });
    },
  });
};

// ============================================================================
// INNOVATOR HOOKS
// ============================================================================

/**
 * Innovator requests credits from their TTC
 */
export const useRequestCreditsFromTTC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      reason,
    }: {
      amount: number;
      reason: string;
    }) => {
      const token = getToken();
      const { data } = await axios.post(
        `${API_URL}/api/credits/request-from-ttc`,
        {
          amount,
          reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-pending-request"] });
    },
  });
};
