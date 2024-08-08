import { setUser } from "../../../utils/redux/userSlice";
import axios from "axios";
import { toast } from "react-toastify";
import { checkValidData } from "../../../utils/validate";
import { extractErrorMessage } from "../../../utils/utils";

const useLoginFunctionHook = ({
  navigate,
  name,
  email,
  password,
  errorMessage,
  setErrorMessage,
  loading,
  setLoading,
  dispatch,
}) => {
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
  return { handleButtonClick };
};

export default useLoginFunctionHook;
