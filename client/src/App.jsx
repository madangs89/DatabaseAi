import React, { useRef, useEffect } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./pages/Hero";
import Dashboard from "./pages/Dashboard";
import LocomotiveScroll from "locomotive-scroll";
import { ReactFlowProvider } from "reactflow";
import ProtectedRoute from "./protected/ProtectedRoute";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setAuthTrue } from "./redux/slice/authSlice";
import Project from "./pages/Project";
import { setPageLoading } from "./redux/slice/loadingSlice";
import SpinnerLoader from "./components/loaders/SpinnerLoader";
import { io } from "socket.io-client";
import { setSocket } from "./redux/slice/projectSlice";
import AuthCallback from "./components/callback/AuthCallback";
import SharedDashboard from "./pages/SharedDashboard";
import {toast} from "react-hot-toast"

const App = () => {
  const isAuth = useSelector((state) => state.auth.isAuth);
  const loadingSlice = useSelector((state) => state.loading);
  const containerRef = useRef(null);
  const location = useLocation();
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const projectSlice = useSelector((state) => state.project);
  const auth = useSelector((state) => state.auth);

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

  useEffect(() => {
    if (auth.user?._id) {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
        auth: {
          userId: auth?.user?._id,
        },
      });
      dispatch(setSocket(newSocket));
    }
    return () => {
      if (projectSlice?.socket) {
        projectSlice?.socket.emit("EndConnection", { userId: auth?.user?._id });
        projectSlice?.socket.close();
      }
    };
  }, [auth]);
  // 👇 Update locomotive when route changes
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.update();
    }, 100);
  }, [location]);

  useEffect(() => {
    dispatch(setPageLoading(true));
    (async () => {
      const data = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/auth/get-current-user`,
        {
          withCredentials: true,
        }
      );
      if (data?.data?.success) {
        dispatch(setAuthTrue(data?.data));
      }
    })();
    dispatch(setPageLoading(false));
  }, []);




  useEffect(() => {
   toast(
  "Note : Backend in Deployed On Render , it will take 1 min for backend bootup becuase i deployed on a free tier please do considre waiting for 1 min.. And Thanks For Your Time",
  {
    duration: 6000,
  }
    setTimeout(() => {
 toast.success("Now You Are Ready To Go!!")
}, 60000);
);
  }, []);

  if (loadingSlice?.pageLoading) {
    return (
      <div className="flex justify-center bg-black items-center w-full h-screen">
        <SpinnerLoader />
      </div>
    );
  }
  return (
    <div
      id="scroll-container"
      data-scroll-container
      ref={containerRef}
      className="bg-black min-h-screen relative w-full overflow-hidden"
    >
      <Navbar />
      <div className="overflow-hidden " data-scroll-section>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route
            path="/:id/dashboard"
            element={<ReactFlowProvider>{<Dashboard />}</ReactFlowProvider>}
          />
          <Route path="/project" element={<Project />} />
          <Route
            path="/share/:projectId/:userId/:shareId"
            element={
              <ReactFlowProvider>
                <SharedDashboard />
              </ReactFlowProvider>
            }
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="*"
            element={
              <div className="w-full h-screen bg-black flex items-center justify-center ">
                <h1 className="bg-white text-black px-3 py-2 capitalize">
                  404 - Page Not Found
                </h1>
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
