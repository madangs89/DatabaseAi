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

  return (
    <div>
      <h1 className="text-black bg-white px-2 py-2">
        Logging in with GitHub...
      </h1>
    </div>
  );
}
