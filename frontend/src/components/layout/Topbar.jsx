import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/useAuth";

const Topbar = ({ user: providerUser, onLogout }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isProvider, setIsProvider] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      // 🔥 PRIORITY 1: Validation Pipeline (WORKING FLOW)
      let activeUser = providerUser;

      // 🔥 PRIORITY 2: AuthContext fallback
      if (!activeUser) activeUser = authUser;

      // 🔥 PRIORITY 3: localStorage fallback
      if (!activeUser) {
        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            activeUser = JSON.parse(stored);
          } catch {
            activeUser = null;
          }
        }
      }

      if (!activeUser) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);
      setFullName(activeUser.name || activeUser.full_name || "User");
      setIsProvider(activeUser.role === "provider");

      // provider org lookup only if provider
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

  const displayName = fullName || "User";
  const subtitle = isProvider ? orgName || "Employer" : "Applicant";
  const avatar = displayName.charAt(0).toUpperCase();

  const logout = async () => {
    if (onLogout) {
      onLogout();
    }

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    await supabase.auth.signOut();

    navigate("/");
  };

  if (!isLoggedIn) {
    return (
      <header className="fixed top-0 right-0 left-72 h-16 bg-white border-b border-gray-200 z-40">
        <section className="h-full px-6 flex items-center justify-end">
          <button
            onClick={() => navigate("/prov-login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
          >
            Sign In
          </button>
        </section>
      </header>
    );
  }

  return (
    <header className="fixed top-0 right-0 left-72 h-16 bg-white border-b border-gray-200 z-40">
      <section className="h-full px-6 flex items-center justify-end">
        <section>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3"
          >
            <section className="text-right">
              <p className="text-sm font-semibold text-gray-700">
                {displayName}
              </p>
              <p className="text-xs text-gray-500">
                {subtitle}
              </p>
            </section>

            <figure className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
              {avatar}
            </figure>
          </button>

          {showMenu && (
            <section className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  navigate("/pipeline");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
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