//PREVENTS UNAUTHORIZED ACCESS TO PROTECTED ROUTES - CHECKS AUTH STATE AND REDIRECTS TO LOGIN IF NOT AUTHENTICATED

import { useAuth } from "../context/useAuth";
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
    } else if (requiredRole && role !== requiredRole) {
      navigate("/unauthorized", {
        state: {
          message: "You are not authorized to access this page.",
        },
      });
    }
  }, [token, role, requiredRole, navigate]);

  if (!token) return null;
  if (requiredRole && role !== requiredRole) return null;

  return children;
}