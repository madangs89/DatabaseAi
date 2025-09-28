import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pageLoading: false,
  buttonLoading: false,
  smallButtonLoading: false,
};

export const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setPageLoading: (state, action) => {
      state.pageLoading = action.payload;
    },
    setButtonLoading: (state, action) => {
      state.buttonLoading = action.payload;
    },
    setSmallButtonLoading: (state, action) => {
      state.smallButtonLoading = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setPageLoading, setButtonLoading, setSmallButtonLoading } =
  loadingSlice.actions;

export const loadingReducer = loadingSlice.reducer;
