// hooks/useMyDraft.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useMyDraft = () =>
  useQuery({
    queryKey: ["my-draft"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ideas/draft/my-latest`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return data; // { draft }  or  { draft: null }
    },
    staleTime: 0, // always fresh
  });
