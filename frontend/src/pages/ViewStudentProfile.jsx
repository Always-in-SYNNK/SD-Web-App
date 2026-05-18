import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Sidebar } from "../components/dashboard/Sidebar";
import { NotificationDropdown } from "../components/notifications/notificationDropdown";

export default function ViewStudentProfile() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cvUrl, setCvUrl] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);

          const skillsRes = await fetch(`${API}/api/skills/applicant/${data.profile.applicant_profile_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const skillsData = await skillsRes.json();
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
    const fetchSignedUrl = async () => {
      try {
        const res = await fetch(`${API}/api/profile/me/cv/signed-url`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.signed_url) setCvUrl(data.signed_url);
      } catch (err) {
        console.error("Failed to fetch CV URL:", err);
      }
    };
    if (token) fetchSignedUrl();
  }, [API, token]);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "JD";


  return (
    <main className="flex min-h-screen bg-[#faf9f8]">
      <Sidebar activePage="/profile" />
      <section className="ml-64 min-h-screen w-full">

        <nav className="sticky top-0 z-50 flex items-center justify-between px-12 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <section className="flex items-center gap-6 text-sm font-medium">
            <a href="/" className="text-gray-400 hover:text-[#035b9d]">Home</a>
            <a href="/dashboard" className="text-gray-400 hover:text-[#035b9d]">Dashboard</a>
            <span className="text-[#035b9d] font-bold border-b-2 border-[#035b9d] pb-0.5">Profile</span>
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

        <section className="pb-24 px-8 pt-12">
          <div className="max-w-4xl mx-auto">

            <header className="mb-12 flex items-start justify-between">
              <div>
                <small className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">My Profile</small>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1b1c1c] tracking-tight mb-4 mt-1">
                  {loading ? "Loading..." : `${profile?.full_name ?? ""} ${profile?.surname ?? ""}`.trim() || "Your Profile"}
                </h1>
                <p className="text-gray-500 text-lg leading-relaxed">
                  {profile?.bio || "No bio added yet."}
                </p>
              </div>
              <button
                onClick={() => navigate("/profile/edit")}
                className="px-6 py-3 bg-[#035b9d] text-white rounded-full font-bold text-sm hover:opacity-90 transition shrink-0 mt-2"
              >
                ✏️ Edit Profile
              </button>
            </header>

            {loading ? (
              <p className="text-gray-400 text-sm">Loading your profile...</p>
            ) : (
              <div className="space-y-6">

                <section className="bg-white p-8 rounded-xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#3174b7]" />
                  <h3 className="text-lg font-bold text-[#1b1c1c] mb-6">Personal Details</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">First Name</dt>
                      <dd className="text-[#1b1c1c] font-medium">{profile?.full_name || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Surname</dt>
                      <dd className="text-[#1b1c1c] font-medium">{profile?.surname || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Email</dt>
                      <dd className="text-[#1b1c1c] font-medium">{profile?.email || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Location</dt>
                      <dd className="text-[#1b1c1c] font-medium">{profile?.location || "—"}</dd>
                    </div>
                    <div className="md:col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Bio</dt>
                      <dd className="text-[#1b1c1c] font-medium leading-relaxed">{profile?.bio || "—"}</dd>
                    </div>
                  </dl>
                </section>

                <section className="bg-white p-8 rounded-xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                  <h3 className="text-lg font-bold text-[#1b1c1c] mb-6">Education</h3>
                  <dl>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Current NQF Level</dt>
                    <dd className="text-[#1b1c1c] font-medium">
                      {profile?.nqf_level ? `NQF Level ${profile.nqf_level}` : "—"}
                    </dd>
                  </dl>
                </section>

                
                <section className="bg-white p-8 rounded-xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#035b9d]" />
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#1b1c1c]">Qualifications</h3>
                    <button
                      onClick={() => navigate("/profile/edit")}
                      className="text-xs text-[#035b9d] font-semibold hover:underline"
                    >
                      + Add
                    </button>
                  </div>

                  {!profile?.qualifications?.length ? (
                    <p className="text-gray-400 text-sm">No qualifications added yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {profile.qualifications.map((q) => (
                        <li key={q.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                          <figure className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg shrink-0">
                            🎓
                          </figure>
                          <section>
                            <strong className="text-sm font-bold text-[#1b1c1c]">{q.title || q.qualification_name}</strong>
                            {q.field && <p className="text-xs text-gray-400 mt-0.5">{q.field}{q.subfield ? ` · ${q.subfield}` : ""}</p>}
                            {q.originator && <p className="text-xs text-gray-400">{q.originator}</p>}
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {q.nqf_level && (
                                <mark className="text-xs bg-blue-50 text-[#035b9d] px-2 py-0.5 rounded-full font-semibold not-italic">
                                  NQF {q.nqf_level}
                                </mark>
                              )}
                              <mark className={`text-xs px-2 py-0.5 rounded-full font-semibold not-italic ${
                                q.status === "completed" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                              }`}>
                                {q.status === "completed" ? "Completed" : "In Progress"}
                              </mark>
                              {q.date_obtained && (
                                <time className="text-xs text-gray-300">{q.date_obtained}</time>
                              )}
                            </div>
                          </section>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                
                <section className="bg-white p-8 rounded-xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#035b9d]" />
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#1b1c1c]">Skills</h3>
                    <button
                      onClick={() => navigate("/profile/edit")}
                      className="text-xs text-[#035b9d] font-semibold hover:underline"
                    >
                      + Add
                    </button>
                  </div>
                  {!skills?.length ? (
                    <p className="text-gray-400 text-sm">
                      No skills added yet.
                      <button
                        onClick={() => navigate("/profile/edit")}
                        className="ml-2 text-[#035b9d] font-semibold hover:underline"
                      >
                        Add some →
                      </button>
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-4 py-2 bg-blue-50 text-[#035b9d] font-bold rounded-full text-sm"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                </section>

                <section className="bg-white p-8 rounded-xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-400" />
                  <h3 className="text-lg font-bold text-[#1b1c1c] mb-4">CV / Resume</h3>
                  {cvUrl ? (
                    <a
                      href={cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#035b9d] text-white rounded-full font-bold text-sm hover:opacity-90 transition"
                    >
                      📄 View CV
                    </a>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      No CV uploaded yet.
                      <button
                        onClick={() => navigate("/profile/edit")}
                        className="ml-2 text-[#035b9d] font-semibold hover:underline"
                      >
                        Upload one →
                      </button>
                    </p>
                  )}
                </section>

              </div>
            )}
          </div>
        </section>
      </section>

      <div className="fixed bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none overflow-hidden">
        <div className="w-full h-full bg-[#035b9d] rounded-full blur-[100px]" />
      </div>
    </main>
  );
}