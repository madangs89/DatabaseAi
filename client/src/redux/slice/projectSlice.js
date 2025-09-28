import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  projects: [],
  isError: null,
  isButtonLoading: false,
};

export const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    addNewProject: (state, action) => {
      console.log(action.payload);
      state.projects = [action.payload, ...state.projects];
    },
    setIsError: (state, action) => {
      state.isError = action.payload;
    },
    setIsButtonLoading: (state, action) => {
      state.isButtonLoading = action.payload;
    },
    removeProject: (state, action) => {
      state.projects = state.projects.filter(
        (project) => project._id !== action.payload
      );
    },

    projectEditHandler: (state, action) => {
      state.projects = state.projects.map((project) =>
        project._id === action.payload._id
          ? { ...project, ...action.payload }
          : project
      );
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setIsButtonLoading,
  setIsError,
  setProjects,
  setIsLoading,
  addNewProject,
  removeProject,
  projectEditHandler,
} = projectSlice.actions;

export const projectReducer = projectSlice.reducer;
