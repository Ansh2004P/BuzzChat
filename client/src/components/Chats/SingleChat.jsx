import React, { useEffect } from "react";
import useChatState from "../../hooks/useChatState";
import VoiceCall from "./VoiceCall";
import VideoCall from "./VideoCall";
import ChatInfo from "./ChatInfo";
import ChatModal from "./ChatModal";
import { ArrowRightIcon, PaperClipIcon } from "@heroicons/react/24/solid";
import useChatScreen from "../../hooks/Chat/useChatScreen";
import Lottie from "react-lottie";
import Loading from "../../assets/images/Ellipsis@1x-1.8s-200px-200px";
import ScrollableChat from "./ScrollableChat";
import axios from "axios";

const SingleChat = () => {
  const { selectedChat } = useChatState();
  const {
    newMessage,
    istyping,
    setIsTyping,
    loading,
    setLoading,
    messages,
    setMessage,
    defaultOptions,
    attachedFiles,
    setAttachedFiles,
  } = useChatScreen();
  const [showProfile, setShowProfile] = React.useState(false);
  // console.log(selectedChat);

  useEffect(() => {
    // console.log(selectedChat);
    // if (!selectedChat) {
    //   setLoading(true);
    //   return;
    // } else {
    //   setLoading(false);
    //   return;
    // }
  }, [selectedChat]);
  const user = selectedChat.user;
  // console.log(user[0].username);
  // console.log(user[0].avatar);

  // console.log(newMessage);
  const handleShowProfile = () => {
    setShowProfile(true);
  };

  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      // console.log("hi");
      try {
        const config = {
          withCredentials: true,
        };

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

        // console.log(res);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const typingHandler = () => {};

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="rounded-2xl mx-4 bg-neutral-800 w-[67%] h-[100%] flex flex-col">
      <div className="bg-emerald-700 w-full h-fit rounded-t-2xl  flex justify-between">
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
          <div className="messages">
            <ScrollableChat messages={messages} />
          </div>
        )}
      </div>
      {istyping ? (
        <div>
          <Lottie
            options={defaultOptions}
            height={50}
            width={70}
            style={{ marginBottom: 15, marginLeft: 0 }}
          />
        </div>
      ) : (
        <></>
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
        <button
          className="w-[7%] h-11 bg-emerald-700 rounded-br-2xl hover:bg-emerald-600"
          onClick={sendMessage}
        >
          <ArrowRightIcon className="w-6 h-6 text-white mx-6" />
        </button>
      </div>
    </div>
  );
};

export default SingleChat;
