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

var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const currentUser = useGetCurrentUser();

  const { selectedChat, notification, setNotification } = useChatState();
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

  const [socketConnected, setSocketConnected] = useState(false);

  const [showProfile, setShowProfile] = useState(false);
  // console.log("Chat", selectedChat);
  const user = selectedChat?.isGroupChat
    ? selectedChat.users
    : selectedChat?.user;

  // console.log("user", user[0]);
  // console.log(currentUser);
  useEffect(() => {
    socket = io(`${import.meta.env.VITE_SOCKET_URI}`);
    socket.emit("setup", user[0]);
    socket.on("typing", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));
    socket.on("connected", () => setSocketConnected(true));

    socket.on("messageRecieved", (newMessage) => {
      // Append the new message to the existing list of messages

      setMessages((prevMessages) => {
        // console.log("Previous messages:", prevMessages);
        return [newMessage, ...prevMessages];
      });
    });
  }, []);

  useEffect(() => {
    socket.on("messageRecieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

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
          selectedChat._id
        }?chatId=${selectedChat._id}`,
        config
      );
      setMessages(data.data);
      setLoading(false);

      socket.emit("joinChat", selectedChat._id);
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
        socket.emit("stopTyping", selectedChat._id);
        try {
          const config = { withCredentials: true };
          const formData = new FormData();
          formData.append("content", newMessage.current.value);

          attachedFiles?.forEach((file) => {
            formData.append("attachment", file);
          });

          const res = await axios.post(
            `${import.meta.env.VITE_SERVER_URI}/message/${
              selectedChat?._id
            }?chatId=${selectedChat?._id}`,
            formData,
            config
          );
          socket.emit("messageRecieved", res.data.data);
          setMessages([res.data.data, ...messages]);

          // Clear the input field
          newMessage.current.value = "";

          // Reset typing state
          setTyping(false);
          socket.emit("stopTyping", selectedChat._id);
        } catch (error) {
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
    [attachedFiles, messages, selectedChat?._id]
  );

  const typingHandler = () => {
    if (!socketConnected) return;

    const messageContent = newMessage.current.value;
    if (messageContent) {
      if (!typing) {
        setTyping(true);
        socket.emit("typing", selectedChat._id);
      }
    } else if (typing) {
      setTyping(false);
      socket.emit("stopTyping", selectedChat._id);
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

  // console.log("selectedChat", selectedChat);

  // console.log(user[0]._id === currentUser._id);
  // console.log("messages", messages);

  // if (!selectedChat.isGroupchat) {
  // }
  return (
    <div className="rounded-2xl mx-4 bg-neutral-800 w-[67%] h-[100%] flex flex-col">
      <div className="bg-emerald-700 w-full h-fit rounded-t-2xl flex justify-between">
        <span className="text-white font-semibold font-sans text-2xl p-6 ml-8">
          {selectedChat.isGroupChat
            ? selectedChat.chatName
            : user?.[0]?._id === currentUser.user._id
            ? user?.[1]?.username || "Default"
            : user?.[0]?.username || "Default"}
        </span>
        <div className="flex w-fit space-x-2 mr-4 p-2">
          <VoiceCall />
          <VideoCall />
          <div onClick={handleShowProfile}>
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
        {showProfile && (
          <ChatModal
            currUser={currentUser.user}
            onclose={() => setShowProfile(false)}
          />
        )}
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
        <button className="ml-4 hover:bg-stone-600 rounded-full w-10 h-10 items-center mt-1">
          <PaperClipIcon className="h-5 w-5 text-white m-2 " />
        </button>
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
