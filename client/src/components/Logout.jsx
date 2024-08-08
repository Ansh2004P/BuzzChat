import React, { useState } from "react";
import { toast } from "react-toastify";
import Loading from "../assets/images/Ellipsis@1x-1.8s-200px-200px";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useLogoutHook from "../hooks/useLogoutHook";

const Logout = () => {
 
  const { handleSubmit, loading } = useLogoutHook();
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
