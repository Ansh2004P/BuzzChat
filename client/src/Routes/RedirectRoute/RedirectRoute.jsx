import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

const RedirectIfAuthenticated = ({ children }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  return userInfo ? <Navigate to="/chats" /> : children;
};

RedirectIfAuthenticated.propTypes = {
  children: PropTypes.element.isRequired,
};

export default RedirectIfAuthenticated;
