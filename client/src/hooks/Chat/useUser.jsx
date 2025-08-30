// hooks/useUser.js
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../../services/api";

const useUser = (userId) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await userAPI.getCurrentUser();
      return data.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
  });
};

export default useUser;
