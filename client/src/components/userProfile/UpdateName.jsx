import React, { useState } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setUser, updateUser } from "../../utils/redux/userSlice";

const UpdateName = () => {
  const username = useSelector((state) => state.user.user.username);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(username); // Replace with the current name or prop
  const [tempName, setTempName] = useState(name);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSubmit = async () => {
    if (tempName.trim === "") {
      toast.error("username cannot be empty", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      return;
    }
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_SERVER_URI}/user/update-username`,
        { username: tempName },
        { withCredentials: true }
      );

      // console.log(response.data);
      toast.success(response.data.message, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });

      dispatch(updateUser({ username: tempName }));
      setName(tempName);
      setIsEditing(false);
    } catch (error) {
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

  const handleInputChange = (event) => {
    setTempName(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    setTempName(name); // Reset tempName to the original name if editing is cancelled
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="relative flex">
      {!isEditing ? (
        <>
          <span className="text-lg font-semibold flex justify-start mr-[12vw] ml-10 hover:bg-neutral-800">
            {name}
          </span>
          <button
            onClick={handleEditClick}
            className="rounded-full flex justify-end w-fit"
            aria-label="Edit name"
          >
            <PencilIcon className="w-6 h-6 text-white hover:bg-neutral-800" />
          </button>
        </>
      ) : (
        <div className="relative w-full">
          <input
            type="text"
            value={tempName}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="bg-neutral-800 border border-gray-300 p-2 rounded-md w-full pr-10"
          />
        </div>
      )}
    </div>
  );
};

export default UpdateName;
