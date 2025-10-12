import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chatScroll: 0,
};

export const scrollSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setChatScroll: (state, action) => {
      state.chatScroll = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setChatScroll } = scrollSlice.actions;

export const scrollReducer = scrollSlice.reducer;
