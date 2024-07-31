/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LocalStorage, requestHandler } from "../utils/utils";
import { loginUser, logoutUser, registerUser } from "../utils/api";
import Loader from "../components/Loader";
import { Bounce, toast } from "react-toastify";

const AuthContext = createContext({
  user: null,
  token: null,
  login: async ({ data }) => {},
  register: async ({ data }) => {},
  logout: async () => {},
});

// Create a hook to access the AuthContext
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const navigate = useNavigate();

  // Login function
  const login = async ({ data }) => {
    await requestHandler(
      async () => await loginUser(data),
      setIsLoading,
      (res) => {
        const { data } = res;
        setUser(data.user);
        setToken(data.accessToken);
        LocalStorage.set("user", data.user);
        LocalStorage.set("token", data.accessToken);
        navigate("/chat");
      },
      alert
    );
  };

  // Register function
  const register = async (data) => {
    await requestHandler(
      async () => await registerUser(data),
      setIsLoading,
      async () => {
        navigate("/login");
        alert("Registration successful. Please login to continue.");
      },
      alert
    );
  };

  // Logout function
  const logout = async () => {
    await requestHandler(
      async () => await logoutUser(),
      setIsLoading,
      () => {
        setUser(null);
        setToken(null);
        LocalStorage.clear();
        navigate("/login");
      },
      alert
    );
  };

  useEffect(() => {
    setIsLoading(true);
    const _token = LocalStorage.get("token");
    const _user = LocalStorage.get("user");
    if (_token && _user?._id) {
      setUser(_user);
      setToken(_token);
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, token }}>
      {isLoading ? <Loader /> : children} {/* Display a loader while loading */}
    </AuthContext.Provider>
  );
};

export { AuthProvider, useAuth, AuthContext };
