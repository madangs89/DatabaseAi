import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./slice/authSlice";
import { loadingReducer } from "./slice/loadingSlice";
import { projectReducer } from "./slice/projectSlice";
import { monacoReducer } from "./slice/MonacoEditorSlice";
import { scrollReducer } from "./slice/scrollSlice";
import { repoReducer } from "./slice/repoSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    loading: loadingReducer,
    monaco: monacoReducer,
    scrollS: scrollReducer,
    repo:repoReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
