// hooks/useUser.js
import { useQuery } from "react-query";
import axios from "axios";

const fetchUser = async (userId) => {
  const { data } = await axios.get(`/api/user/${userId}`);
  return data;
};

const useUser = (userId) => {
  return useQuery(["user", userId], () => fetchUser(userId), {
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    cacheTime: 1000 * 60 * 10, // Keep unused data in cache for 10 minutes
  });
};

export default useUser;
