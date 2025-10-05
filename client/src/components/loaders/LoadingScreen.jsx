import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, steps } from "framer-motion";
import { useSelector } from "react-redux";

const messages = {
  1: [
    "Talking with AI to craft your schema...",
    "Brewing your database schema ☕...",
    "Consulting with the code gods ⚡...",
    "Schema magic in progress ✨...",
    "Laying bricks for your data castle 🏰...",
  ],
  2: [
    "Got the schema! Now writing backend magic 🪄...",
    "Brewing API endpoints ☕...",
    "Forging REST endpoints ⚒️...",
    "Building auth walls 🛡️...",
    "Your backend is nearly alive 🤖...",
  ],
  3: [
    "Oops, something broke 💔...",
    "Our AI tripped on a semicolon ;)",
    "Error storm ahead 🌩️...",
    "Retry? The schema deserves another chance 🚀...",
  ],
};

const LoadingScreen = ({ state }) => {
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const monacoSlice = useSelector((state) => state.monaco);

  // Rotate messages periodically
  useEffect(() => {
    if (state && messages[state]) {
      const pick = () => {
        const arr = messages[state];
        setMessage(arr[Math.floor(Math.random() * arr.length)]);
      };
      pick();
      const interval = setInterval(pick, 2500);
      return () => clearInterval(interval);
    }
  }, [state]);

  // Fake progress bar (for effect)
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i += Math.random() * 10;
      if (i > 98) i = 98;
      setProgress(Math.floor(i));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0e0e0e] text-white z-[9999] overflow-hidden">
      {/* 🌫️ Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top-Left Blob */}
        <div
          className={`
             absolute -top-24 -left-24 
      w-[200px] h-[200px]
      sm:w-[300px] sm:h-[300px]
      md:w-[400px] md:h-[400px]
      bg-gradient-to-br ${
        state === 3 ? "from-red-600" : "from-white/10"
      } to-transparent
      rounded-full blur-[80px] sm:blur-[100px]
      animate-lightMove1`}
        ></div>

        {/* Bottom-Right Blob */}
        <div
          className={`
            
             absolute -bottom-32 -right-32 
      w-[250px] h-[250px]
      sm:w-[350px] sm:h-[350px]
      md:w-[500px] md:h-[500px]
      bg-gradient-to-tr ${
        state === 3 ? "from-red-600" : "from-white/15"
      } to-transparent
      rounded-full blur-[90px] sm:blur-[120px]
      animate-lightMove2


            `}
        ></div>

        {/* Center Blob */}
        <div
          className={`
            
            
             absolute top-1/2 left-1/2 
      -translate-x-1/2 -translate-y-1/2
      w-[180px] h-[180px]
      sm:w-[250px] sm:h-[250px]
      md:w-[300px] md:h-[300px]
      bg-gradient-to-tl from-white/8 to-transparent
      rounded-full blur-[70px] sm:blur-[90px]
      animate-lightMove3

            `}
        ></div>
      </div>

      {/* Loader / Text */}
      {state === 3 ? (
        <div className="relative z-10 text-center flex flex-col items-center justify-center gap-4 p-6 rounded-xl shadow-xl   max-w-lg mx-auto">
          <div className="text-red-500 text-6xl mb-2">⚠️</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-red-500">
            {monacoSlice?.errorText ||
              "Unable to fetch code. May be not generated yet."}
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">{message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-300 shadow-md"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="relative z-10 text-center">
          <h1 className="text-2xl font-semibold mb-2">
            {state === 1 ? "Generating Schema" : "Building Backend"}
          </h1>
          <AnimatePresence mode="wait">
            <motion.p
              key={message}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.4 }}
              className="italic text-gray-200 text-sm sm:text-base"
            >
              {message}
            </motion.p>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;
