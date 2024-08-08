import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import DropdownMenu from "./DropdownMenu";
import Modal from "../Modal";
import PropTypes from "prop-types";
import useLogoutHook from "../../hooks/useLogoutHook";

const menuItems = [
  { label: "Profile", href: "#", action: "profile" },
  { label: "Logout", href: "#" },
];

const UserAvatar = ({ avatar }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { handleSubmit, loading } = useLogoutHook();

  const handleMenuItemClick = (item) => {
    if (item.action === "profile") {
      setIsModalOpen(true);
    }
    if (item.label === "Logout") {
      handleSubmit();
    }
  };

  const renderMenuItem = (item) => (
    <a
      href={item.href}
      className={`text-white hover:bg-neutral-700 block px-4 py-2 ${
        item.label === "Logout" && "hover:bg-red-500"
      }`}
      onClick={(e) => {
        e.preventDefault();
        handleMenuItemClick(item);
      }}
    >
      {item.label}
    </a>
  );

  return (
    <div>
      <DropdownMenu menuItems={menuItems} renderItem={renderMenuItem}>
        <div className="w-fit flex mb-4">
          <div className="rounded-full w-[50px] h-[50px] bg-gray-800">
            <img
              src={avatar}
              alt="avatar"
              className="rounded-full w-full h-full object-cover"
            />
          </div>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="text-white text-sm p-4"
          />
        </div>
      </DropdownMenu>
      {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

UserAvatar.propTypes = {
  avatar: PropTypes.string,
};

export default UserAvatar;
