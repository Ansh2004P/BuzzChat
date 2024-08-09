import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";

const Participants = React.memo(function Participants({
  chat,
  participants,
  setParticipants,
}) {
  const [lastClick, setLastClick] = useState(0);

  const handleCheckboxChange = useCallback(
    (e) => {
      const currentTime = Date.now();
      if (currentTime - lastClick < 50) return; // 50 ms = 0.05 seconds

      setLastClick(currentTime);

      const chatId = chat._id;
      setParticipants((prevParticipants) => {
        const newParticipants = new Map(prevParticipants);
        if (e.target.checked) {
          newParticipants.set(chatId, {
            username: chat.username,
            avatar: chat.avatar,
          });
        } else {
          newParticipants.delete(chatId);
        }
        return newParticipants;
      });
    },
    [chat._id, chat.username, chat.avatar, lastClick, setParticipants] // Dependencies for useCallback
  );

  return (
    <div
      className={`my-2 flex justify-between items-center p-2 rounded-lg w-full ${
        participants.has(chat._id) ? "bg-neutral-800" : "bg-neutral-600"
      }`}
      onClick={handleCheckboxChange}
    >
      <div className="flex items-center">
        <input
          type="checkbox"
          id={`checkbox-${chat._id}`}
          checked={participants.has(chat._id)}
          onChange={handleCheckboxChange}
          className="mr-8 w-6 h-6 accent-green-500"
        />
        <label
          htmlFor={`checkbox-${chat._id}`}
          className="flex items-center cursor-pointer p-2 rounded-lg"
        >
          <img
            src={chat.avatar}
            alt="avatar"
            className="w-12 h-12 rounded-full object-cover border-2 border-white"
          />
          <span className="ml-10 font-semibold text-lg">{chat.username}</span>
        </label>
      </div>
    </div>
  );
});

Participants.propTypes = {
  chat: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }).isRequired,
  participants: PropTypes.instanceOf(Map).isRequired,
  setParticipants: PropTypes.func.isRequired,
};

export default Participants;
