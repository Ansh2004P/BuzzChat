import { useRef, useState } from "react";
import { CrossButton } from "../userProfile/CrossButton";
import PropTypes from "prop-types";
import { useEffect } from "react";
import SearchBar from "../SearchBar";
import Participants from "./Participants";
import axios from "axios";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../../utils/utils";
import useChatState from "../../hooks/useChatState";
import { useDispatch } from "react-redux";
import { addChat } from "../../utils/redux/chatSlice";

const Modal = ({ onClose }) => {
  
  const groupName = useRef("");
  const [participants, setParticipants] = useState(new Map());

  const [searchResult, setSearchResult] = useState([]);
  const dispatch = useDispatch();
  // console.log(chats);
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleClose(); // Close modal on Escape key press
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose(); // Call the onClose callback function if provided
    }
  };

  const handleSubmit = async () => {
    const participantsArray = Array.from(participants.entries()).map(
      ([id, details]) => ({
        _id: id,
        avatar: details.avatar,
        username: details.username,
      })
    );
    // console.log(participantsArray);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URI}/chat/group`,
        {
          // The request body should be a JSON object with the correct fields
          groupName: groupName.current.value, // Make sure this field matches what backend expects
          participants: JSON.stringify(participantsArray), // Convert array to JSON string
        },
        {
          // Pass credentials in the headers
          withCredentials: true,
        }
      );

      dispatch(addChat(response.data?.data));

      toast.success(response.data.message, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } catch (error) {
      // console.log(error.response.data)
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
        <div className="relative w-full my-6">
          <input
            ref={groupName}
            type="text"
            autoFocus
            placeholder=" Group name (required)"
            className="bg-neutral-800 border border-gray-300 p-2 rounded-md w-full pr-10 mt-4 placeholder-white"
          />
          <SearchBar onSearchResult={setSearchResult} />
          <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-neutral-600" />

          <div className="h-fit w-full">
            {searchResult.length !== 0 ? (
              searchResult.map((chat) => {
                return (
                  <Participants
                    key={chat._id}
                    chat={chat}
                    participants={participants}
                    setParticipants={setParticipants}
                  />
                );
              })
            ) : (
              <span className="w-full text-neutral-500">
                Search users to add participants{" "}
              </span>
            )}
          </div>
          <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-neutral-600" />
          <button
            onClick={handleSubmit}
            className="w-[92%] h-fit p-3 my-2 mx-2 rounded-lg bg-emerald-600 hover:bg-emerald-700"
          >
            Create Group
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
