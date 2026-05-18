import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { Sidebar } from "../components/dashboard/Sidebar";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { QualificationList } from "../components/dashboard/QualificationList";
import { NotificationDropdown } from "../components/notifications/notificationDropdown";
import { CVCard } from "../components/dashboard/CVCard";

export default function StudentDashboard() {
  const { token, user } = useAuth();
  const API = import.meta.env.VITE_API_URL;
  const [profile, setProfile] = useState(null);
  const [cvUrl, setCvUrl] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  useEffect(() => {
    const fetchCv = async () => {
      try {
        const res = await fetch(`${API}/api/profile/me/cv/signed-url`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.signed_url) setCvUrl(data.signed_url);
      } catch (err) {
        console.error("Failed to fetch CV:", err);
      }
    };
    if (token) fetchCv();
  }, [token]);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "JD";

  return (
    <main className="flex min-h-screen bg-[#faf9f8]">
      <Sidebar activePage="/dashboard" />
      <section className="ml-64 min-h-screen w-full">

        <nav className="sticky top-0 z-50 flex items-center justify-between px-12 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <section className="flex items-center gap-6 text-sm font-medium">
            <a href="/" className="text-gray-400 hover:text-[#035b9d]">Home</a>
            <a href="/dashboard" className="text-[#035b9d] font-bold border-b-2 border-[#035b9d] pb-0.5">Dashboard</a>
          </section>
          <section className="flex items-center gap-3">
            <NotificationDropdown />
              <section className="relative" data-user-menu>
                  <button
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-2"
                    >
                    <section className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-gray-700 leading-tight truncate max-w-[160px]">
                        {profile?.full_name || user?.email || "User"}
                      </p>
                      <p className="text-xs text-gray-400 leading-tight">Applicant</p>
                    </section>

                    <figure className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#035b9d] font-bold text-xs shrink-0">
                    {initials}
                    </figure>
                  </button>
                </section>
          </section>
        </nav>

        <section className="p-12">
          <DashboardHeader profile={profile} />
          <QualificationList qualifications={profile?.qualifications ?? []} />
          <CVCard cvUrl={cvUrl} />
        </section>
      </section>

    </main>
  );
}