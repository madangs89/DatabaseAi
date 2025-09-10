import React, { useRef, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./pages/Hero";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import EditorPage from "./pages/EditorPage";
import ProjectSetting from "./pages/ProjectSetting";
import AccountSetting from "./pages/AccountSetting";
import VersionHistory from "./pages/VersionHistory";
import LocomotiveScroll from "locomotive-scroll";

const App = () => {
  const containerRef = useRef(null);
  const location = useLocation();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    scrollRef.current = new LocomotiveScroll({
      el: containerRef.current,
      smooth: true,
      lerp: 0.06, // smaller = smoother
    });

    window.addEventListener("resize", () => scrollRef.current.update());

    return () => {
      if (scrollRef.current) scrollRef.current.destroy();
    };
  }, []);

  // 👇 Update locomotive when route changes
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.update();
    }, 100); 
  }, [location]);

  return (
    <div
      id="scroll-container"
      data-scroll-container
      ref={containerRef}
      className="bg-black min-h-screen relative w-full overflow-x-hidden"
    >
      <Navbar />
      <div data-scroll-section>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project/:id" element={<EditorPage />} />
          <Route path="/project/:id/settings" element={<ProjectSetting />} />
          <Route path="/project/:id/history" element={<VersionHistory />} />
          <Route path="/account" element={<AccountSetting />} />
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
