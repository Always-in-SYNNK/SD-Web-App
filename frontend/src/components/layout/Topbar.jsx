import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/useAuth";

// Page label map — add new routes here as you build them
const PAGE_LABELS = {
  "/pipeline":           "Validation Pipeline",
  "/post-opportunity":   "Post New Opportunity",
  "/admin-applications": "Admin Applications",
  "/admin-console":      "Admin Console",
};

const Topbar = ({ user: providerUser, onLogout }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user: authUser } = useAuth();

  const [fullName,   setFullName]   = useState("");
  const [orgName,    setOrgName]    = useState("");
  const [showMenu,   setShowMenu]   = useState(false);
  const [isProvider, setIsProvider] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ── resolve logged-in user ──────────────────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      let activeUser = providerUser;
      if (!activeUser) activeUser = authUser;
      if (!activeUser) {
        const stored = localStorage.getItem("user");
        if (stored) {
          try { activeUser = JSON.parse(stored); }
          catch { activeUser = null; }
        }
      }

      if (!activeUser) { setIsLoggedIn(false); return; }

      setIsLoggedIn(true);
      setFullName(activeUser.name || activeUser.full_name || "User");
      setIsProvider(activeUser.role === "provider");

      if (activeUser.role === "provider" && activeUser.id) {
        const { data } = await supabase
          .from("provider_profiles")
          .select("organisation_name")
          .eq("profile_id", activeUser.id)
          .single();
        if (data) setOrgName(data.organisation_name);
      }
    };
    loadUser();
  }, [providerUser, authUser]);

  // ── close dropdown on outside click ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-user-menu]")) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayName  = fullName || "User";
  const subtitle     = isProvider ? orgName || "Employer" : "Applicant";
  const avatar       = displayName.charAt(0).toUpperCase();

  // ── active page label (dynamic) ─────────────────────────────────────────
  const currentPath  = location.pathname;
  const activeLabel  = PAGE_LABELS[currentPath] || null;

  const logout = async () => {
    if (onLogout) onLogout();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    await supabase.auth.signOut();
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect?.();
        window.google.accounts.id.cancel?.();
      } catch {/* ignore */}
    }
    navigate("/");
  };

  // ── shared nav wrapper ──────────────────────────────────────────────────
  const NavShell = ({ children }) => (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-12 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 w-full min-w-0 ml-0">
      {/* Left: nav links */}
      <section className="flex items-center gap-6 text-sm font-medium shrink-0">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-[#035b9d] transition-colors"
        >
          Home
        </button>

        <button
          type="button"
          onClick={() => navigate("/pipeline")}
          className={`transition-colors ${
            currentPath === "/pipeline"
              ? "text-[#035b9d] font-bold border-b-2 border-[#035b9d] pb-0.5"
              : "text-gray-400 hover:text-[#035b9d]"
          }`}
        >
          Dashboard
        </button>

        {/* Active page pill — only shown when NOT on /pipeline itself */}
        {activeLabel && currentPath !== "/pipeline" && (
          <span className="text-[#035b9d] font-bold border-b-2 border-[#035b9d] pb-0.5">
            {activeLabel}
          </span>
        )}
      </section>

      {/* Right: notifications + user */}
      {children}
    </nav>
  );

  // ── not logged in ───────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <NavShell>
        <section className="flex items-center gap-3 shrink-0">
          <button className="p-2 hover:bg-gray-100 rounded-full">🔔</button>
          <button className="p-2 hover:bg-gray-100 rounded-full">❓</button>
          <button
            onClick={() => navigate("/prov-login")}
            className="px-4 py-2 bg-[#035b9d] text-white rounded-lg text-sm font-semibold hover:bg-[#024a82] transition-colors"
          >
            Sign In
          </button>
        </section>
      </NavShell>
    );
  }

  // ── logged in ───────────────────────────────────────────────────────────
  return (
    <NavShell>
      <section className="flex items-center gap-3 shrink-0">
        {/* Notifications */}
        <button className="p-2 hover:bg-gray-100 rounded-full text-base">🔔</button>
        <button className="p-2 hover:bg-gray-100 rounded-full text-base">❓</button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200" />

        {/* User menu */}
        <section className="relative" data-user-menu>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2"
          >
            <section className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-700 leading-tight truncate max-w-[160px]">
                {displayName}
              </p>
              <p className="text-xs text-gray-400 leading-tight truncate max-w-[160px]">
                {subtitle}
              </p>
            </section>

            <figure className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#035b9d] font-bold text-xs shrink-0">
              {avatar}
            </figure>
          </button>

          {showMenu && (
            <section className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
              <button
                type="button"
                onClick={() => { setShowMenu(false); navigate("/provider/profile"); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                My Profile
              </button>              
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
            </section>
          )}
        </section>
      </section>
    </NavShell>
  );
};

export default Topbar;