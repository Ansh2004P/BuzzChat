import React from "react";
import PropTypes from "prop-types";

const ChatInfo = ({ avatar, wsize, hsize }) => {
  return (
    <div
      className={`rounded-fullbg-gray-800 mt-2 ${
        wsize !== "" && hsize !== ""
          ? `w-[${wsize}] h-[${hsize}]`
          : "w-[40px] h-[40px]"
      } `}
    >
      <img
        src={avatar}
        alt="avatar"
        className="rounded-full w-full h-full object-cover"
      />
      
    </div>
    
  );
};

ChatInfo.propTypes = {
  avatar: PropTypes.string,
  wsize: PropTypes.string,
  hsize: PropTypes.string,
};

export default ChatInfo;
