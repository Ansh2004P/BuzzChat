import React, { useState } from "react";
import { toast } from "react-toastify";
import Loading from "../assets/images/Ellipsis@1x-1.8s-200px-200px";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVER_URI}/user/logout`,
        {
          withCredentials: true,
        }
      );

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

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col space-y-2 my-8">
      <span className="w-10vw flex flex-col ">
        Would you like to log out?
        <button
          className="bg-red-700 hover:bg-red-800 mt-5 p-2 rounded-full shadow-sm shadow-red-700"
          onClick={handleSubmit}
        >
          Log-Out
        </button>
      </span>
    </div>
  );
};

export default Logout;
