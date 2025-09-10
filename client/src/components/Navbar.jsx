import React from "react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 text-white left-0 w-full z-50 bg-black/30 backdrop-blur-md ">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="text-xl font-bold">DB Copilot</div>

        {/* Links */}
        <div className="flex space-x-6">
          <a href="/" className="text-white hover:text-black">
            Home
          </a>
          <a href="/features" className="text-white hover:text-black">
            Features
          </a>
          <a href="/pricing" className="text-white hover:text-black">
            Pricing
          </a>
        </div>

        {/* Button */}
        <a
          href="/login"
          className="px-4 py-2 rounded-xl bg-white/40 hover:bg-white/60 backdrop-blur-sm border border-white/30"
        >
          Login
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
