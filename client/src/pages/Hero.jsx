import React, { useEffect, useRef, useState } from "react";
import CLOUDS from "vanta/dist/vanta.clouds.min";
import * as THREE from "three";
import { SendHorizontal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Login from "./Login";
import { useNavigate } from "react-router-dom";
import { setIsAuthButtonClickedTrue } from "../redux/slice/authSlice";

const Hero = () => {
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        CLOUDS({
          el: vantaRef.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          // 👇 same customizations as Vanta demo
          backgroundColor: 0xffffff,
          skyColor: 0x68b8d7,
          cloudColor: 0xadc1de,
          cloudShadowColor: 0x183550,
          sunColor: 0xff9919,
          sunGlareColor: 0xff6633,
          sunlightColor: 0xff9933,
          speed: 1.0,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  const handleLoginClick = () => {
    if (auth?.isAuthButtonClicked == false) {
      console.log("clicked");

      dispatch(setIsAuthButtonClickedTrue());
    }
  };

  useEffect(() => {
    if (auth?.isAuth) {

      let redirectUrl = localStorage.getItem("redirectUrlForNotLogin");
      redirectUrl = JSON.parse(redirectUrl);
      if (redirectUrl) {
        localStorage.removeItem("redirectUrlForNotLogin");
        navigate(redirectUrl);
      } else {
        navigate("/project");
      }
    }
  }, [auth?.isAuth, navigate]);

  return (
    <div
      ref={vantaRef}
      data-scroll-section
      className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden"
    >
      {/* Top Badge */}
      {auth?.isAuthButtonClicked ? (
        <Login />
      ) : (
        <>
          <div className="flex items-center gap-2 rounded-full px-3 py-2 bg-inherit border  mb-6 relative z-10">
            <div className="px-3 py-1 rounded-[26px] bg-gradient-to-tr from-[#a7adc3] to-[#4d8bbd] text-white font-medium text-sm">
              2025
            </div>
            {/* <div className="px-3 py-1 rounded-[26px] bg-gradient-to-b from-[#4f1ad6] to-[#8059e3] text-white font-medium text-sm">
          2025
        </div> */}
            <h4 className="text-gray-200 text-sm dm-sans-font">
              AI for Smarter Schemas
            </h4>
          </div>

          {/* Heading */}
          <h1 className="text-4xl lg:text-6xl font-bold dm-sans-font text-white leading-tight max-w-4xl relative z-10">
            Generate Databases <br className="hidden lg:block" />
            <span className="block dm-sans-font">Instantly from Prompts.</span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-[#d4d4d4] max-w-2xl text-[14px]  lg:text-[16px] relative z-10 ">
            No more schema design headaches. Just describe your needs in plain
            English, <br />
            and let SchemaGenius build the database for you.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-row lg:w-1/2 w-[90%] md:w-[70%] items-center justify-center gap-4  relative z-10">
            {/* <div className=" items-center justify-center flex gap-1 shadow-white text-white  bg-inherit shadow-sm flex-1 rounded-full h-full py-3 px-3 ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                placeholder="Describe your database"
                className="bg-transparent w-full h-full placeholder:text-[white]  outline-none"
              />
              <SendHorizontal className="w-5 h-5 lg:hidden flex" />
            </div> */}
            <button
              onClick={handleLoginClick}
              className="px-3  py-2.5 bg-inherit shadow-white  text-white rounded-md font-medium shadow-sm hover:opacity-90 transition"
            >
              Sign In to Continue
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Hero;
