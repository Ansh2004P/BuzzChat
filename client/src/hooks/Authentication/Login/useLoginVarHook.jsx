import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const useLoginVarHook = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");

  const name = useRef(null);
  const email = useRef(null);
  const password = useRef(null);

  const [loading, setLoading] = useState(false);

  return {
    navigate,
    name,
    email,
    password,
    errorMessage,
    setErrorMessage,
    loading,
    setLoading,
    dispatch
  };
};

export default useLoginVarHook;
