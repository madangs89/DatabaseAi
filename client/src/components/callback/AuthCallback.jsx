import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    console.log(code);
    if (code) {
      (async () => {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/git-auth`,
          {
            code,
          },
          {
            withCredentials: true,
          }
        );
      })();
    }
  }, [navigate]);

  return <div>Logging in with GitHub...</div>;
}
