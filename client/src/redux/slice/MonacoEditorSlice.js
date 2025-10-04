import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tree: {},
  expandedFiles: new Set(["root"]),
  hoverId: "",
  selectedFile: null,
  selectedFileHistory: [],
  loadingState: 1,
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
      const newSet = new Set(state.expandedFiles);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      state.expandedFiles = newSet;
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
        state.selectedFileHistory = [...state.selectedFileHistory, node];
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
