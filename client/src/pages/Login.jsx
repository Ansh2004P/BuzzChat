/* eslint-disable react/no-unescaped-entities */
import { useRef, useState } from "react";
import { checkValidData } from "../utils/validate";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const name = useRef(null);
  const email = useRef(null);
  const password = useRef(null);

  const [errorMessage, setErrorMessage] = useState(null);

  const handleButtonClick = () => {
    if (!name.current.value && !email.current.value) {
      setErrorMessage("Both name and email cannot be empty");
      return;
    }

    const check = checkValidData(email.current.value, password.current.value);
    setErrorMessage(check);
    if (check) return;
  };

  return (
    <div className="w-full h-full bg-stone-950 bg-opacity-95 absolute flex justify-center text-white">
      <div className="p-4 my-10 w-[40%] h-fit bg-stone-800 bg-opacity-70 rounded-2xl flex flex-col justify-evenly backdrop-blur-lg shadow-lg shadow-black">
        <h1 className="text-3xl font-sans font-bold mx-[40%]">Login</h1>
        <form className="mt-6" onClick={(e) => e.preventDefault()}>
          <input
            ref={name}
            type="text"
            placeholder="Enter your name"
            className="p-4 my-4 w-full bg-gray-700 opacity-50 rounded-sm placeholder-white shadow-sm shadow-slate-600 cursor-text"
          />
          <input
            ref={email}
            type="text"
            placeholder="Enter your email"
            className="p-4 my-4 w-full bg-gray-700 opacity-50 rounded-sm placeholder-white shadow-sm shadow-slate-600 cursor-text"
          />
          <input
            required={true}
            ref={password}
            type="password"
            placeholder="Enter your Password"
            className="p-4 my-4 w-full bg-gray-700 opacity-50 rounded-sm placeholder-white shadow-sm shadow-slate-600 cursor-text"
          />
          <p className="text-red-500 font-bold text-lg py-2">{errorMessage}</p>
          <button
            className="p-4 my-2 bg-emerald-700 text-white w-full rounded-lg cursor-pointer"
            onClick={handleButtonClick}
          >
            Login
          </button>
        </form>
        <div className="flex">
          <span>Don't have account? </span>
          <span
            className="mx-1 text-blue-600 underline cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            create a account
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
