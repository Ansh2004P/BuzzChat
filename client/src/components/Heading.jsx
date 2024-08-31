import React from "react";
import img1 from "../assets/images/logo.png";
import NotificationBell from "../components/NotificationBell";
import UserAvatar from "../components/userProfile/UserAvatar";
import PropTypes from "prop-types";

const Heading = ({ user }) => {
  return (
    <div className="flex w-full">
      <div className="flex justify-start w-[50%] mt-5">
        <img src={img1} alt="logo" className="w-14 h-14 ml-3" />
        <span className="text-white text-2xl p-3 font-serif font-semibold">
          BuzzChat
        </span>
      </div>
      <div className="w-[50%] flex justify-end py-3 mr-5">
        <UserAvatar avatar={user.avatar} />
      </div>
    </div>
  );
};

Heading.propTypes = {
  user: PropTypes.object.isRequired,
};

export default Heading;
