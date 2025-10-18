import React from "react";
import { useEffect, useState } from "react";

import axios from "axios";
import { useDispatch } from "react-redux";
import {
  setAuthTrue,
  setIsAuthButtonClickedFalse,
} from "../redux/slice/authSlice";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const navigate = useNavigate();

  const googleHandler = async (res) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/auth/google-auth`,
        {
          code: res.code,
        },
        { withCredentials: true }
      );
      console.log(response);

      if (response.data.success) {
        console.log(response);
        dispatch(setAuthTrue(response.data));
        let redirectUrl = localStorage.getItem("redirectUrlForNotLogin");
        redirectUrl = JSON.parse(redirectUrl);
        if (redirectUrl) {
          localStorage.removeItem("redirectUrlForNotLogin");
          toast.success("Redirecting Please Wait!!");
          console.log(redirectUrl);
          setTimeout(() => {
            navigate(redirectUrl);
          }, 1000);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const dispatch = useDispatch();
  const handleLogin = useGoogleLogin({
    onSuccess: googleHandler,
    onError: googleHandler,
    flow: "auth-code",
  });

  const handleCloseModal = () => {
    dispatch(setIsAuthButtonClickedFalse());
  };

  // Login screen
  return (
    <div className="flex z-[50000] items-center  backdrop-blur-sm relative justify-center">
      <button
        onClick={handleCloseModal}
        className="absolute top-2 cursor-pointer right-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-white cursor-pointer"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={4}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <div className="bg-inherit p-10 rounded-2xl shadow-xl shadow-gray-100 flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold dm-sans-font text-white leading-tight">
          Login with Google
        </h1>
        <button
          onClick={handleLogin}
          className="flex items-center gap-3 px-6 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo"
            className="w-6 h-6"
          />
          <span className="text-gray-700 font-medium">
            Continue with Google
          </span>
        </button>
      </div>
    </div>
  );
};

export default Login;
