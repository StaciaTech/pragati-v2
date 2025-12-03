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
  status: "assigned" | "completed" | "cancelled" | "rescheduled";
  notes: string;
  overallScore: number | null;
  agenda: string[];
  pointsDiscussed: string[];
  actionItems: any[];
  files: string[];
}

export function useConsultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    const loadConsultations = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const res = await fetch(`${apiUrl}/api/ideas/consultations/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to load consultations");
        }

        const json = await res.json();
        setConsultations(json.data || []);
      } catch (err: any) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadConsultations();
  }, []);

  return { consultations, loading, error };
}
