import { setUser } from "../../../utils/redux/userSlice";
import axios from "axios";
import { toast } from "react-toastify";
import { checkValidData } from "../../../utils/validate";
import { extractErrorMessage, VITE_SERVER_URI } from "../../../utils/utils";

const useLoginFunctionHook = ({
  navigate,
  name,
  email,
  password,
  setErrorMessage,
  setLoading,
  dispatch,
}) => {
  const handleButtonClick = async () => {
    setLoading(true);

    try {
      // Validate form data
      if (!name.current.value && !email.current.value) {
        setErrorMessage("Both name and email cannot be empty");
        return;
      }

      const validationError = checkValidData(email.current.value, password.current.value);
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }

      // Prepare request data
      const userData = {
        username: name.current.value,
        email: email.current.value,
        password: password.current.value,
      };

      // Send request
      const config = {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      };

      const { data } = await axios.post(
        `${VITE_SERVER_URI}/user/login`,
        userData,
        config
      );

      // Handle successful response
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

      // Store user info and navigate
      localStorage.setItem("userInfo", JSON.stringify(data));
      dispatch(setUser(data.data));
      navigate("/chats");

    } catch (error) {
      // Handle error response
      const errorMessage = extractErrorMessage(error.response?.data || {});
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  return { handleButtonClick };
};

export default useLoginFunctionHook;
