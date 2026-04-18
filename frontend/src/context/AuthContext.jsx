//AUTH CONTEXT - MANAGES AUTH STATE AND PERSISTENCE ACROSS THE APP

import { useState } from "react";
import AuthContext from "./authContextValue";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (!storedUser || !storedToken) return null;
    try { return JSON.parse(storedUser); }
    catch { localStorage.removeItem("user"); localStorage.removeItem("token"); return null; }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isNewUser, setIsNewUser] = useState(() => localStorage.getItem("isNewUser") === "true");

  const role = user?.role || null;

  const login = (userData, jwtToken, newUser = false) => {
    setUser(userData);
    setToken(jwtToken);
    setIsNewUser(newUser);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("isNewUser", String(newUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsNewUser(false);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("isNewUser");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ user, token, role, isNewUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
