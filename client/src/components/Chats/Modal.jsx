import { useRef, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { CrossButton } from "../userProfile/CrossButton";
import Participants from "./Participants";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../../utils/utils";

import useSearchUser from "../../hooks/useSearchUser";
import { setgroupSearchResult } from "../../utils/redux/groupSearchSlice";
import { useDispatch, useSelector } from "react-redux";
import { addChat } from "../../utils/redux/chatSlice";
import { useCreateGroupChat } from "../../hooks/queries/chatQueries";

const Modal = ({ onClose }) => {
  const chatName = useRef("");
  const dispatch = useDispatch();
  const [previewAvatar, setPreviewAvatar] = useState(null); // Use state for avatar preview
  const [avatar, setAvatar] = useState(null); // Use state for avatar
  const [participants, setParticipants] = useState(new Map());

  // TanStack Query mutation for creating group chat
  const createGroupChatMutation = useCreateGroupChat();

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose(); // Call the onClose callback function if provided
    }
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleClose(); // Close modal on Escape key press
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  const searchUser = useRef("");
  const prevValue = useRef("");
  const searchResult = useSelector(
    (state) => state.groupSearch.groupSearchResult
  );
  const { handleSearch } = useSearchUser({ searchUserRef: searchUser, cnt: 2 });

  const handleInputChange = (e) => {
    const currentValue = e.target.value;

    if (prevValue.current !== "" && currentValue === "") {
      setgroupSearchResult([]); // Reset to initial chat list
    }
    prevValue.current = currentValue;
  };

  const handleAvatarChange = (file) => {
    const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
    if (file && validImageTypes.includes(file.type)) {
      if (file.size <= 5 * 1024 * 1024) {
        // 5MB size limit
        setAvatar(file); // Save avatar to state
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewAvatar(reader.result); // Preview avatar
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("File size exceeds 5MB limit");
      }
    } else {
      toast.error(
        "Unsupported file type. Please upload JPEG, PNG, or GIF images."
      );
    }
  };

  const handleSubmit = async () => {
    if (!chatName.current.value.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (!avatar) {
      toast.error("Please select an avatar");
      return;
    }
    if (participants.size === 0) {
      toast.error("Please add at least one participant");
      return;
    }

    const participantsArray = Array.from(participants.entries()).map(
      ([id, details]) => ({
        _id: id,
        avatar: details.avatar,
        username: details.username,
      })
    );

    const formData = new FormData();
    formData.append("avatar", avatar);
    formData.append("chatName", chatName.current.value.trim());
    formData.append("participants", JSON.stringify(participantsArray));

    createGroupChatMutation.mutate(formData, {
      onSuccess: (response) => {
        // Add the new chat to Redux state for immediate UI update
        dispatch(addChat(response.data.data));
        handleClose();
      },
      onError: (error) => {
        const errorMessage = extractErrorMessage(error.response?.data || error);
        toast.error(errorMessage);
      },
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 h-screen w-screen">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-sm"></div>

      {/* Modal Content */}
      <div className="bg-neutral-700 text-white p-4 rounded-md relative w-[90vw] max-w-lg h-auto max-h-[90vh] overflow-y-auto">
        <CrossButton
          className="absolute top-4 right-4 p-2"
          onClick={handleClose}
        />
        <span className="block text-xl font-bold mb-4">Create Group</span>

        <div className="flex justify-center my-4">
          <label
            htmlFor="avatar-input"
            className="cursor-pointer relative w-28 h-28 rounded-full overflow-hidden border-4 border-gray-700"
          >
            {previewAvatar ? (
              <img
                src={previewAvatar}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-500 flex justify-center items-center">
                <img
                  src="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                  alt="Default avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleAvatarChange(e.target.files[0])}
            />
          </label>
        </div>

        <div className="relative w-full my-6">
          <input
            ref={chatName}
            type="text"
            autoFocus
            placeholder=" Group name (required)"
            className="bg-neutral-800 border border-gray-300 p-2 rounded-md w-full pr-10 mt-4 placeholder-white"
          />

          <input
            ref={searchUser}
            type="search"
            className="mt-4 w-full bg-neutral-600 border-neutral-500 rounded-lg border-2 p-1 text-white selection:border-white"
            placeholder="Search here"
            onKeyDown={handleSearch}
            onInput={handleInputChange}
          />

          <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-neutral-600" />

          <div className="h-fit w-full">
            {searchResult.length !== 0 ? (
              searchResult.map((chat) => (
                <Participants
                  key={chat._id}
                  chat={chat}
                  participants={participants}
                  setParticipants={setParticipants}
                />
              ))
            ) : (
              <span className="w-full text-neutral-500">
                Search users to add participants{" "}
              </span>
            )}
          </div>
          <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-neutral-600" />
          <button
            onClick={handleSubmit}
            disabled={createGroupChatMutation.isPending}
            className="w-[92%] h-fit p-3 my-2 mx-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createGroupChatMutation.isPending ? "Creating Group..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  onClose: PropTypes.func,
};

export default Modal;
