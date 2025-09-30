import { createSlice } from "@reduxjs/toolkit";
import Dashboard from "../../pages/Dashboard";

const initialState = {
  pageLoading: false,
  buttonLoading: false,
  smallButtonLoading: false,
  dashboardPageLoading: false,
  chatLoading: false,
  entityLoading: false,
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
    setDashboardPageLoading: (state, action) => {
      state.dashboardPageLoading = action.payload;
    },
    setChatLoading: (state, action) => {
      state.chatLoading = action.payload;
    },
    setEntityLoading: (state, action) => {
      state.entityLoading = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setPageLoading,
  setButtonLoading,
  setSmallButtonLoading,
  setDashboardPageLoading,
  setChatLoading,
  setEntityLoading,
} = loadingSlice.actions;

export const loadingReducer = loadingSlice.reducer;
