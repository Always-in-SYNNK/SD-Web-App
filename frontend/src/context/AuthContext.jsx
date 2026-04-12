//AUTH CONTEXT - MANAGES AUTH STATE AND PERSISTENCE ACROSS THE APP

import { useState } from "react";
import AuthContext from "./authContextValue";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (!storedUser || !storedToken) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));

  const login = (userData, jwtToken, userRole = null) => {
    setUser(userData);
    setToken(jwtToken);
    setRole(userRole);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
    if (userRole) {
      localStorage.setItem("role", userRole);
    } else {
      localStorage.removeItem("role");
    }
  };

  const logout = () => { //TASH CAN DOUBLE CHECK THIS IMPLEMENTATION
    setUser(null);
    setToken(null);
    setRole(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
