import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { PencilIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { CrossButton } from "../userProfile/CrossButton";
import { formatTimestamp } from "../../utils/utils";
import Scrollbars from "react-custom-scrollbars-2";
import { UserItem, withAdminLabel } from "./UserItem";
import { useDispatch, useSelector } from "react-redux";
import {
  addParticipant,
  clearSearchResult,
  setParticipants,
  removeParticipant,
} from "../../utils/redux/groupSearchSlice";
import useChatState from "../../hooks/useChatState";
import { 
  removeChat, 
  removeChatParticipant,
  addChatParticipant,
  updateChatName,
  updateChatAvatar,
} from "../../utils/redux/chatSlice";
import useGroupAddParticipant from "../../hooks/Chat/useGroupAddParticipant";
import {
  useRemoveParticipant,
  useAddParticipant,
  useLeaveGroup,
  useRenameGroup,
  useUpdateGroupAvatar,
} from "../../hooks/queries/chatQueries";

// Wrap UserItem with withAdminLabel
const UserItemWithAdmin = withAdminLabel(UserItem);

const GroupChatModal = ({ onClose }) => {
  const chat = useSelector((state) => state.chat.selectedChat);
  const [zoom, setZoom] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(chat?.chatName || "");
  const [searchOn, setSearchOn] = useState(false);
  const searchUser = useRef("");
  const currentUser = useSelector((state) => state.user.user);
  const isAdmin = chat?.admin && currentUser?._id ? 
    chat.admin.some(admin => admin._id === currentUser._id) : false;
  const { setSelectedChat } = useChatState();
  const dispatch = useDispatch();

  // Get participants from Redux state (selectedChat)
  const users = chat?.participants || chat?.users || [];

  // TanStack Query mutations
  const removeParticipantMutation = useRemoveParticipant();
  const addParticipantMutation = useAddParticipant();
  const leaveGroupMutation = useLeaveGroup();
  const renameGroupMutation = useRenameGroup();
  const updateAvatarMutation = useUpdateGroupAvatar();

  // console.log(chat);

  const searchResult = useSelector(
    (state) => state.groupSearch.groupSearchResult
  );
  const participants = useSelector((state) => state.groupSearch.participants);

  // Get search user hook
  const { handleSearch } = useGroupAddParticipant(searchUser);
  // console.log("List", chat);
  // Filter out already existing users from search results
  const temp = searchResult.filter(
    (user) => !users.some((groupUser) => groupUser._id === user._id)
  );
  const filteredSearchResults = temp.filter(
    (user) =>
      !user.isGroupChat &&
      !users.some((groupUser) => groupUser._id === user._id)
  );

  useEffect(() => {
    const chatUsers = chat?.participants || chat?.users || [];
    dispatch(setParticipants([...chatUsers]));
    // Update tempName when chat changes
    setTempName(chat?.chatName || "");
  }, [chat, dispatch]);

  const handleEditClick = () => setIsEditing(true);

  const sortedUsers = [...participants].sort((a, b) => {
    const isAAdmin = chat?.admin ? chat.admin.some(admin => admin._id === a._id) : false;
    const isBAdmin = chat?.admin ? chat.admin.some(admin => admin._id === b._id) : false;
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

    renameGroupMutation.mutate(
      { chatId: chat._id, chatName: tempName },
      {
        onSuccess: () => {
          dispatch(updateChatName({ chatId: chat._id, chatName: tempName }));
          setIsEditing(false);
        },
      }
    );
  };

  const handleInputChange = (event) => setTempName(event.target.value);

  const handleBlur = () => {
    setIsEditing(false);
    setTempName(chat?.chatName || ""); // Reset tempName if editing is cancelled
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

    updateAvatarMutation.mutate(
      { chatId: chat._id, formData },
      {
        onSuccess: (response) => {
          dispatch(updateChatAvatar({ chatId: chat._id, avatar: response.data.avatarUrl }));
        },
      }
    );
  };

  const handleRemoveUser = (userId, chatId) => {
    removeParticipantMutation.mutate(
      { userId, chatId },
      {
        onSuccess: () => {
          // Update Redux state - remove the user
          dispatch(removeChatParticipant({ chatId, userId }));
          dispatch(removeParticipant(userId));
        },
      }
    );
  };

  const handleAddUser = (userId, chatId) => {
    addParticipantMutation.mutate(
      { userId, chatId },
      {
        onSuccess: () => {
          // Find the newly added user from search results
          const addedUser = searchResult.find((user) => user._id === userId);
          
          // Update Redux state
          dispatch(addChatParticipant({ chatId, user: addedUser }));
          dispatch(addParticipant(addedUser));
        },
      }
    );
  };

  const handleLeaveGroup = (chatId) => {
    leaveGroupMutation.mutate(
      chatId,
      {
        onSuccess: () => {
          dispatch(removeChat(chat._id));
          setSelectedChat(null);
          onClose();
        },
      }
    );
  };

  // Early return if chat is not loaded or required properties are missing
  if (!chat || (!chat.participants && !chat.users)) {
    return null;
  }

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
            src={chat?.avatar}
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
                src={chat?.avatar}
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
                  <span className="text-lg font-semibold">{chat?.chatName}</span>
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
                  onClick={() => {
                    setSearchOn(false);
                    dispatch(clearSearchResult());
                  }}
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
            {isAdmin && (
              <p className="text-gray-400 text-xs mb-2 text-center">
                Right-click on members to remove them (admins cannot be removed)
              </p>
            )}
            <Scrollbars
              autoHide
              autoHideTimeout={1000}
              autoHideDuration={200}
              style={{ height: "300px" }}
            >
              {sortedUsers.length > 0 ? (
                sortedUsers.map((user) => {
                  const canRemoveUser = isAdmin && 
                    user._id !== currentUser._id && // Cannot remove self
                    (!chat?.admin || !chat.admin.some(admin => admin._id === user._id)); // Cannot remove other admins
                  
                  console.log(`User: ${user.username}, canRemoveUser: ${canRemoveUser}, isAdmin: ${isAdmin}, isSelf: ${user._id === currentUser._id}, isUserAdmin: ${chat?.admin ? chat.admin.some(admin => admin._id === user._id) : false}`);
                  
                  return (
                    <UserItemWithAdmin
                      key={user._id}
                      user={user}
                      chat={chat}
                      onRemoveUser={canRemoveUser ? () => handleRemoveUser(user._id, chat._id) : null}
                      dropdownContent={canRemoveUser ? "Remove from group" : null}
                    />
                  );
                })
              ) : (
                <p className="text-gray-500">No users in the group.</p>
              )}
            </Scrollbars>

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
};

export default GroupChatModal;
