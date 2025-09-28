import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./redux/store.js";

import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            success: {
              style: {
                background: "#1c1c1c",
                color: "white",
              },
            },
            error: {
              style: {
                background: "#1c1c1c",
                color: "red",
              },
            },
          }}
        />
        <ToastContainer position="top-right" autoClose={3000} />
      </GoogleOAuthProvider>
    </Provider>
  </BrowserRouter>
);
