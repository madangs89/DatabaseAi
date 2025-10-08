import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tree: [],
  expandedFiles: ["root"],
  hoverId: "",
  selectedFile: null,
  selectedFileHistory: [],
  loadingState: 0,
  errorText: null,
  nodes: [],
  edges: [],
  dbConvKey: null,
  changesToCode: false,
};

export const monacoSlice = createSlice({
  name: "monaco",
  initialState,
  reducers: {
    setAllToBegin: (state) => {
      state.tree = [];
      state.expandedFiles = ["root"];
      state.hoverId = "";
      state.selectedFile = null;
      state.selectedFileHistory = [];
      state.loadingState = 0;
      (state.nodes = []), (state.edges = []), (state.dbConvKey = null);
      (state.errorText = null), (state.changesToCode = false);
    },
    setChangeToCode: (state, action) => {
      state.changesToCode = action.payload;
    },
    setSliceNodes: (state, action) => {
      state.nodes = action.payload.nodes;
      state.edges = action.payload.edges;
    },
    setTree: (state, action) => {
      state.tree = action.payload;
    },
    setDbConvKey: (state, action) => {
      state.dbConvKey = action.payload;
    },
    setErrorText: (state, action) => {
      state.errorText = action.payload;
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
    handleUpdateFileMonacoSlice: (state, action) => {
      const { selectedFile, content } = action.payload;
      const updateHandler = (stateNodes, selectedFile, content) => {
        for (let nodes of stateNodes) {
          if (nodes.id === selectedFile.id && nodes.type === "file") {
            nodes.content = content;
            return true;
          } else if (nodes.type === "folder" && nodes.children) {
            if (updateHandler(nodes.children, selectedFile, content)) {
              return true;
            }
          }
        }
        return false;
      };

      if (state.tree.length > 0 && state.tree[0]?.children) {
        updateHandler(state.tree[0].children, selectedFile, content);
        state.changesToCode = true;
      }
    },
  },
});

export const {
  setTree,
  toggleExpandable,
  setHoverId,
  setSliceNodes,
  openFile,
  closeFile,
  setLoadingState,
  setAllToBegin,
  setErrorText,
  setDbConvKey,
  handleUpdateFileMonacoSlice,
  setChangeToCode,
} = monacoSlice.actions;

export const monacoReducer = monacoSlice.reducer;
