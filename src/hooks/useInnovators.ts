import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const getToken = () => localStorage.getItem("token");
const getCollegeId = () => localStorage.getItem("collegeId");

export const useInnovators = () =>
  useQuery({
    queryKey: ["innovators", getCollegeId()],
    queryFn: async () => {
      const token = getToken();
      const { uid } = JSON.parse(atob(token!.split(".")[1]));
      const { data } = await axios.get(`${apiUrl}/api/users`, {
        params: { college_id: getCollegeId(), ttc_id: uid },
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.docs as import("./types").Innovator[];
    },
    staleTime: 5 * 60 * 1000,
  });
