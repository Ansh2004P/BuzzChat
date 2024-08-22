/* eslint-disable react/no-unescaped-entities */

import { useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import AvatarSelector from "./userProfile/AvatarSelector";
import axios from "axios";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../utils/utils";
import UpdateName from "./userProfile/UpdateName";
import DeleteUser from "./userProfile/DeleteUser";
import Logout from "./Logout";
import { CrossButton } from "./userProfile/CrossButton";

const Modal = ({ onClose }) => {
  const currentUser = useSelector((state) => state.user.user);


  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarEmpty, setAvatarEmpty] = useState(false);

  const defaultImage =
    "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

  const handleAvatarChange = (file) => {
    setSelectedAvatar(file);
    setAvatarEmpty(false);
    // console.log(file);
    // console.log(selectedAvatar);
  };

  const handleDeleteAvatar = async () => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVER_URI}/user/delete-avatar`,
        {
          withCredentials: true,
        }
      );

      setSelectedAvatar(null);
      setAvatarEmpty(true);

      // console.log(response);
    } catch (error) {
      const errorMessage = extractErrorMessage(error.response.data);
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
  // console.log(selectedAvatar);

  const handleClose = () => {
    // Refresh the page
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-sm w-screen h-screen"></div>

      {/* Modal content */}
      <div
        className="bg-neutral-700 text-white w-fit h-fit p-6 rounded-md z-10 relative"
        // Add onClick event handler to stop propagation
        onClick={(e) => e.stopPropagation()}
      >
        <CrossButton onClick={handleClose} />
        <h2 className="text-2xl font-bold mb-4 font-serif">Profile</h2>
        <hr />
        <div className="w-fit flex justify-around space-y-2">
          <AvatarSelector
            photu={avatarEmpty ? defaultImage : currentUser.avatar}
            onAvatarChange={handleAvatarChange}
          />
          <span className="flex flex-col justify-evenly">
            Don't want an avatar?
            <button
              className="w-fit bg-red-600 rounded-xl px-10 py-2 mx-4 hover:bg-red-700"
              onClick={handleDeleteAvatar}
            >
              Delete it
            </button>
          </span>
        </div>
        <UpdateName />
        <hr className="my-4" />
        <DeleteUser />
        <hr />
        <Logout />
      </div>
    </div>
  );
};

Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default Modal;
