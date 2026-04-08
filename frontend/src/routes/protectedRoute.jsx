//PREVENTS UNAUTHORIZED ACCESS TO PROTECTED ROUTES - CHECKS AUTH STATE AND REDIRECTS TO LOGIN IF NOT AUTHENTICATED

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}