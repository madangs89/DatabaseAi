// PageLoader.jsx
import React from "react";
import { motion } from "framer-motion";

const PageLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative flex items-center justify-center">
        {/* Animated circular ring */}
        <motion.div
          className="absolute w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        />

        {/* Center Logo */}
        <div className="p-3 rounded-xl bg-blue-600 shadow-xl">
          <svg
            className="text-white"
            fill="none"
            height="32"
            viewBox="0 0 48 48"
            width="32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </div>

      {/* App name under logo */}
      <div className="text-lg font-semibold tracking-wide text-gray-800 dark:text-gray-100">
        SchemaGenious
      </div>
    </div>
  );
};

export default PageLoader;
