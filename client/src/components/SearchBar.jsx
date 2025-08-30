import React, { useRef, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { useSearchUsers } from "../hooks/queries/chatQueries";
import { debounce } from "../utils/utils";

const SearchBar = React.memo(function SearchBar({
  onSearchResult,
  initialResult,
  onSearchStateChange,
}) {
  const searchRef = useRef("");
  const searchUsersMutation = useSearchUsers();

  // Function to filter existing chats locally
  const filterLocalChats = useCallback((query, chats) => {
    if (!query.trim()) return chats;
    
    return chats.filter(chat => 
      chat.username?.toLowerCase().includes(query.toLowerCase()) ||
      chat.chatName?.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  // Debounced search function for both local filtering and remote user search
  const debouncedSearch = useMemo(
    () => debounce(async (query) => {
      const trimmedQuery = query.trim();
      
      if (!trimmedQuery) {
        // Reset to initial results when query is empty
        if (onSearchStateChange) {
          onSearchStateChange(false);
        }
        if (onSearchResult) {
          onSearchResult(initialResult);
        }
        return;
      }

      if (onSearchStateChange) {
        onSearchStateChange(true);
      }
      
      // First, filter existing chats locally
      const filteredChats = filterLocalChats(trimmedQuery, initialResult);
      
      try {
        // Then search for new users from the server
        const response = await searchUsersMutation.mutateAsync(trimmedQuery);
        const searchResults = response.data || [];
        
        // Convert search results to chat format
        const formattedResults = searchResults.map(user => ({
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          isGroupChat: false,
          lastMessage: [],
          isSearchResult: true, // Mark as search result
        }));
        
        // Combine filtered existing chats with new search results
        // Remove duplicates by comparing user IDs
        const existingUserIds = filteredChats.map(chat => chat._id);
        const newUsers = formattedResults.filter(user => 
          !existingUserIds.includes(user._id)
        );
        
        const combinedResults = [...filteredChats, ...newUsers];
        if (onSearchResult) {
          onSearchResult(combinedResults);
        }
        
      } catch (error) {
        console.error("Search failed:", error);
        // On error, just show filtered local chats
        if (onSearchResult) {
          onSearchResult(filteredChats);
        }
      }
    }, 300),
    [searchUsersMutation, initialResult, filterLocalChats, onSearchResult, onSearchStateChange]
  );

  const handleSearch = useCallback(
    async (e) => {
      if (e.key === "Enter") {
        const query = searchRef.current.value.trim();
        await debouncedSearch(query);
      }
    },
    [debouncedSearch]
  );

  const handleInputChange = useCallback(
    (e) => {
      const currentValue = e.target.value;
      
      if (currentValue === "") {
        // Reset to initial results when input is cleared
        if (onSearchStateChange) {
          onSearchStateChange(false);
        }
        if (onSearchResult) {
          onSearchResult(initialResult);
        }
      } else {
        // Trigger debounced search for real-time results
        debouncedSearch(currentValue);
      }
    },
    [onSearchResult, onSearchStateChange, initialResult, debouncedSearch]
  );

  return (
    <div className="relative">
      <input
        ref={searchRef}
        type="search"
        className="mt-4 w-full bg-neutral-600 border-neutral-500 rounded-lg border-2 p-1 text-white selection:border-white placeholder:text-gray-400"
        placeholder="Search chats or users..."
        onKeyDown={handleSearch}
        onInput={handleInputChange}
        disabled={searchUsersMutation.isLoading}
      />
      {searchUsersMutation.isLoading && (
        <div className="absolute right-2 top-6">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
});

SearchBar.propTypes = {
  onSearchResult: PropTypes.func.isRequired,
  initialResult: PropTypes.array.isRequired,
  onSearchStateChange: PropTypes.func,
};

export default SearchBar;
