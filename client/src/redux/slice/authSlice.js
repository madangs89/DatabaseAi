import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthButtonClicked: false,
  isAuth: false,
  user: null,
  usageToken: 0,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setIsAuthButtonClickedTrue: (state) => {
      state.isAuthButtonClicked = true;
    },
    setIsAuthButtonClickedFalse: (state) => {
      state.isAuthButtonClicked = false;
    },
    setAuthTrue: (state, action) => {
      state.isAuth = true;
      state.user = action.payload.user;
    },
    setAuthFalse: (state) => {
      state.isAuth = false;
      state.user = null;
    },
    setUsageToken: (state, action) => {
      state.usageToken = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setIsAuthButtonClickedTrue,
  setIsAuthButtonClickedFalse,
  setAuthTrue,
  setAuthFalse,
  setUsageToken,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
