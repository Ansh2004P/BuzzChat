// src/hooks/useSearchUser.js
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { useCallback } from "react";
import { setSearchResult } from "../utils/redux/chatSlice";
import { setgroupSearchResult } from "../utils/redux/groupSearchSlice";

const useSearchUser = ({ searchUserRef, cnt }) => {
  const dispatch = useDispatch();

  // Memoize handleSearch function to prevent re-creation on each render
  const handleSearch = useCallback(
    async (e) => {
      if (e.key === "Enter") {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URI}/chat/search-user`,
            {
              params: {
                search: searchUserRef.current.value,
              },
              withCredentials: true,
            }
          );
          console.log("chat", response.data.data);
          if (cnt === 1) {
            dispatch(setSearchResult(response.data.data)); // Update search results in Redux
          }
          if (cnt === 2) {
            dispatch(setgroupSearchResult(response.data.data)); // Update search results in Redux
          }
        } catch (err) {
          const errorMessage =
            err.response?.data?.message || "Error searching users";
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            theme: "dark",
          });
        }
      }
    },
    [dispatch, searchUserRef]
  );

  return { handleSearch };
};

export default useSearchUser;
