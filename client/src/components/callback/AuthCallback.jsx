import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";

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
    <div className=" flex items-center justify-center h-screen w-screen">
      <h1 className="text-black items-center justify-center bg-gray-200 px-2 flex gap-2 py-2">
        <p className="flex-shrink-0"> Logging in with GitHub... </p>
        <Loader clr="black" />
      </h1>
    </div>
  );
}
