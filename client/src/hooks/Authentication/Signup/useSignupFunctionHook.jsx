import { toast } from "react-toastify";
import { Bounce } from "react-toastify";
import { checkValidData } from "../../../utils/validate";
import { extractErrorMessage } from "../../../utils/utils";
import axios from "axios";

const useSignupFunctionHook = ({
  navigate,
  name,
  email,
  password,
  setErrorMessage,
  avatar,
  previewAvatar,
  setPreviewAvatar, // receive the state setter
  setLoading,
}) => {
  const handleButtonClick = async () => {
    setLoading(true);
    setErrorMessage(null); // Clear previous errors
    
    try {
      // Validate name
      if (!name.current.value.trim()) {
        setErrorMessage("Name is required");
        setLoading(false);
        return;
      }
      
      if (name.current.value.trim().length < 2) {
        setErrorMessage("Name must be at least 2 characters long");
        setLoading(false);
        return;
      }

      // Validate email
      if (!email.current.value.trim()) {
        setErrorMessage("Email is required");
        setLoading(false);
        return;
      }

      // Validate password
      if (!password.current.value) {
        setErrorMessage("Password is required");
        setLoading(false);
        return;
      }

      const check = checkValidData(email.current.value, password.current.value);
      if (check) {
        setErrorMessage(check);
        setLoading(false);
        return;
      }

      // Validate avatar
      if (!avatar.current) {
        setErrorMessage("Please select an avatar image");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("username", name.current.value);
      formData.append("email", email.current.value);
      formData.append("password", password.current.value);
      if (avatar) {
        formData.append("avatar", avatar.current);
      }

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_URI}/user/register`,
        formData,
        config
      );
      
      toast.success(data.message || "Account created successfully!", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
        transition: Bounce,
      });

      setLoading(false);
      navigate("/login");
    } catch (error) {
      setLoading(false);
      console.error("Signup error:", error);
      
      let errorMessage = "Something went wrong. Please try again.";
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorMessage(errorMessage);
    }
  };

  const handleAvatarChange = (file) => {
    if (file) {
      avatar.current = file;
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewAvatar(reader.result); // now this will update the state correctly
      };
      reader.readAsDataURL(file);
    }
  };

  return { handleButtonClick, handleAvatarChange };
};

export default useSignupFunctionHook;
