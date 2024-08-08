import React from "react";

const Heading = () => {
  return (
    <span className="flex justify-between w-full p-2">
      <h1 className="font-serif font-semibold text-3xl ml-2 mt-1">Chats</h1>
      <button
        className="p-2 mr-4 mt-1 bg-emerald-700 hover:bg-emerald-800 rounded-xl"
        onClick={() => {}}
      >
        Create Group
      </button>
    </span>
  );
};

export default Heading;
