import React, { useState, useCallback } from "react";
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
import useSocket from "../../hooks/Socket/useSocket";
import useMessages from "../../hooks/Messages/useMessages";
import useLottieOptions from "../../hooks/useLottieOptions";

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
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
  } = useChatScreen();
  const [showProfile, setShowProfile] = useState(false);
  const user = selectedChat?.user;

  const { socket, socketConnected } = useSocket(
    user,
    selectedChat,
    setMessages,
    setFetchAgain,
    setNotification,
    setIsTyping
  );

  useMessages(selectedChat, setMessages, setLoading);

  const defaultOptions = useLottieOptions();

  const handleShowProfile = () => setShowProfile(true);

  const sendMessage = useCallback(
    async (e) => {
      if (
        (e.key === "Enter" && newMessage.current.value) ||
        e.type === "click"
      ) {
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

          setMessages([res.data.data, ...messages]);
          newMessage.current.value = "";

          if (istyping) {
            setIsTyping(false);
            socket.current.emit("stopTyping", selectedChat._id);
          }
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
    [attachedFiles, messages, selectedChat?._id, istyping]
  );

  const typingHandler = useCallback(() => {
    if (!socketConnected) return;

    const messageContent = newMessage.current.value;

    if (messageContent) {
      if (!istyping) {
        setIsTyping(true);
        socket.current.emit("typing", selectedChat._id);
      }
    } else if (istyping) {
      setIsTyping(false);
      socket.current.emit("stopTyping", selectedChat._id);
    }
  }, [socketConnected, istyping, selectedChat?._id]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="rounded-2xl mx-4 bg-neutral-800 w-[67%] h-[100%] flex flex-col">
      <div className="bg-emerald-700 w-full h-fit rounded-t-2xl flex justify-between">
        <span className="text-white font-semibold font-sans text-2xl p-6 ml-8">
          {user ? user[0].username : "Default"}
        </span>
        <div className="flex w-fit space-x-2 mr-4 p-2">
          <VoiceCall />
          <VideoCall />
          <div onClick={handleShowProfile}>
            <ChatInfo avatar={user[0].avatar} wsize={"50px"} hsize={"50px"} />
          </div>
        </div>
        {showProfile && <ChatModal onclose={() => setShowProfile(false)} />}
      </div>

      <div className="bg-neutral-800 h-[78%] w-full p-4">
        {loading ? (
          <Loading />
        ) : (
          <div className="w-full h-full">
            <ScrollableChat messages={messages} id={selectedChat._id} />
          </div>
        )}
      </div>
      {istyping && (
        <div>
          <Lottie
            options={defaultOptions}
            height={50}
            width={100}
            style={{ marginBottom: 15, marginLeft: 10 }}
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
