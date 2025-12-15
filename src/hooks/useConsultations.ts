// lib/hooks/useConsultations.ts
import { useState, useEffect } from "react";

export interface Consultation {
  id: string;
  ideaId: string;
  title: string;
  innovatorName: string;
  innovatorEmail: string;
  mentor: string;
  mentorEmail: string;
  mentorOrganization: string;
  domain: string;
  date: string;
  time: string;
  scheduledAt: string;
  status:
    | "assigned"
    | "Scheduled"
    | "Pending"
    | "Completed"
    | "Cancelled"
    | "rescheduled";
  notes: string;
  overallScore: number | null;
  agenda: string[];
  pointsDiscussed: string[];
  actionItems: Array<{
    task: string;
    owner: string;
    dueDate: string;
  }>;
  files: string[];
  recordingUrl?: string;
  createdAt?: string;
}

export interface EligibleIdea {
  id: string;
  title: string;
  innovatorId: string;
  innovatorName: string;
  innovatorEmail: string;
  overallScore: number;
  domain: string;
  createdAt: string;
  hasPendingRequest: boolean;
}

export interface ExternalMentor {
  id: string;
  name: string;
  email: string;
  organization?: string;
  expertise?: string[];
}

// lib/hooks/useConsultations.ts

export function useConsultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const getRole = () => {
    if (typeof window === "undefined") return "innovator";
    const role = localStorage.getItem("role");
    // ✅ FIXED: Handle null/undefined role
    return role || "innovator";
  };

  useEffect(() => {
    const loadConsultations = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const role = getRole();

        // ✅ FIXED: Don't send null role
        if (!token) {
          throw new Error("No authentication token found");
        }

        const res = await fetch(
          `${apiUrl}/api/ideas/consultations/my?role=${role}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to load consultations");
        }

        const json = await res.json();

        // Transform backend data to match frontend interface
        const transformedData = (json.data || []).map((item: any) => ({
          id: item.id,
          ideaId: item.ideaId,
          title: item.title,
          innovatorName:
            item.innovator?.name || item.innovatorName || "Unknown",
          innovatorEmail: item.innovator?.email || item.innovatorEmail || "",
          mentor: item.mentor?.name || item.mentorName || "Unknown",
          mentorEmail: item.mentor?.email || item.mentorEmail || "",
          mentorOrganization:
            item.mentor?.organization || item.mentorOrganization || "",
          domain: item.domain || "",
          date: item.date || "",
          time: item.time || "",
          scheduledAt: item.scheduledAt || "",
          status: mapStatus(item.status || item.consultation?.status),
          notes: item.consultation?.notes || item.notes || "",
          overallScore: item.overallScore || null,
          agenda: item.consultation?.agenda || item.agenda || [],
          pointsDiscussed:
            item.consultation?.pointsDiscussed || item.pointsDiscussed || [],
          actionItems: item.consultation?.actionItems || item.actionItems || [],
          files: item.consultation?.files || item.files || [],
          recordingUrl:
            item.consultation?.recordingUrl || item.recordingUrl || "",
          createdAt: item.createdAt || "",
        }));

        setConsultations(transformedData);
      } catch (err: any) {
        setError(err.message);
        console.error("Error loading consultations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadConsultations();
  }, []);

  // Helper function to map backend status to frontend status
  function mapStatus(status: string): Consultation["status"] {
    const statusMap: Record<string, Consultation["status"]> = {
      assigned: "Scheduled",
      scheduled: "Scheduled",
      pending: "Pending",
      completed: "Completed",
      cancelled: "Cancelled",
      rescheduled: "Scheduled",
    };
    return statusMap[status?.toLowerCase()] || "Pending";
  }

  // Fetch eligible ideas (score >= 85, no consultation)
  const fetchEligibleIdeas = async (): Promise<EligibleIdea[]> => {
    try {
      const token = getToken();
      const role = getRole();

      // ✅ FIXED: Validate token
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await fetch(
        `${apiUrl}/api/ideas/eligible-for-consultation?role=${role}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch eligible ideas");
      }

      const json = await res.json();
      return json.data || [];
    } catch (err: any) {
      console.error("Error fetching eligible ideas:", err);
      throw err;
    }
  };

  // Fetch external mentors
  const fetchExternalMentors = async (): Promise<ExternalMentor[]> => {
    try {
      const token = getToken();

      // ✅ FIXED: Validate token
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await fetch(`${apiUrl}/api/users/mentors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch mentors");
      }

      const json = await res.json();
      return json.data || [];
    } catch (err: any) {
      console.error("Error fetching mentors:", err);
      throw err;
    }
  };

  // Request consultation
  const requestConsultation = async (
    ideaId: string,
    payload: {
      mentorId: string;
      preferredDate: string;
      questions: string;
    }
  ) => {
    try {
      const token = getToken();
      const role = getRole();

      const res = await fetch(
        `${apiUrl}/api/ideas/${ideaId}/consultation/request?role=${role}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit request");
      }

      const json = await res.json();
      return json;
    } catch (err: any) {
      console.error("Error requesting consultation:", err);
      throw err;
    }
  };

  // Reschedule consultation
  const rescheduleConsultation = async (
    ideaId: string,
    payload: {
      scheduledAt: string;
      reason: string;
    }
  ) => {
    try {
      const token = getToken();
      const role = getRole();

      const res = await fetch(
        `${apiUrl}/api/ideas/${ideaId}/consultation/reschedule?role=${role}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to reschedule");
      }

      const json = await res.json();
      return json;
    } catch (err: any) {
      console.error("Error rescheduling consultation:", err);
      throw err;
    }
  };

  // Refresh consultations
  const refreshConsultations = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const role = getRole();

      const res = await fetch(
        `${apiUrl}/api/ideas/consultations/my?role=${role}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to refresh consultations");
      }

      const json = await res.json();

      const transformedData = (json.data || []).map((item: any) => ({
        id: item.id,
        ideaId: item.ideaId,
        title: item.title,
        innovatorName: item.innovator?.name || item.innovatorName || "Unknown",
        innovatorEmail: item.innovator?.email || item.innovatorEmail || "",
        mentor: item.mentor?.name || item.mentorName || "Unknown",
        mentorEmail: item.mentor?.email || item.mentorEmail || "",
        mentorOrganization:
          item.mentor?.organization || item.mentorOrganization || "",
        domain: item.domain || "",
        date: item.date || "",
        time: item.time || "",
        scheduledAt: item.scheduledAt || "",
        status: mapStatus(item.status || item.consultation?.status),
        notes: item.consultation?.notes || item.notes || "",
        overallScore: item.overallScore || null,
        agenda: item.consultation?.agenda || item.agenda || [],
        pointsDiscussed:
          item.consultation?.pointsDiscussed || item.pointsDiscussed || [],
        actionItems: item.consultation?.actionItems || item.actionItems || [],
        files: item.consultation?.files || item.files || [],
        recordingUrl:
          item.consultation?.recordingUrl || item.recordingUrl || "",
        createdAt: item.createdAt || "",
      }));

      setConsultations(transformedData);
    } catch (err: any) {
      setError(err.message);
      console.error("Error refreshing consultations:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    consultations,
    loading,
    error,
    fetchEligibleIdeas,
    fetchExternalMentors,
    requestConsultation,
    rescheduleConsultation,
    refreshConsultations,
  };
}
