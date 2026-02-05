import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="p-8 text-slate-300">加载中...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

