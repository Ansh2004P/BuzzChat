import { useRef, useState } from "react";
import { checkValidData } from "../utils/validate";
import { useNavigate } from "react-router-dom";
import { Bounce, toast } from "react-toastify";
import axios from "axios";
import Loader from "../components/Loader";
import { extractErrorMessage } from "../utils/utils";

const Signup = () => {
  const navigate = useNavigate();

  const name = useRef(null);
  const email = useRef(null);
  const password = useRef(null);

  const [errorMessage, setErrorMessage] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleButtonClick = async () => {
    setLoading(true);
    try {
      if (!name.current.value || !email.current.value) {
        setErrorMessage("Both name and email cannot be empty");
        setLoading(false);
        return;
      }

      const check = checkValidData(email.current.value, password.current.value);
      setErrorMessage(check);
      if (check) {
        setLoading(false);
        return;
      }

      if (!avatar)
        return toast.error("Please select avatar", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });

      const formData = new FormData();
      formData.append("username", name.current.value);
      formData.append("email", email.current.value);
      formData.append("password", password.current.value);
      if (avatar) {
        formData.append("avatar", avatar);
      }

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URI}/user/register`,
        formData,
        config
      );
      console.log(data);
      toast({
        title: data.message,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      setLoading(false);
      navigate("/login");
    } catch (error) {
      setLoading(false);
      console.log(error);
      const errorMessage = extractErrorMessage(error.response.data);
      toast.error(errorMessage, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }
  };

  const handleAvatarChange = (file) => {
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    // <Loader />
    // ) : (
    <div className="w-full h-full bg-stone-950 bg-opacity-95 absolute flex justify-center items-center text-white">
      <div className="p-4 my-10 w-[40%] h-fit bg-stone-800 bg-opacity-70 rounded-2xl flex flex-col justify-evenly backdrop-blur-lg shadow-lg shadow-black">
        <h1 className="text-3xl font-sans font-bold text-center">Sign-Up</h1>
        <div className="flex justify-center my-4 ">
          <label
            htmlFor="avatar-input"
            className="cursor-pointer relative w-28 h-28 rounded-full overflow-hidden border-4 border-gray-700"
          >
            {previewAvatar ? (
              <img
                src={previewAvatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-500 flex justify-center items-center">
                <img
                  src="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                  alt="default image"
                />
              </div>
            )}
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleAvatarChange(e.target.files[0])}
            />
          </label>
        </div>

        <form onClick={(e) => e.preventDefault()}>
          <input
            ref={name}
            type="text"
            placeholder="Enter your name"
            className="p-4 my-4 w-full bg-gray-700 bg-opacity-50 rounded-sm placeholder-white shadow-sm shadow-slate-600 cursor-text"
          />
          <input
            ref={email}
            type="text"
            placeholder="Enter your email"
            className="p-4 my-4 w-full bg-gray-700 bg-opacity-50 rounded-sm placeholder-white shadow-sm shadow-slate-600 cursor-text"
          />
          <input
            required={true}
            ref={password}
            type="password"
            placeholder="Enter your Password"
            className="p-4 my-4 w-full bg-gray-700 bg-opacity-50 rounded-sm placeholder-white shadow-sm shadow-slate-600 cursor-text"
          />
          <p className="text-red-500 font-bold text-lg py-2">{errorMessage}</p>
          <button
            onClick={handleButtonClick}
            disabled={loading}
            className="p-4 my-4 bg-emerald-700 text-white w-full rounded-lg cursor-pointer"
          >
            {loading ? "Loading..." : "Sign-Up"}
          </button>
        </form>
        <div className="flex">
          <span>Have account already? </span>
          <span
            className="mx-1 text-blue-600 underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            log-in
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
