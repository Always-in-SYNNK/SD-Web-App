// src/components/layout/Sidebar.jsx  (Employer)
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isAdmin,        setIsAdmin]        = useState(false);
  const [applyStatus,    setApplyStatus]    = useState(null);
  const [providerUserId, setProviderUserId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res  = await fetch("http://localhost:3000/api/auth/provider/me", { credentials: "include" });
        const data = await res.json();
        if (!data.authenticated) return;

        const userId = data.user?.id;
        setProviderUserId(userId);

        // 1. Get profile row — select * so we see all columns regardless of casing
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        // 2. Get their latest admin_application row
        const { data: appRow } = await supabase
          .from("admin_applications")
          .select("status")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // 3. Check admin via EITHER the profile flag OR an approved application
        //    This covers the case where the SQL function updated admin_applications
        //    but the profiles UPDATE silently failed
        const profileIsAdmin =
          profile?.isAdmin === true ||
          profile?.["isAdmin"] === true ||
          profile?.isadmin === true ||     // fallback: Postgres lowercased it
          profile?.role === "admin";

        const appIsAdmin = appRow?.status === "approved";

        if (profileIsAdmin || appIsAdmin) {
          setIsAdmin(true);

          // If approved via app but profile not updated yet — fix it now
          if (appIsAdmin && !profileIsAdmin) {
            console.warn("isAdmin mismatch — patching profiles row via RPC");
            await supabase.rpc("grant_admin_access", { target_user_id: userId });
          }
          return;
        }

        // Not an admin — show the apply button with current status
        if (appRow?.status) setApplyStatus(appRow.status);

      } catch (err) {
        console.error("Sidebar init error:", err);
      }
    };
    init();
  }, []);

  const handleApplyAdmin = useCallback(async () => {
    if (!providerUserId || applyStatus) return;

    const { error } = await supabase
      .from("admin_applications")
      .insert([{ user_id: providerUserId }]);

    if (error) {
      console.error("Apply for admin failed:", error.message);
      return;
    }
    setApplyStatus("pending");
  }, [providerUserId, applyStatus]);

  const baseLinks = [
    { icon: "🏠", label: "Home",                path: "/" },
    { icon: "📋", label: "Define Requirements", path: "/define" },
    { icon: "🔍", label: "Validation Pipeline", path: "/pipeline" },
  ];

  const adminLinks = [
    { icon: "🛠️", label: "Admin Console",             path: "/admin" },
    { icon: "🔐", label: "Admin Access Applications", path: "/admin-access" },
  ];

  const links = isAdmin ? [...baseLinks, ...adminLinks] : baseLinks;

  const handleNav = (label, path) => {
    if (label === "Admin Console") {
      navigate("/admin", { state: { source: "employer" } });
    } else if (label === "Admin Access Applications") {
      navigate("/admin-access", { state: { source: "employer" } });
    } else {
      navigate(path);
    }
  };

  const applyButtonLabel = () => {
    if (applyStatus === "pending")  return "⏳ Application Pending";
    if (applyStatus === "approved") return "✅ Admin Approved";
    if (applyStatus === "rejected") return "❌ Application Rejected";
    return "🔐 Apply to be Admin";
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-white flex flex-col p-6 space-y-8 shadow-xl text-sm font-medium z-50">
      <header>
        <strong className="text-xl font-extrabold text-[#0077B6]">Growthstage</strong>
        <p className="text-xs text-gray-400 mt-1">Employer Portal</p>
      </header>

      <nav className="flex-1 space-y-2">
        {links.map(({ icon, label, path }) => (
          <button
            key={label}
            onClick={() => handleNav(label, path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
              window.location.pathname === path
                ? "bg-[#d2e4ff] text-[#0077B6] font-semibold"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <i>{icon}</i>
            <strong>{label}</strong>
          </button>
        ))}
      </nav>

      {!isAdmin && (
        <button
          onClick={handleApplyAdmin}
          disabled={!!applyStatus}
          className={`w-full py-3 rounded-full text-sm font-semibold transition ${
            applyStatus
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-amber-500 text-white hover:bg-amber-600"
          }`}
        >
          {applyButtonLabel()}
        </button>
      )}

      <button
        onClick={() => navigate("/post")}
        className="w-full bg-[#035b9d] text-white py-3 rounded-full text-sm font-semibold hover:opacity-90 transition"
      >
        Post New Opportunity
      </button>
    </aside>
  );
};

export default Sidebar;