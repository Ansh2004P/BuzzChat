import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const useSignupVarHooks = () => {
  const navigate = useNavigate();

  const name = useRef(null);
  const email = useRef(null);
  const password = useRef(null);
  const avatar = useRef(null);
  const previewAvatar = useRef(null);
  const [errorMessage, setErrorMessage] = useState(null);

 
  const [loading, setLoading] = useState(false);

  return {
    navigate,
    name,
    email,
    password,
    errorMessage,
    setErrorMessage,
    avatar,
    previewAvatar,
    loading,
    setLoading,
  };
};

export default useSignupVarHooks;
