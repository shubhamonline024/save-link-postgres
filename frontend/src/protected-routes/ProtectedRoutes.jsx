import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";

const ProtectedRoutes = () => {
  const { userId } = useAuth();
  return userId ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoutes;
