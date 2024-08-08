import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearUser } from "../utils/redux/userSlice";

const useLogoutHook = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URI}/user/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      // console.log(response);
      localStorage.removeItem("userInfo");
      dispatch(clearUser());

      setLoading(false);
      toast.success(response.data.message, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });

      navigate("/login");
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response.data.message;
      toast.error(errorMessage, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }
  };

  return { handleSubmit, loading };
};

export default useLogoutHook;
