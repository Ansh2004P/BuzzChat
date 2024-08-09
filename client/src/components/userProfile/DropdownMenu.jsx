import { useState } from "react";
import PropTypes from "prop-types";

const DropdownMenu = ({ children, menuItems, renderItem }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="relative">
      <button
        className={`flex w-fit h-[66px] p-2 rounded-full ${
          dropdownOpen ? "bg-neutral-800" : "bg-transparent"
        }`}
        onClick={toggleDropdown}
      >
        {children}
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-2 z-10">
          {menuItems.map((item, index) => (
            <div key={index} className="block px-4 py-2">
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

DropdownMenu.propTypes = {
  children: PropTypes.node.isRequired,
  menuItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  renderItem: PropTypes.func.isRequired,
};

export default DropdownMenu;
