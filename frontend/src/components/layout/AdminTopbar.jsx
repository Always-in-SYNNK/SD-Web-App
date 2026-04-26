// src/components/layout/AdminTopbar.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/useAuth";

const API_URL = import.meta.env.VITE_API_URL;

// ── Hardcoded applicant-side admin user ──────────────────────────────────────
const APPLICANT_ADMIN_USER = {
  displayName: "JD",
  subtitle: "Admin",
  avatar: "JD", // two-letter initials shown in the circle
};

const AdminTopbar = ({ title, source = "applicant" }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [fullName,  setFullName]  = useState("");
  const [subtitle,  setSubtitle]  = useState("");
  const [avatar,    setAvatar]    = useState("?");
  const [showMenu,  setShowMenu]  = useState(false);

  useEffect(() => {
    // ── Applicant side: always show hardcoded JD ─────────────────────────
    if (source === "applicant") {
      setFullName(APPLICANT_ADMIN_USER.displayName);
      setSubtitle(APPLICANT_ADMIN_USER.subtitle);
      setAvatar(APPLICANT_ADMIN_USER.avatar);
      return;
    }

    // ── Provider side: resolve from DB/session ───────────────────────────
    const resolveUser = async () => {
      // Priority 1: Provider session cookie
      try {
        const res  = await fetch(`${API_URL}/api/auth/provider/me`, { credentials: "include" });
        const data = await res.json();
        if (data.authenticated && data.user) {
          const name = data.user.name || data.user.full_name || "User";
          setFullName(name);
          setSubtitle(data.user.organisation_name || "Employer");
          setAvatar(name.charAt(0).toUpperCase());
          return;
        }
      } catch {/* ignore */}

      // Priority 2: AuthContext
      if (authUser) {
        const name = authUser.name || authUser.full_name || "User";
        setFullName(name);
        setSubtitle(authUser.role === "provider" ? "Employer" : authUser.role || "Admin");
        setAvatar(name.charAt(0).toUpperCase());
        return;
      }

      // Priority 3: localStorage
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const name   = parsed.name || parsed.full_name || "User";
          setFullName(name);
          setSubtitle(parsed.role || "Admin");
          setAvatar(name.charAt(0).toUpperCase());
        } catch {/* ignore */}
      }
    };

    resolveUser();
  }, [source, authUser]);

  // ── Close menu on outside click ──────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("[data-admin-menu]")) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = async () => {
    if (source === "provider") {
      try {
        await fetch(`${API_URL}/api/auth/provider/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch {/* ignore */}
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 flex justify-between items-center px-12 h-16 bg-white border-b border-gray-200">
      {/* Left: Page title */}
      <h1 className="text-lg font-bold text-gray-900 shrink-0">{title}</h1>

      {/* Right: Actions + user */}
      <div className="flex gap-3 items-center">
        <button className="p-2 hover:bg-gray-100 rounded-full text-lg">🔔</button>
        <button className="p-2 hover:bg-gray-100 rounded-full text-lg">⚙️</button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* User info + avatar */}
        <div className="relative" data-admin-menu>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2"
          >
            {/* Name + subtitle — hidden on very small screens */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-700 leading-tight truncate max-w-[160px]">
                {fullName}
              </p>
              <p className="text-xs text-gray-400 leading-tight truncate max-w-[160px]">
                {subtitle}
              </p>
            </div>

            <figure className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#035b9d] font-bold text-xs shrink-0">
              {avatar}
            </figure>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
              <button
                type="button"
                onClick={() => { setShowMenu(false); navigate("/pipeline"); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => { setShowMenu(false); logout(); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;