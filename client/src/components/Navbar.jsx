import React from "react";
import logo from "../assets/log.png";
import { useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  if (location.pathname.includes("/dashboard")) return null;
  return (
    <nav className="fixed top-0 text-white left-0 w-full z-50 border-b border-[#d4d4d4] ">
      {/* bg-black/30 backdrop-blur-md */}
      <div className="max-w-7xl mx-auto flex items-center pr-1 py-1 justify-between md:px-6 md:py-3">
        {/* Logo */}
        <img src={logo} alt="" className="w-32 h-12  object-cover" />
        {/* Links */}
        <div className=" space-x-6 lg:flex hidden dm-sans-font">
          <a
            href="/"
            className="bg-gradient-to-r dm-sans-font from-white via-gray-400 to-gray-300 bg-clip-text text-transparent"
          >
            Home
          </a>
          <a
            href="/features"
            className="text-[rgb(255, 255, 255)] dm-sans-font"
          >
            Features
          </a>
          <a href="/pricing" className="text-[#e5e5e5] dm-sans-font">
            Pricing
          </a>
          <a href="/dashboard" className="text-[#e5e5e5] dm-sans-font">
            dashboard
          </a>
        </div>

        {/* Button */}
        <a
          href="/login"
          className="px-6 py-1 rounded-md bg-white/40 hover:bg-white/60 backdrop-blur-sm border border-white/30"
        >
          Login
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
