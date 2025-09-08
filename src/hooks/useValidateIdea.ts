// hooks/useValidateIdea.ts
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ROLES } from "@/lib/constants";
import { toast } from "./use-toast";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

async function validateIdea(payload: FormData) {
  const token = localStorage.getItem("token"); // or cookie, etc.

  const { data } = await axios.post(
    `${apiUrl}/api/ideas/validate`,
    payload, // FormData
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: false, // token is in header, not cookie
    }
  );
  return data;
}

export function useValidateIdea() {
  const router = useRouter();

  return useMutation({
    mutationFn: validateIdea,
    onSuccess: (d) => {
      toast({
        title: "Validation Complete!",
        description: `Status: ${d.validationOutcome}`,
      });
      router.push(`/dashboard/ideas/${d.ideaId}?role=${ROLES.INNOVATOR}`);
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: e.message,
      }),
  });
}
