// src/hooks/useUser.js
import { useAuth } from "../context/AuthContext";

export function useUser() {
  const { user, profile, loading } = useAuth();
  return { user, profile, loading };
}