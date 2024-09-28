import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { extractErrorMessage, VITE_SERVER_URI } from "../utils/utils";
import { toast } from "react-toastify";
import { setUser } from "../utils/redux/userSlice";

const useGetCurrentUser = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const getCurrentUser = async () => {
    const response = await axios.get(
      `${VITE_SERVER_URI}/user/current-user`,
      {
        withCredentials: true,
      }
    );
    // console.log(response.data.data);
    dispatch(setUser(response.data.data));
  };
  // console.log(user.avatar);

  useEffect(() => {
    try {
      getCurrentUser();
    } catch (error) {
      const errorMessage = extractErrorMessage(error.response.data);
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
  }, []);

  return { user };
};

export default useGetCurrentUser;
