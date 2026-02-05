import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import EvaluationPage from "./pages/EvaluationPage";
import HistoryPage from "./pages/HistoryPage";
import EvaluationDetailPage from "./pages/EvaluationDetailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import TopNav from "./components/TopNav";
import { useAuth } from "./state/AuthContext";

export default function App() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <TopNav />
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evaluate"
          element={
            <ProtectedRoute>
              <TopNav />
              <EvaluationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <TopNav />
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history/:id"
          element={
            <ProtectedRoute>
              <TopNav />
              <EvaluationDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

