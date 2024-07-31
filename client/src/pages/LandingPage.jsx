/* eslint-disable react/no-unescaped-entities */
import img1 from "../assets/images/landingCover.png";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full bg-stone-950 bg-opacity-95 absolute flex justify-center">
      <div className="p-4 my-7 w-[90%] h-[90%] bg-stone-800 bg-opacity-70 rounded-2xl flex flex-col justify-around">
        <span className="py-2 mx-5 text-5xl font-bold text-stone-400 text-pretty h-1/5">
          BuzzChat
        </span>
        <div className="flex justify-between w-full h-4/5">
          <div className="w-1/2 h-auto flex flex-col justify-center">
            <span className="text-2xl font-bold text-stone-200 text-pretty mx-6">
              Welcome to BuzzChat! A place where you can chat with friends and
              family
            </span>
            <span className="pt-12 text-xl text-stone-400 text-pretty mx-6">
              Start chatting today!
            </span>

            <button
              className="ml-4 my-5 w-fit bg-emerald-700 text-white text-pretty px-20 py-2 rounded-lg hover:scale-110 transition-all duration-300 cursor-pointer"
              onClick={() => {
                navigate("/signup");
              }}
            >
              Let's Begin
            </button>
          </div>
          <img src={img1} alt="someImage" className="h-auto w-auto mx-8" />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
