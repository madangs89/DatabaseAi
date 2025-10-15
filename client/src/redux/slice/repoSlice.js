import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isGitAuth: false,
  gitAvatarUrl: null,
  gitName: null,
  currentRepo: null,
  currentRepoName: null,
  currentRepoUrl: null,
};

export const repoSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setGitAuth: (state, action) => {
      state.isGitAuth = true;
      state.gitAvatarUrl = action.payload.gitAvatarUrl;
      state.gitName = action.payload.gitName;
    },
    setGitLogout: (state) => {
      state.isGitAuth = false;
      state.gitAvatarUrl = null;
      state.gitName = null;
      state.currentRepo = null;
      state.currentRepoUrl = null;
      state.currentRepoName = null;
    },
    setCurrentRepoDetails: (state, action) => {
      state.currentRepo = action.payload.projectId;
      state.currentRepoUrl = action.payload.repoUrl;
      state.currentRepoName = action.payload.repoName;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setGitAuth, setGitLogout, setCurrentRepoDetails } =
  repoSlice.actions;

export const repoReducer = repoSlice.reducer;
