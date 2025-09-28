import React, { useRef, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
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
import { ReactFlowProvider } from "reactflow";
import ProtectedRoute from "./protected/ProtectedRoute";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setAuthTrue } from "./redux/slice/authSlice";
import Project from "./pages/Project";

const App = () => {
  const isAuth = useSelector((state) => state.auth.isAuth);
  const containerRef = useRef(null);
  const location = useLocation();
  const scrollRef = useRef(null);
  const dispatch = useDispatch();

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

  useEffect(() => {
    (async () => {
      const data = await axios.get(
        `http://localhost:5000/auth/get-current-user`,
        {
          withCredentials: true,
        }
      );
      if (data?.data?.success) {
        dispatch(setAuthTrue(data?.data));
      }
    })();
  }, []);

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
          <Route
            path="/:id/dashboard"
            element={
              <ProtectedRoute>
                <ReactFlowProvider>
                  <Dashboard />
                </ReactFlowProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/project"
            element={
              <ProtectedRoute>
                <Project />
              </ProtectedRoute>
            }
          />
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
