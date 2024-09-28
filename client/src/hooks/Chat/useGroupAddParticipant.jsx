// src/hooks/useGroupAddParticipant.js
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { useCallback } from "react";
import { setgroupSearchResult } from "../../utils/redux/groupSearchSlice";
import { VITE_SERVER_URI } from "../../utils/utils";

const useGroupAddParticipant = (searchUserRef) => {
  const dispatch = useDispatch();

  // Memoize handleSearch function to prevent re-creation on each render
  const handleSearch = useCallback(
    async (e) => {
      if (e.key === "Enter") {
        try {
          const response = await axios.get(
            `${VITE_SERVER_URI}/chat/search-user`,
            {
              params: {
                search: searchUserRef.current.value,
              },
              withCredentials: true,
            }
          );
          console.log("chat", response.data.data);

          dispatch(setgroupSearchResult(response.data.data)); // Update search results in Redux
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

export default useGroupAddParticipant;
