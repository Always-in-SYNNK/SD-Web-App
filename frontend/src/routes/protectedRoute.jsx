//PREVENTS UNAUTHORIZED ACCESS TO PROTECTED ROUTES - CHECKS AUTH STATE AND REDIRECTS TO LOGIN IF NOT AUTHENTICATED

import { useAuth } from "../context/useAuth";
import { useEffect } from "react";

export default function ProtectedRoute({ children, setPage }) {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      setPage("applogin"); //authentication failed page?
    }
  }, [token, setPage]);

  if (!token) return null;

  return children;
}