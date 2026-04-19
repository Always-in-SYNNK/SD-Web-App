// src/routes/protectedRoute.jsx
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const { token, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/auth-error", {
        state: {
          loginPage: requiredRole === "provider" ? "prov-login" : "app-login",
          message: "You must be logged in to access this page.",
        },
      });
      return;
    }

    // Admins can access everything — never redirect them
    if (role === "admin") return;

    if (requiredRole && role !== requiredRole) {
      navigate("/unauthorized", {
        state: {
          message: "You are not authorized to access this page.",
        },
      });
    }
  }, [token, role, requiredRole, navigate]);

  if (!token) return null;

  // Admins pass through any route regardless of requiredRole
  if (role === "admin") return children;

  if (requiredRole && role !== requiredRole) return null;

  return children;
}