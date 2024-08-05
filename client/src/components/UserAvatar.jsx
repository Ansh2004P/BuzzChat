import React from "react";
import DropdownMenu from "./DropdownMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const menuItems = [
  { label: "Profile", href: "#" },
  { label: "Logout", href: "#" },
];

// eslint-disable-next-line react/prop-types
const UserAvatar = ({ avatar }) => {
  const renderMenuItem = (item) => (
    <a
      href={item.href}
      className="text-white hover:bg-neutral-700 block px-4 py-2"
    >
      {item.label}
    </a>
  );

  return (
    <DropdownMenu menuItems={menuItems} renderItem={renderMenuItem}>
      <div className="w-fit flex mb-4">
        <div className="rounded-full w-[52px] h-[52px] bg-gray-800">
          {avatar && (
            <img
              src={avatar}
              alt="avatar"
              className="rounded-full w-[52px] h-[52px]"
            />
          )}
        </div>
        <FontAwesomeIcon
          icon={faChevronDown}
          className="text-white text-sm p-4"
        />
      </div>
    </DropdownMenu>
  );
};

export default UserAvatar;
