import React, { useEffect, useRef, useState } from "react";
import CLOUDS from "vanta/dist/vanta.clouds.min";
import * as THREE from "three";

const Hero = () => {
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

  return (
    <div
      ref={vantaRef}
      data-scroll-section
      className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden"
    >
      {/* Top Badge */}
      <div className="flex items-center gap-2 rounded-full px-1 py-1 bg-[#111] border border-[#5E5E5E] mb-6 relative z-10">
        <div className="px-3 py-1 rounded-[26px] bg-gradient-to-tr from-[#a7adc3] to-[#4d8bbd] text-white font-medium text-sm">
          2025
        </div>
        {/* <div className="px-3 py-1 rounded-[26px] bg-gradient-to-b from-[#4f1ad6] to-[#8059e3] text-white font-medium text-sm">
          2025
        </div> */}
        <h4 className="text-gray-200 text-sm dm-sans-font">Next-Gen AI Studio</h4>
      </div>

      {/* Heading */}
      <h1 className="text-4xl md:text-6xl font-bold dm-sans-font text-white leading-tight max-w-4xl relative z-10">
        AI-Driven Success <br className="hidden md:block" />
        <span className="block dm-sans-font">Redefining the Future.</span>
      </h1>

      {/* Subtext */}
      <p className="mt-6 text-[#d4d4d4] max-w-2xl text-[14px]  md:text-[16px] relative z-10 ">
        Creating latest solutions that redefine innovation. <br />
        Stay ahead with AI-powered technology for the future.
      </p>

      {/* Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 relative z-10">
        <button className="px-6 py-3 bg-white text-black rounded-xl font-medium shadow hover:bg-gray-200 transition">
          Connect With Us
        </button>
        <button className="px-6 py-3 bg-gradient-to-tr from-[#a7adc3] to-[#4d8bbd] text-white rounded-xl font-medium shadow hover:opacity-90 transition">
          What is Nubien?
        </button>
      </div>
    </div>
  );
};

export default Hero;
