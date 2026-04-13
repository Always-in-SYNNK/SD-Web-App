// src/components/layout/Topbar.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const Topbar = () => {
  const [fullName, setFullName] = useState("Natasha Dobah");
  const [orgName, setOrgName] = useState("Test Company ZA");

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, id")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name);

        // Also fetch organisation name for subtitle
        const { data: providerProfile } = await supabase
          .from("provider_profiles")
          .select("organisation_name")
          .eq("profile_id", profile.id)
          .single();

        if (providerProfile) {
          setOrgName(providerProfile.organisation_name);
        }
      }
    };

    loadUser();
  }, []);

  return (
    <header className="ml-72 h-16 flex items-center justify-between px-6 bg-white shadow">
      <input
        className="border rounded-full px-4 py-2 w-96"
        placeholder="Search roles..."
      />

      <section className="flex items-center gap-4">
        <i className="material-symbols-outlined">notifications</i>
        <i className="material-symbols-outlined">chat_bubble</i>

        <section>
          <p className="font-bold leading-tight">{fullName}</p>
          <p className="text-xs text-gray-500 leading-tight">
            {orgName || "Provider"}
          </p>
        </section>
      </section>
    </header>
  );
};

export default Topbar;