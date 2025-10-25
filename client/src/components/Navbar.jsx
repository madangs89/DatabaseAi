import React from "react";
import logo from "../assets/log.png";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setIsAuthButtonClickedTrue } from "../redux/slice/authSlice";

const Navbar = () => {
  const location = useLocation();
  const auth = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const handleLoginClick = () => {
    if (auth?.isAuthButtonClicked == false) {
      console.log("clicked");

      dispatch(setIsAuthButtonClickedTrue());
    }
  };

  if (location.pathname == "/") {
    return (
      <nav className="fixed top-0 text-white left-0 w-full z-50  ">
        {/* bg-black/30 backdrop-blur-md */}
        <div className="max-w-7xl mx-auto flex items-center px-3 py-2 justify-between md:px-6 md:py-3">
          {/* Logo */}
          <div className="flex items-center lg:gap-3 gap-1  cursor-pointer">
            <svg
              className="text-white"
              fill="none"
              height="24"
              viewBox="0 0 48 48"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
                fill="currentColor"
              ></path>
            </svg>
            <h1 className="text-lg font-bold text-white">SchemaGenius</h1>
          </div>

          <button
            onClick={handleLoginClick}
            className="px-6 py-1 rounded-md bg-white/40 hover:bg-white/60 backdrop-blur-sm border border-white/30"
          >
            Login
          </button>
        </div>
      </nav>
    );
  }
};

export default Navbar;
