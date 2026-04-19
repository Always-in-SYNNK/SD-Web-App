// src/components/dashboard/Sidebar.jsx  (Applicant)
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";

export function Sidebar() {
  const navigate = useNavigate();
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [applyStatus, setApplyStatus] = useState(null);
  const [profilesId,  setProfilesId]  = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        // 1. Get profile row — select * so we see all columns regardless of casing
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .single();

        if (!profile) return;
        setProfilesId(profile.id);

        // 2. Get their latest admin_application row
        const { data: appRow } = await supabase
          .from("admin_applications")
          .select("status")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // 3. Check admin via EITHER the profile flag OR an approved application
        const profileIsAdmin =
          profile?.isAdmin === true ||
          profile?.["isAdmin"] === true ||
          profile?.isadmin === true ||
          profile?.role === "admin";

        const appIsAdmin = appRow?.status === "approved";

        if (profileIsAdmin || appIsAdmin) {
          setIsAdmin(true);

          // Self-heal: if approved in applications but profile not updated — patch it
          if (appIsAdmin && !profileIsAdmin) {
            console.warn("isAdmin mismatch — patching via RPC");
            await supabase.rpc("grant_admin_access", { target_user_id: profile.id });
          }
          return;
        }

        if (appRow?.status) setApplyStatus(appRow.status);

      } catch (err) {
        console.error("Sidebar init error:", err);
      }
    };
    init();
  }, []);

  const handleApplyAdmin = useCallback(async () => {
    if (!profilesId || applyStatus) return;

    const { error } = await supabase
      .from("admin_applications")
      .insert([{ user_id: profilesId }]);

    if (error) {
      console.error("Apply for admin failed:", error.message);
      return;
    }
    setApplyStatus("pending");
  }, [profilesId, applyStatus]);

  const baseLinks = [
    { icon: "🎓", label: "Qualifications", path: "/qualifications" },
    { icon: "💼", label: "Opportunities",  path: "/opportunities" },
    { icon: "📄", label: "Applications",   path: "/applications" },
    { icon: "📊", label: "Analytics",      path: "/analytics" },
    { icon: "✅", label: "Verification",   path: "/verification" },
  ];

  const adminLinks = [
    { icon: "🛠️", label: "Admin Console",             path: "/admin" },
    { icon: "🔐", label: "Admin Access Applications", path: "/admin-access" },
  ];

  const links = isAdmin ? [...baseLinks, ...adminLinks] : baseLinks;

  const handleNav = (label, path) => {
    if (label === "Admin Console") {
      navigate("/admin", { state: { source: "applicant" } });
    } else if (label === "Admin Access Applications") {
      navigate("/admin-access", { state: { source: "applicant" } });
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
        <strong className="text-xl font-extrabold text-[#0077B6]">
          Growthstage
        </strong>
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

      <nav className="space-y-2">
        <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-500 hover:text-[#035b9d]">
          <i>⚙️</i>
          <strong>Settings</strong>
        </a>
        <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-500 hover:text-[#035b9d]">
          <i>❓</i>
          <strong>Support</strong>
        </a>
      </nav>
    </aside>
  );
}