import React, { useState, useCallback, useEffect, useRef } from "react";
import VoiceCall from "./VoiceCall";
import VideoCall from "./VideoCall";
import ChatInfo from "./ChatInfo";
import ChatModal from "./ChatModal";
import { ArrowRightIcon, PaperClipIcon } from "@heroicons/react/24/solid";
import useChatScreen from "../../hooks/Chat/useChatScreen";
import Loading from "../../assets/images/Ellipsis@1x-1.8s-200px-200px";
import ScrollableChat from "./ScrollableChat";
import axios from "axios";
import { toast } from "react-toastify";
import Lottie from "react-lottie";
import PropTypes from "prop-types";
import useChatState from "../../hooks/useChatState";

import useLottieOptions from "../../hooks/useLottieOptions";

import io from "socket.io-client";
import useGetCurrentUser from "../../hooks/useGetCurrentUser";
import GroupChatModal from "./GroupChatmodal";

var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const currentUser = useGetCurrentUser();
  const { updateLastMessage, selectedChat, notification, setNotification } =
    useChatState();
  const {
    newMessage,
    istyping,
    setIsTyping,
    loading,
    setLoading,
    messages,
    setMessages,
    attachedFiles,
    setAttachedFiles,
    typing,
    setTyping,
  } = useChatScreen();

  // console.log(selectedChat);

  const [socketConnected, setSocketConnected] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const user = selectedChat?.isGroupChat
    ? selectedChat.users
    : selectedChat?.user;

  useEffect(() => {
    socket = io(`${import.meta.env.VITE_SOCKET_URI}`);
    socket.emit("setup", user[0]);
    socket.on("typing", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));
    socket.on("connected", () => setSocketConnected(true));

    socket.on("messageRecieved", (newMessage) => {
      // Update lastMessage in chat state
      updateLastMessage(
        selectedChat.isGroupChat ? selectedChat._id : selectedChat.chatId,
        newMessage
      );
      setMessages((prevMessages) => {
        return [newMessage, ...prevMessages];
      });
    });
  }, []);

  const defaultOptions = useLottieOptions();

  const handleShowProfile = () => setShowProfile(true);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        withCredentials: true,
      };

      setLoading(true);

      const { data } = await axios.get(
        ` ${import.meta.env.VITE_SERVER_URI}/message/${
          selectedChat.isGroupChat ? selectedChat._id : selectedChat.chatId
        }?chatId=${
          selectedChat.isGroupChat ? selectedChat._id : selectedChat.chatId
        }`,
        config
      );
      setMessages(data.data);
      setLoading(false);

      socket.emit(
        "joinChat",
        selectedChat.isGroupChat ? selectedChat._id : selectedChat.chatId
      );
    } catch (error) {
      toast.error("Failed to fetch messages", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = useCallback(
    async (e) => {
      if (
        (e.key === "Enter" && newMessage.current.value) ||
        e.type === "click"
      ) {
        socket.emit(
          "stopTyping",
          selectedChat.isGroupChat ? selectedChat._id : selectedChat.chatId
        );
        try {
          const config = { withCredentials: true };
          const formData = new FormData();
          formData.append("content", newMessage.current.value);

          attachedFiles?.forEach((file) => {
            formData.append("attachment", file);
          });

          const res = await axios.post(
            `${import.meta.env.VITE_SERVER_URI}/message/${
              selectedChat.isGroupChat ? selectedChat._id : selectedChat.chatId
            }?chatId=${
              selectedChat.isGroupChat ? selectedChat._id : selectedChat.chatId
            }`,
            formData,
            config
          );

          console.log("Message sent", res.data.data);
          socket.emit("messageRecieved", res.data.data);
          setMessages([res.data.data, ...messages]);
          updateLastMessage(
            selectedChat.isGroupChat ? selectedChat._id : selectedChat.chatId,
            res.data.data
          );

          // Clear the input field
          newMessage.current.value = "";

          // Reset typing state
          setTyping(false);
          socket.emit(
            "stopTyping",
            selectedChat.isGroupChat ? selectedChat._id : selectedChat.chatId
          );
        } catch (error) {
          console.log(error);
          toast.error("Failed to send message", {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
          });
        } finally {
          setLoading(false);
        }
      }
    },
    [
      attachedFiles,
      messages,
      selectedChat.isGroupChat ? selectedChat._id : selectedChat.chatId,
    ]
  );
  // console.log(currentUser)
  const typingHandler = () => {
    if (!socketConnected) return;

    const messageContent = newMessage.current.value;
    if (messageContent) {
      if (!typing) {
        setTyping(true);
        socket.emit(
          "typing",
          selectedChat.isGroupChat ? selectedChat._id : selectedChat.chatId
        );
      }
    } else if (typing) {
      setTyping(false);
      socket.emit(
        "stopTyping",
        selectedChat.isGroupChat ? selectedChat._id : selectedChat.chatId
      );
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  if (loading) {
    return (
      <div className="w-[60%]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="rounded-2xl mx-4 bg-neutral-800 w-[67%] h-[100%] flex flex-col">
      <div className="bg-emerald-700 w-full h-fit rounded-t-2xl flex justify-between">
        <span className="text-white font-semibold font-sans text-xl p-6 ml-8">
          {selectedChat.isGroupChat
            ? selectedChat.chatName
            : user?.[0]?._id === currentUser.user._id
            ? user?.[1]?.username || "Default"
            : user?.[0]?.username || "Default"}
        </span>
        <div className="flex w-fit space-x-2 mr-4 p-2">
          {/* <VoiceCall />
          <VideoCall
            userId={currentUser.user._id}
            remotePeerId={selectedChat._id}
          /> */}
          <div
            onClick={handleShowProfile}
            className="ml-10 px-2 cursor-pointer"
          >
            <ChatInfo
              avatar={
                selectedChat.isGroupChat
                  ? selectedChat.avatar
                  : user?.[0]?._id === currentUser.user._id
                  ? user[1]?.avatar
                  : user[0]?.avatar
              }
              wsize={"50px"}
              hsize={"50px"}
            />
          </div>
        </div>
        {showProfile &&
          (!selectedChat.isGroupChat ? (
            <ChatModal
              currUser={currentUser.user}
              onclose={() => setShowProfile(false)}
            />
          ) : (
            <GroupChatModal onClose={() => setShowProfile(false)} />
          ))}
      </div>

      <div className="bg-neutral-800 h-[78%] w-full p-4">
        {loading ? (
          <Loading />
        ) : (
          <div className="w-full h-full">
            <ScrollableChat
              messages={messages}
              id={currentUser.user._id}
              groupChat={selectedChat.isGroupChat}
            />
          </div>
        )}
      </div>
      {istyping && (
        <div className="flex w-1/4 justify-start my-3">
          <Lottie
            options={defaultOptions}
            height={50}
            width={100}
            className="mb-4"
          />
        </div>
      )}

      <div className="h-[8%] w-[100%] rounded-b-2xl bg-stone-700 flex pl-2">
        <input
          className="ml-3 px-3 w-[89%] h-full bg-stone-700 focus:outline-none placeholder:text-gray-500 text-white"
          placeholder="Type a message"
          ref={newMessage}
          type="text"
          onChange={typingHandler}
          onKeyDown={sendMessage}
        />
        <ArrowRightIcon
          onClick={sendMessage}
          className="h-8 w-8 text-white mx-3 my-auto cursor-pointer hover:bg-stone-600 rounded-full"
        />
      </div>
    </div>
  );
};

SingleChat.propTypes = {
  fetchAgain: PropTypes.bool,
  setFetchAgain: PropTypes.func,
};

export default SingleChat;
