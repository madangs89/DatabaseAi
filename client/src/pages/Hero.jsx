import React from "react";

const Hero = () => {
  return (
    <div
      data-scroll-section
      className="min-h-screen dm-sans-font w-full overflow-x-hidden flex items-center justify-center"
    >
      <div
        className="h-screen w-full flex items-center justify-center"
        data-scroll-section
      >
        <div className="rounded-full flex items-center gap-2  justify-between py-1 pr-2  pl-1  bg-red-400">
          <div className="w-20 items-center justify-center flex py-1 rounded-full bg-blue-400">
            2025
          </div>
          <h4>Next Gen DB Ai</h4>
        </div>
      </div>
    </div>
  );
};

export default Hero;
