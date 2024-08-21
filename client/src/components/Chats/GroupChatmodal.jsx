import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { toast } from "react-toastify";
import { PencilIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { CrossButton } from "../userProfile/CrossButton";
import { formatTimestamp } from "../../utils/utils";
import Scrollbars from "react-custom-scrollbars";
import { UserItem, withAdminLabel } from "./UserItem";
import { useSelector } from "react-redux";
import useSearchUser from "../../hooks/useSearchUser";

// Wrap UserItem with withAdminLabel
const UserItemWithAdmin = withAdminLabel(UserItem);

const GroupChatModal = ({ onClose, chat }) => {
  const [zoom, setZoom] = useState(false);
  const [avatar, setAvatar] = useState(chat.avatar);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(chat.chatName);
  const [tempName, setTempName] = useState(name);
  const [users, setUsers] = useState(chat.users);
  const [searchOn, setSearchOn] = useState(false);
  const searchUser = useRef("");
  const currentUser = useSelector((state) => state.user.user);
  const isAdmin = chat.admin.includes(currentUser._id);
  // console.log(chat);

  // Get search user hook
  const { handleSearch, searchResult, setSearchResult } =
    useSearchUser(searchUser);

  // Filter out already existing users from search results
  const filteredSearchResults = searchResult.filter(
    (user) => !users.some((groupUser) => groupUser._id === user._id)
  );

  const handleEditClick = () => setIsEditing(true);

  const sortedUsers = [...users].sort((a, b) => {
    const isAAdmin = chat.admin.includes(a._id);
    const isBAdmin = chat.admin.includes(b._id);
    return isBAdmin - isAAdmin; // Admins first
  });

  const handleSubmit = async () => {
    if (tempName.trim() === "") {
      toast.error("Chat name cannot be empty", {
        position: "bottom-center",
        autoClose: 5000,
      });
      return;
    }
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_URI}/chat/rename`,
        { chatName: tempName, chatId: chat._id },
        { withCredentials: true }
      );

      toast.success(response.data.message, {
        position: "bottom-center",
        autoClose: 5000,
      });

      setName(tempName);
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error occurred";
      toast.error(errorMessage, {
        position: "bottom-center",
        autoClose: 5000,
      });
    }
  };

  const handleInputChange = (event) => setTempName(event.target.value);

  const handleBlur = () => {
    setIsEditing(false);
    setTempName(name); // Reset tempName if editing is cancelled
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const handleClose = () => onClose && onClose();

  const handleZoom = () => setZoom(!zoom);

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("chatId", chat._id);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_URI}/chat/update-avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setAvatar(response.data.avatarUrl);
      toast.success(response.data.message, {
        position: "bottom-center",
        autoClose: 5000,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error occurred";
      toast.error(errorMessage, {
        position: "bottom-center",
        autoClose: 5000,
      });
    }
  };

  const handleRemoveUser = async (userId, chatId) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_SERVER_URI}/chat/groupRemove`,
        { userId, chatId },
        { withCredentials: true }
      );

      toast.success(data.message, {
        position: "bottom-center",
        autoClose: 5000,
      });

      // Update the users state to reflect the removed user
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error occurred";
      toast.error(errorMessage, {
        position: "bottom-center",
        autoClose: 5000,
      });
    }
  };

  const handleAddUser = async (userId, chatId) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_SERVER_URI}/chat/groupAdd`,
        { userId, chatId },
        { withCredentials: true }
      );

      toast.success(data.message, {
        position: "bottom-center",
        autoClose: 5000,
      });
      console.log(data);
      // Update the users state to reflect the added user
      setUsers((prevUsers) => [
        ...prevUsers,
        searchResult.find((user) => user._id === userId),
      ]);
    } catch (error) {
      // const errorMessage = error.response?.data?.message || "Error occurred";
      toast.error(error.toString(), {
        position: "bottom-center",
        autoClose: 5000,
      });
    }
  };

  const handleLeaveGroup = async (chatId) => {
    console.log(chatId);
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_SERVER_URI}/chat/leaveGroup`,
        { chatId },
        { withCredentials: true }
      );
      console.log(data);

      toast.success(data.message, {
        position: "bottom-center",
        autoClose: 5000,
      });

      onClose();
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message || "Error occurred";
      toast.error(errorMessage, {
        position: "bottom-center",
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Zoomed Avatar View */}
      {zoom && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={handleZoom}
        >
          <img
            src={avatar}
            alt="avatar"
            className="rounded-full w-[70vw] h-[70vh] object-cover"
          />
        </div>
      )}

      {/* Modal */}
      <div className="bg-neutral-700 text-white p-4 rounded-md relative w-fit min-w-[550px] max-w-2xl h-auto max-h-[100vh] overflow-y-auto">
        <CrossButton
          className="absolute top-4 right-4 p-2"
          onClick={handleClose}
        />
        <div className="w-full h-fit">
          <div className="flex justify-around items-center">
            <div className="relative mx-4 w-[30%]">
              <img
                src={avatar}
                alt="avatar"
                className="rounded-full w-[140px] h-[140px] object-cover cursor-pointer"
                onClick={handleZoom}
              />
              <label className="absolute bottom-1 right-1 cursor-pointer bg-stone-800 p-1 rounded-full hover:bg-stone-700">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <PencilIcon className="w-6 h-6 text-white" />
              </label>
            </div>

            <div className="ml-6 w-[50%] flex flex-col">
              {!isEditing ? (
                <div className="flex items-center">
                  <span className="text-lg font-semibold">{name}</span>
                  <button
                    onClick={handleEditClick}
                    className="ml-4 p-1 text-white hover:bg-neutral-800"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={tempName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="bg-neutral-800 border border-gray-300 p-2 rounded-md w-full pr-10"
                />
              )}
              <span className="text-gray-400 font-mono text-xs mt-2">
                Created At: {formatTimestamp(chat.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {isAdmin &&
          (!searchOn ? (
            <div className="w-full h-fit p-2 mt-2">
              <button
                onClick={() => setSearchOn(true)}
                className="bg-green-600 text-white p-2 rounded-md w-full"
              >
                Add Participants
              </button>
            </div>
          ) : (
            <>
              <div className="relative mt-2">
                <input
                  ref={searchUser}
                  type="search"
                  className="mt-4 w-full bg-neutral-600 border-neutral-500 rounded-lg border-2 p-1 text-white selection:border-white"
                  placeholder="Search here"
                  onKeyDown={handleSearch}
                  onInput={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => setSearchOn(false)}
                  className="absolute top-1/2 mt-2 right-2 transform -translate-y-1/2"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="mt-4">
                {filteredSearchResults.length > 0 ? (
                  filteredSearchResults.map((user) => (
                    <UserItemWithAdmin
                      key={user._id}
                      user={user}
                      chat={chat}
                      onRemoveUser={() => handleAddUser(user._id, chat._id)}
                      dropdownContent={"Add to group"}
                    />
                  ))
                ) : (
                  <p className="text-gray-500">No search results found.</p>
                )}
              </div>
            </>
          ))}

        {!searchOn && (
          <div className="flex flex-col mt-4">
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
                <UserItemWithAdmin
                  key={user._id}
                  user={user}
                  chat={chat}
                  onRemoveUser={() => handleRemoveUser(user._id, chat._id)}
                  dropdownContent={"Remove from group"}
                />
              ))
            ) : (
              <p className="text-gray-500">No users in the group.</p>
            )}
            <hr className="h-px mt-2 bg-stone-200 border-0 dark:bg-stone-600" />
            <button
              className="w-full bg-red-700 my-2 rounded-xl h-fit p-2"
              onClick={() => handleLeaveGroup(chat._id)}
            >
              Leave Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

GroupChatModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  chat: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    chatName: PropTypes.string.isRequired,
    users: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        avatar: PropTypes.string.isRequired,
      })
    ).isRequired,
    admin: PropTypes.arrayOf(PropTypes.string).isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default GroupChatModal;
