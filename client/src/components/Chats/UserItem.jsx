// UserItem.jsx
import PropTypes from "prop-types";
import { useState } from "react";
import { useSelector } from "react-redux";

export const UserItem = ({ user, isAdmin, onRemoveUser, dropdownContent }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  const handleRightClick = (event) => {
    event.preventDefault();
    setDropdownPosition({ x: event.pageX / 4, y: 30 });
    setShowDropdown(true);
  };

  const handleRemoveUser = () => {
    if (onRemoveUser) {
      onRemoveUser(user);
    }
    setShowDropdown(false); // Close the dropdown after removing the user
  };

  const handleClickOutside = () => {
    setShowDropdown(false); // Close the dropdown if clicked outside
  };

  return (
    <div className="relative">
      <div
        className="flex items-center justify-between my-2 py-2 px-1 bg-neutral-600 rounded-xl hover:bg-neutral-800"
        onContextMenu={handleRightClick}
      >
        <div className="flex items-center">
          <img
            src={user.avatar}
            alt="avatar"
            className="w-11 ml-2 h-11 rounded-full object-cover border-2 border-white"
          />
          <span className="ml-5 mb-1">{user.username}</span>
        </div>
        {isAdmin && (
          <span className="text-stone-400 text-sm font-normal mr-4">Admin</span>
        )}
      </div>

      {showDropdown && (
        <div
          className="absolute bg-neutral-500  shadow-lg rounded-md z-10 py-1 text-sm text-black border-neutral-600 border-2"
          style={{ top: dropdownPosition.y, left: dropdownPosition.x }}
          onMouseLeave={handleClickOutside} // Optional: close dropdown when the mouse leaves
        >
          <button
            onClick={handleRemoveUser}
            className="block w-full px-4 py-2 text-left text-white bg-neutral-500 hover:bg-neutral-400"
          >
            {dropdownContent}
          </button>
        </div>
      )}
    </div>
  );
};

UserItem.propTypes = {
  user: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onRemoveUser: PropTypes.func,
  dropdownContent: PropTypes.string,
};
// withAdminLabel.js

export const withAdminLabel = (Component) => {
  const WithAdminLabel = ({ user, chat, ...props }) => {
    WithAdminLabel.propTypes = {
      user: PropTypes.object.isRequired,
      chat: PropTypes.object.isRequired,
    };
    const isAdmin = chat.admin.some((adminId) => adminId === user._id);
    return <Component {...props} user={user} isAdmin={isAdmin} />;
  };

  WithAdminLabel.displayName = `WithAdminLabel(${
    Component.displayName || Component.name || "Component"
  })`;

  return WithAdminLabel;
};
