// hooks/useDraft.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const useDraft = (draftId?: string) =>
  useQuery({
    queryKey: ["draft", draftId],
    queryFn: () =>
      fetch(`${apiUrl}/api/ideas/draft/${draftId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then((r) => r.json()),
    enabled: !!draftId,
  });

export const useSaveDraft = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) =>
      fetch(`${apiUrl}/api/ideas/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["draft", vars.draftId] });
    },
  });
};

export const useInviteTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { draftId: string; email: string }) =>
      fetch(`${apiUrl}/api/ideas/draft/team`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: (_, { draftId }) =>
      qc.invalidateQueries({ queryKey: ["draft", draftId] }),
  });
};

export const useAssignMentor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { draftId: string; mentorId: string }) =>
      fetch(`${apiUrl}/api/ideas/draft/mentor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: (_, { draftId }) =>
      qc.invalidateQueries({ queryKey: ["draft", draftId] }),
  });
};

export const useUploadPpt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      draftId,
      file,
      sessionKey,
    }: {
      draftId: string;
      file: File;
      sessionKey?: string;
    }) => {
      const fd = new FormData();
      fd.append("pptFile", file);
      fd.append("draftId", draftId);
      if (sessionKey) fd.append("sessionKey", sessionKey);
      return fetch(`${apiUrl}/api/ideas/draft/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: fd,
      }).then((r) => r.json());
    },
    onSuccess: (_, { draftId }) =>
      qc.invalidateQueries({ queryKey: ["draft", draftId] }),
  });
};

export const useSubmitDraft = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) =>
      fetch(`${apiUrl}/api/ideas/draft/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ draftId }),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ideas"] }),
  });
};
