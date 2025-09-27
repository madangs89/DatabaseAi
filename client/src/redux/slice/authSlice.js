import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthButtonClicked: false,
  isAuth: false,
  user: null,
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
  },
});

// Action creators are generated for each case reducer function
export const {
  setIsAuthButtonClickedTrue,
  setIsAuthButtonClickedFalse,
  setAuthTrue,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
