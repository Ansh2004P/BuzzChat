// ChatPage.js
import img1 from "../assets/images/logo.png";
import Loading from "../assets/images/Ellipsis@1x-1.8s-200px-200px";
import NotificationBell from "../components/NotificationBell";
import UserAvatar from "../components/userProfile/UserAvatar";
import MyChats from "../components/Chats/MyChats";
import useGetCurrentUser from "../hooks/useGetCurrentUser";

const ChatPage = () => {
  const { user } = useGetCurrentUser();

  if (!user) {
    return (
      <div className="w-screen h-screen bg-black bg-opacity-90 flex flex-col justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black bg-opacity-90 flex flex-col">
      <div className="flex w-full">
        <div className="flex justify-start w-[50%] mt-5">
          <img src={img1} alt="logo" className="w-14 h-14 ml-3" />
          <span className="text-white text-2xl p-3 font-serif font-semibold">
            BuzzChat
          </span>
        </div>
        <div className="w-[50%] flex justify-end py-3 mr-5">
          <NotificationBell />
          <UserAvatar avatar={user.avatar} />
        </div>
      </div>
      <div className="flex justify-between w-full h-[82%]">
        <MyChats />
        <div className="rounded-2xl w-[61%] h-[100%] flex flex-col justify-center"></div>
      </div>
    </div>
  );
};

export default ChatPage;
