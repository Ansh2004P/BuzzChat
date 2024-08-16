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
  setLoading,
}) => {
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

      if (!avatar.current)
        return toast.error("Please select avatar", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
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
      // console.log(data);
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
      // console.log(error);
      const errorMessage = extractErrorMessage(error.response.data);
      toast.error(errorMessage, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });
    }
  };

  const handleAvatarChange = (file) => {
    if (file) {
      avatar.current = file;
      const reader = new FileReader();
      reader.onload = () => {
        previewAvatar.current = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return { handleButtonClick, handleAvatarChange };
};

export default useSignupFunctionHook;
