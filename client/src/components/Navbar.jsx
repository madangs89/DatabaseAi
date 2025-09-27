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
      <nav className="fixed top-0 text-white left-0 w-full z-50 border-b border-[#d4d4d4] ">
        {/* bg-black/30 backdrop-blur-md */}
        <div className="max-w-7xl mx-auto flex items-center pr-1 py-1 justify-between md:px-6 md:py-3">
          {/* Logo */}
          <img src={logo} alt="" className="w-32 h-12  object-cover" />
          {/* Links */}
          <div className=" space-x-6 lg:flex hidden dm-sans-font">
            <Link
              to="/"
              className="bg-gradient-to-r dm-sans-font from-white via-gray-400 to-gray-300 bg-clip-text text-transparent"
            >
              Home
            </Link>
            <Link
              to="/features"
              className="text-[rgb(255, 255, 255)] dm-sans-font"
            >
              Features
            </Link>
            <Link to="/pricing" className="text-[#e5e5e5] dm-sans-font">
              Pricing
            </Link>
            <Link to="/dashboard" className="text-[#e5e5e5] dm-sans-font">
              dashboard
            </Link>
            <Link to="/project" className="text-[#e5e5e5] dm-sans-font">
              project
            </Link>
          </div>
          {/* Button */}
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
