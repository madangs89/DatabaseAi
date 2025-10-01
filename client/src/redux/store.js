import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./slice/authSlice";
import { loadingReducer } from "./slice/loadingSlice";
import { projectReducer } from "./slice/projectSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    loading: loadingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ["project.socket"], // ignore socket in state
        ignoredActions: ["project/setSocket"], // ignore setSocket action
      },
    }),
});
