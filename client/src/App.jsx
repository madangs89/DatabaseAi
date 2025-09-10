import React from "react";
import { Route, Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./pages/Hero";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import EditorPage from "./pages/EditorPage";
import ProjectSetting from "./pages/ProjectSetting";
import AccountSetting from "./pages/AccountSetting";
import VersionHistory from "./pages/VersionHistory";

const App = () => {
  return (
    <div className="bg-red-500 h-screen w-full">
      {/* Navbar fixed at top */}
      <Navbar />

      {/* Main app routes */}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Private routes (after login) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project/:id" element={<EditorPage />} />
        <Route path="/project/:id/settings" element={<ProjectSetting />} />
        <Route path="/project/:id/history" element={<VersionHistory />} />
        <Route path="/account" element={<AccountSetting />} />

        {/* Fallback */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </div>
  );
};

export default App;
