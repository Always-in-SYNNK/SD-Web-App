// src/pages/DefineRequirements.jsx
import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import RequirementsForm from "../components/forms/RequirementsForm";

const API_URL = import.meta.env.VITE_API_URL;

const DefineRequirements = () => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/api/auth/provider/me`, { credentials: "include" });
      const data = await res.json();
      if (!data.authenticated) {
        window.location.href = "/prov-login";
        return null;
      }
      return data.user;
    } catch {
      window.location.href = "/prov-login";
      return null;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/provider/logout`, { method: "POST", credentials: "include" });
      localStorage.removeItem("provider_user");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, []);

  useEffect(() => {
    checkAuth().then((u) => {
      setUser(u);
      setAuthChecked(true);
    });
  }, [checkAuth]);

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar user={user} onLogout={handleLogout} />

      <section className="ml-64 pt-16 p-8">
        <h1 className="text-3xl font-bold mb-6">Define Requirements</h1>
        <RequirementsForm />
      </section>
    </main>
  );
};

export default DefineRequirements;