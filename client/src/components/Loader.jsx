import React from "react";

const Loader = ({ clr = "white" }) => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        className={`w-4 h-4 border-[2px] ${
          clr == "black" ? "border-black" : "border-white"
        } border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default Loader;
