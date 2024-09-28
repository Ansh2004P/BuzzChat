import axios from "axios";
import React, { useEffect } from "react";
import { VITE_SERVER_URI } from "../utils/utils";

const useInitHook = () => {
  useEffect(() => {
    axios
      .get(`${VITE_SERVER_URI}/user/check-refresh-token`, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.message === "No refresh token found") {
          // Clear localStorage if no refresh token is found
          localStorage.removeItem("userInfo");
        }
      })
      .catch((error) => {
        localStorage.removeItem("userInfo");
        console.error("Error checking refreshToken:", error);
      });
  }, []);
};

export default useInitHook;
