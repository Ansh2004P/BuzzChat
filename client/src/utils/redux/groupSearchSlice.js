import { createSlice } from "@reduxjs/toolkit";

const GroupSearchSlice = createSlice({
  name: "groupSearch",
  initialState: {
    searchResult: [],
    participants: [],
  },
  reducers: {
    setSearchResult: (state, action) => {
      state.searchResult = action.payload;
    },
    clearSearchResult: (state) => {
      state.searchResult = [];
    },
    setParticipants: (state, action) => {
      state.participants = action.payload;
      // console.log("Participants set:", action.payload); // Debug log
    },
    addParticipant: (state, action) => {
      // console.log("Current participants:", state.participants); // Debug log
      // console.log("Adding participant:", action.payload); // Debug log

      // Check if the participant is already in the array to avoid duplicates
      const participantExists = state.participants.some(
        (participant) => participant._id === action.payload._id
      );

      if (!participantExists) {
        state.participants.push(action.payload);
        // console.log("Participant added:", action.payload); // Debug log
      } else {
        // console.log("Participant already exists:", action.payload); // Debug log
      }
    },
    removeParticipant: (state, action) => {
      state.participants = state.participants.filter(
        (participant) => participant._id !== action.payload
      );
    },
  },
});

export const {
  setSearchResult,
  clearSearchResult,
  removeParticipant,
  addParticipant,
  setParticipants,
} = GroupSearchSlice.actions;

export default GroupSearchSlice.reducer;
