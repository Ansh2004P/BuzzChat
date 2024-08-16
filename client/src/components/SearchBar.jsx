import { useEffect, useRef } from "react";
import useSearchUser from "../hooks/useSearchUser";
import PropTypes from "prop-types";

const SearchBar = ({ onSearchResult, initialResult }) => {
  const searchUser = useRef("");
  const prevValue = useRef("");

  const { handleSearch, searchResult, setSearchResult } =
    useSearchUser(searchUser);

  const handleInputChange = (e) => {
    const currentValue = e.target.value;

    if (prevValue.current !== "" && currentValue === "") {
      setSearchResult(initialResult); // Reset to initial chat list
    }
    prevValue.current = currentValue;
  };

  useEffect(() => {
    onSearchResult(searchResult);
  }, [searchResult, onSearchResult]);

  return (
    <input
      ref={searchUser}
      type="search"
      className="mt-4 w-full bg-neutral-600 border-neutral-500 rounded-lg border-2 p-1 text-white selection:border-white"
      placeholder="Search here"
      onKeyDown={handleSearch}
      onInput={handleInputChange}
    />
  );
};

SearchBar.propTypes = {
  onSearchResult: PropTypes.func.isRequired,
  initialResult: PropTypes.array.isRequired, // Expect initialResult as an array
};

export default SearchBar;
