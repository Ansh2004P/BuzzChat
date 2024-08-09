import axios from "axios";
import React, { useEffect } from "react";

const useInitHook = () => {
  useEffect(() => {
    const response = axios.get(
      `${import.meta.env.VITE_SERVER_URI}/user/check-refresh-token`
    );
  }, []);
};

export default useInitHook;
