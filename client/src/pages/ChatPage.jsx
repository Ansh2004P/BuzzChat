// ChatPage.js
import img1 from "../assets/images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import UserAvatar from "../components/UserAvatar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setUser } from "../utils/redux/userSlice";
import Loading from "../assets/images/Ellipsis@1x-1.8s-200px-200px";
import NotificationBell from "../components/NotificationBell";

const ChatPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const userData = localStorage.getItem("userInfo");
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        // console.log(parsedUserData); // Check the parsed user data
        dispatch(setUser(parsedUserData.data));
      } catch (error) {
        console.error("Error parsing userData from localStorage:", error);
      }
    }
  }, [dispatch]); // Ensures useEffect runs only on mount

  // Conditional rendering to wait for user data
  if (!user) {
    return (
      <div className="w-screen h-screen bg-black bg-opacity-90 flex flex-col justify-center">
        <Loading />
      </div>
    );
  }
  // console.log(user);

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
        <div className="bg-neutral-800 rounded-2xl w-[30%] h-[100%] p-4 mx-4"></div>
        <div className="rounded-2xl w-[61%] h-[100%] flex flex-col justify-center"></div>
      </div>
    </div>
  );
};

export default ChatPage;
