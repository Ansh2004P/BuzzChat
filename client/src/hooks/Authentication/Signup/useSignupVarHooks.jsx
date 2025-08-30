import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const useSignupVarHooks = () => {
  const navigate = useNavigate();
  const name = useRef(null);
  const email = useRef(null);
  const password = useRef(null);
  const avatar = useRef(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to clear error when user starts typing
  const clearError = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  return {
    navigate,
    name,
    email,
    password,
    errorMessage,
    setErrorMessage,
    avatar,
    previewAvatar,
    setPreviewAvatar, // make sure to return this
    loading,
    setLoading,
    clearError,
  };
};

export default useSignupVarHooks;
