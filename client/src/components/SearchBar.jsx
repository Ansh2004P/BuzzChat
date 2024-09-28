import React, { useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import useSearchUser from "../hooks/useSearchUser";
import { useDispatch, useSelector } from "react-redux";
import { setSearchResult } from "../utils/redux/chatSlice"; // Import Redux action

const SearchBar = React.memo(function SearchBar({
  onSearchResult,
  initialResult,
}) {
  const searchUser = useRef("");
  const dispatch = useDispatch();
  const searchResult = useSelector((state) => state.chat.searchResult);
  // console.log("searchResult", searchResult);
  const { handleSearch } = useSearchUser({ searchUserRef: searchUser, cnt: 1 });

  // Memoize handleInputChange to prevent re-creation
  const handleInputChange = useCallback(
    (e) => {
      const currentValue = e.target.value;

      if (currentValue === "") {
        if (initialResult.length > 0) {
          dispatch(setSearchResult(initialResult)); // Reset to initial chat list in Redux
        }
      }
    },
    [dispatch, initialResult]
  );

  // Update search results when `searchResult` changes
  useEffect(() => {
    onSearchResult(searchResult);
  }, [searchResult, onSearchResult]);
  // console.log("searchResult1", searchResult);
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
});

SearchBar.propTypes = {
  onSearchResult: PropTypes.func.isRequired,
  initialResult: PropTypes.array.isRequired, // Expect initialResult as an array
};

export default SearchBar;
