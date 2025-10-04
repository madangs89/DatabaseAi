import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tree: [],
  expandedFiles: ["root"],
  hoverId: "",
  selectedFile: null,
  selectedFileHistory: [],
  loadingState: 0,
};

export const monacoSlice = createSlice({
  name: "monaco",
  initialState,
  reducers: {
    setTree: (state, action) => {
      state.tree = action.payload;
    },
    toggleExpandable: (state, action) => {
      const id = action.payload;
      const set = new Set(state.expandedFiles);

      if (set.has(id)) set.delete(id);
      else set.add(id);

      // Convert back to array to ensure immutability and proper re-render
      state.expandedFiles = Array.from(set);
    },
    setHoverId: (state, action) => {
      state.hoverId = action.payload;
    },
    openFile: (state, action) => {
      const node = action.payload;
      state.selectedFile = {
        id: node.id,
        name: node.name,
        type: node.type,
        content: node.content,
      };
      const exists = state.selectedFileHistory.some((n) => n.id === node.id);

      if (!exists) {
        const sorted = [...state.selectedFileHistory, node].sort((a, b) => {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        });
        state.selectedFileHistory = sorted;
      }
    },
    closeFile: (state, action) => {
      const node = action.payload;
      const prev = state.selectedFileHistory;
      const newHistory = prev.filter((n) => n.id !== node.id);

      let nextFile = null;
      if (newHistory.length > 0) {
        const closedIndex = prev.findIndex((n) => n.id === node.id);
        const nextIndex =
          closedIndex < newHistory.length ? closedIndex : newHistory.length - 1;
        nextFile = newHistory[nextIndex];
      }

      state.selectedFile = nextFile || null;
      state.selectedFileHistory = newHistory;
    },
    setLoadingState: (state, action) => {
      state.loadingState = action.payload;
    },
  },
});

export const {
  setTree,
  toggleExpandable,
  setHoverId,
  openFile,
  closeFile,
  setLoadingState,
} = monacoSlice.actions;

export const monacoReducer = monacoSlice.reducer;
