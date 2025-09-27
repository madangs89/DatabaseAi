import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuth = useSelector((state) => state?.auth?.isAuth);

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
