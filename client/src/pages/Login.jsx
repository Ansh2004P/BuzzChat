/* eslint-disable react/no-unescaped-entities */
import { useContext, useRef, useState } from "react";
import { checkValidData } from "../utils/validate";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setUser } from "../utils/redux/userSlice";
import { extractErrorMessage } from "../utils/utils";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");

  const name = useRef(null);
  const email = useRef(null);
  const password = useRef(null);

  const [loading, setLoading] = useState(false);

  const handleButtonClick = async () => {
    setLoading(true);
    try {
      if (!name.current.value && !email.current.value) {
        setLoading(false);
        setErrorMessage("Both name and email cannot be empty");
        return;
      }

      const check = checkValidData(email.current.value, password.current.value);
      setErrorMessage(check);
      if (check) {
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("username", name.current.value);
      formData.append("email", email.current.value);
      formData.append("password", password.current.value);

      const config = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URI}/user/login`,
        formData,
        config
      );

      toast.success("Login successful", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));

      setLoading(false);

      const userInfo = data.data;
      // console.log( userInfo );
      dispatch(setUser(userInfo));

      navigate("/chats");
    } catch (error) {
      setLoading(false);
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
            onClick={handleButtonClick}
            disabled={loading}
            className="p-4 my-4 bg-emerald-700 text-white w-full rounded-lg cursor-pointer"
          >
            {loading ? "Loading..." : "Login"}
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
