import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Create context
const AuthContext = createContext();

// ✅ EXPORT the useAuth hook (this fixes your error)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user from Supabase
  const fetchUser = async () => {
    setLoading(true);
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        setProfile(null);
        setRole(null);
        setIsAdmin(false);
        setToken(null);
        setLoading(false);
        return;
      }

      // Get profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", authUser.id)
        .single();

      setUser(profileData);
      setProfile(profileData);
      setRole(profileData?.role || 'applicant');
      setIsAdmin(profileData?.is_admin || profileData?.role === 'admin');
      
      // Get session token
      const { data: sessionData } = await supabase.auth.getSession();
      setToken(sessionData?.session?.access_token || null);
      
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email/password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) return { error };
      
      await fetchUser(); // Refresh user data
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
      setRole(null);
      setIsAdmin(false);
      setToken(null);
    }
    return { error };
  };

  // Login function (for Google OAuth or other providers)
  const login = async (userData, authToken) => {
    setToken(authToken);
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
};

export default AuthContext;