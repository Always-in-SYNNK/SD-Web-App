import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { Sidebar } from "../components/dashboard/Sidebar";
import { EditProfileForm } from "../components/studentProfile/editProfileForm";
import {useNavigate} from "react-router-dom";
import { NotificationDropdown } from "../components/notifications/notificationDropdown";


export default function EditProfile() {
  const { token, user } = useAuth();
  const API = import.meta.env.VITE_API_URL;
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
  
          // fetch skills using applicant_profile_id from the profile
          const skillsRes = await fetch(`${API}/api/skills/applicant/${data.profile.applicant_profile_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const skillsData = await skillsRes.json();
          //console.log("SKILLS:", skillsData);
          if (skillsData.success) setSkills(skillsData.applicantSkills || []);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      setLoading(true);
      fetchProfile();
    }
  }, [API, token]);

   useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-user-menu]")) setShowMenu(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "JD";

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <main className="flex min-h-screen bg-[#faf9f8]">
      <Sidebar activePage="/profile" />
      <section className="ml-64 min-h-screen w-full">

        <nav className="sticky top-0 z-50 flex items-center justify-end px-12 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <section className="flex items-center gap-3">
              <NotificationDropdown/>
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
              
                              {showMenu && (
                                <section className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                                  <button
                                    type="button"
                                    onClick={() => { setShowMenu(false); navigate("/dashboard"); }}
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
        </nav>

        <section className="min-h-screen pb-24 px-8 pt-12">
          <article className="max-w-4xl mx-auto">
            <header className="mb-12">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1b1c1c] tracking-tight mb-4">
                Edit Profile
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed">
                Keep your profile up to date to stay visible to the right opportunities.
              </p>
            </header>

            <EditProfileForm />
          </article>
        </section>
      </section>

      <aside className="fixed bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none overflow-hidden" aria-hidden="true">
        <span className="w-full h-full block bg-[#035b9d] rounded-full blur-[100px]" aria-hidden="true" />
      </aside>
    </main>
  );
}