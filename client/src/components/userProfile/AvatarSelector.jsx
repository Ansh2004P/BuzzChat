import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../../utils/utils";

const AvatarSelector = ({ photu, onAvatarChange }) => {
  const [avatar, setAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = async (file) => {
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewAvatar(reader.result);

        // Send the file data to the parent component
        onAvatarChange(file);
      };
      reader.readAsDataURL(file);
      setLoading(true);

      const formData = new FormData();
      formData.append("avatar", file); // Use 'file' here

      const config = {
        headers: { "Content-type": "multipart/form-data" },
        withCredentials: true,
      };

      try {
        const response = await axios.patch(
          `${import.meta.env.VITE_SERVER_URI}/user/update-avatar`,
          formData,
          config
        );
        console.log(response);
        setLoading(false);

        toast.success(response.data.message, {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: "dark",
        });
      } catch (error) {
        setLoading(false);
        const errorMessage = extractErrorMessage(error.response.data);
        toast.error(errorMessage, {
          position: "bottom-center",
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

  return (
    <div className="flex justify-start px-12 my-4 w-[15vw]">
      <label
        htmlFor="avatar-input"
        className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-gray-700 cursor-pointer"
      >
        {previewAvatar ? (
          <img
            src={previewAvatar}
            alt="Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full bg-gray-500 flex justify-center items-center rounded-full">
            <img
              src={photu}
              alt="default image"
              className="w-full h-full object-cover rounded-full"
            />
            /
          </div>
        )}

        <input
          id="avatar-input"
          type="file"
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => handleAvatarChange(e.target.files[0])}
        />
        {/* Hover Effect */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-100 bg-black bg-opacity-50 rounded-full">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 17.25V21h3.75l8.1-8.1-3.75-3.75L3 17.25zM14.65 6.35l1.4-1.4a2 2 0 012.8 0l2.1 2.1a2 2 0 010 2.8l-1.4 1.4-4.1-4.1z"
            />
          </svg>
        </div>
      </label>
    </div>
  );
};

AvatarSelector.propTypes = {
  photu: PropTypes.string,
  onAvatarChange: PropTypes.func.isRequired,
};

export default AvatarSelector;
