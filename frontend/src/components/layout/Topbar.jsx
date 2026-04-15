// src/components/layout/Topbar.jsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

const Topbar = ({ user: providerUser, onLogout }) => {
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isProvider, setIsProvider] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      // Check if provider user was passed via props (session-based auth)
      if (providerUser && providerUser.name) {
        setIsProvider(true);
        setFullName(providerUser.name);
        
        // Fetch organisation name from provider_profiles
        const { data: providerProfile } = await supabase
          .from("provider_profiles")
          .select("organisation_name")
          .eq("profile_id", providerUser.id)
          .single();

        if (providerProfile) {
          setOrgName(providerProfile.organisation_name);
        }
        return;
      }

      // Otherwise, try Supabase auth (for applicants/admins)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, id, role")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name);
        setIsProvider(profile.role === "provider");

        // If provider, fetch organisation name
        if (profile.role === "provider") {
          const { data: providerProfile } = await supabase
            .from("provider_profiles")
            .select("organisation_name")
            .eq("profile_id", profile.id)
            .single();

          if (providerProfile) {
            setOrgName(providerProfile.organisation_name);
          }
        }
      }
    };

    loadUser();
  }, [providerUser]);

  const displayName = fullName || providerUser?.name || "User";
  const displaySubtitle = isProvider ? (orgName || "Employer") : "Applicant";
  const avatarLetter = displayName.charAt(0) || "U";

  const handleSignOut = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback logout for Supabase users
      supabase.auth.signOut();
      window.location.href = "/";
    }
  };

  return (
    <header className="fixed top-0 right-0 left-72 h-16 bg-white border-b border-gray-200 z-40">
      <section className="h-full px-6 flex items-center justify-end">
        <section className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 focus:outline-none"
          >
            <section className="text-right">
              <p className="text-sm font-semibold text-gray-700">
                {displayName}
              </p>
              <p className="text-xs text-gray-500">{displaySubtitle}</p>
            </section>
            <figure className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
              {avatarLetter}
            </figure>
          </button>

          {showMenu && (
            <section className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  handleSignOut();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </section>
          )}
        </section>
      </section>
    </header>
  );
};

export default Topbar;