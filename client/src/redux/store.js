import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./slice/authSlice";
import { loadingReducer } from "./slice/loadingSlice";
import { projectReducer } from "./slice/projectSlice";
import { monacoReducer } from "./slice/MonacoEditorSlice";
import { scrollReducer } from "./slice/scrollSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    loading: loadingReducer,
    monaco: monacoReducer,
    scrollS: scrollReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
