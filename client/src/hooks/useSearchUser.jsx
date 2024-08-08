import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../utils/utils";

const useSearchUser = (searchUser) => {
  const [searchResult, setSearchResult] = useState([]);

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URI}/chat/search-user`,
          {
            params: {
              search: searchUser.current.value,
            },

            withCredentials: true,
          }
        );
        setSearchResult(response.data.data);
      } catch (err) {
        const errorMessage = extractErrorMessage(err.response.data);
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
  };
  return { searchResult, handleSearch, setSearchResult };
};

export default useSearchUser;
