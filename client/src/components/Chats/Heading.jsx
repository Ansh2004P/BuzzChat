import { useState } from "react";
import Modal from "./Modal";

const Heading = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  return (
    <span className="flex justify-between w-full p-2">
      <h1 className="font-serif font-semibold text-3xl ml-2 mt-1">Chats</h1>
      <button
        className="p-2 mr-4 mt-1 bg-emerald-700 hover:bg-emerald-800 rounded-xl"
        onClick={handleButtonClick}
      >
        Create Group
      </button>
      {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
    </span>
  );
};

export default Heading;
