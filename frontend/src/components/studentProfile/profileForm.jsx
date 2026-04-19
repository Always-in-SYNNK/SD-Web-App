import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { PersonalInfoSection } from "./personalInfo";
import { EducationSection } from "./education";
import { SkillsSection } from "./skills";
import { ConnectivitySection } from "./connectivity";
import { CVUploadSection } from "./cvUpload";

export function ProfileForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cvFile, setCvFile] = useState(null);

  // form state — matches what upsertApplicantProfileByUserId expects
  const [formData, setFormData] = useState({
    full_name: "",
    surname: "",
    bio: "",
    location: "",
    nqf_level: "",
  });

  // pre-fill from GET /me on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { profile } = await res.json();
        if (profile) {
          setFormData({
            full_name: profile.full_name ?? "",
            surname:   profile.surname   ?? "",
            bio:       profile.bio       ?? "",
            location:  profile.location  ?? "",
            nqf_level: profile.nqf_level ?? "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Save profile fields
      await fetch(`${API}/api/profile/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      // 2. Upload CV if one was selected
      if (cvFile) {
        const fd = new FormData();
        fd.append("cv", cvFile);
        await fetch(`${API}/api/profile/me/cv`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400 text-sm">Loading your profile...</p>;

  return (
    <div className="space-y-8">
      <PersonalInfoSection formData={formData} setFormData={setFormData} />
      <EducationSection formData={formData} setFormData={setFormData} />
      <SkillsSection />
      <ConnectivitySection formData={formData} setFormData={setFormData} />
      <CVUploadSection onFileSelect={setCvFile} />

      <nav className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-400 font-bold hover:text-[#1b1c1c] transition-colors flex items-center gap-2"
        >
          ← Save & Exit
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto px-12 py-5 bg-gradient-to-br from-[#035b9d] to-[#3174b7] text-white rounded-full font-bold text-lg shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Complete Profile"}
        </button>
      </nav>
    </div>
  );
}