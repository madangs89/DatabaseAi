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
    setPageLoading: (state) => {
      state.pageLoading = true;
    },
    setButtonLoading: (state) => {
      state.buttonLoading = true;
    },
    setSmallButtonLoading: (state) => {
      state.smallButtonLoading = true;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setPageLoading, setButtonLoading, setSmallButtonLoading } =
  loadingSlice.actions;

export const loadingReducer = loadingSlice.reducer;
