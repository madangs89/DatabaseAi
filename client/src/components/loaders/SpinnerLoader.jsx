// SpinnerLoader.jsx
import React from "react";

const SpinnerLoader = ({ clr = "white" }) => {
  return (
    <div className="flex items-center justify-center">
      {" "}
      <div className={`w-4 h-4 border-2 border-${clr} border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
};

export default SpinnerLoader;
