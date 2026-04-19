import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { PersonalInfoSection } from "./personalInfo";
import { EducationSection } from "./education";
import { SkillsSection } from "./skills";
import { ConnectivitySection } from "./connectivity";
import { CVUploadSection } from "./cvUpload";

export function EditProfileForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [cvFile, setCvFile] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    surname: "",
    bio: "",
    location: "",
    nqf_level: "",
    email: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();
        console.log("Raw profile response:", text); // keep this so we can debug
        const data = JSON.parse(text);

        if (data.profile) {
          setFormData({
            full_name: data.profile.full_name ?? "",
            surname:   data.profile.surname   ?? "",
            bio:       data.profile.bio       ?? "",
            location:  data.profile.location  ?? "",
            nqf_level: data.profile.nqf_level ?? "",
            email:     data.profile.email     ?? "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load your profile. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
  setSaving(true);
  setError(null);
  setSuccess(false);
  try {
    const { email, ...rest } = formData; // exclude email from payload
    const payload = Object.fromEntries(
      Object.entries(rest).filter(([_, v]) => v !== "" && v !== null)
    );

    const res = await fetch(`${API}/api/profile/me`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save profile");
    }

    if (cvFile) {
      const fd = new FormData();
      fd.append("cv", cvFile);
      const cvRes = await fetch(`${API}/api/profile/me/cv`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!cvRes.ok) throw new Error("Failed to upload CV");
    }

    setSuccess(true);
    setTimeout(() => navigate("/dashboard"), 1500);
  } catch (err) {
    console.error(err);
    setError(err.message);
  } finally {
    setSaving(false);
  }
};

  if (loading) return <p className="text-gray-400 text-sm p-12">Loading your profile...</p>;

  return (
    <div className="space-y-8">
      <PersonalInfoSection formData={formData} setFormData={setFormData} />
      <EducationSection formData={formData} setFormData={setFormData} />
      <SkillsSection />
      <ConnectivitySection formData={formData} setFormData={setFormData} />
      <CVUploadSection onFileSelect={setCvFile} />

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {success && <p className="text-green-500 text-sm text-center">Profile saved! Redirecting...</p>}

      <nav className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-400 font-bold hover:text-[#1b1c1c] transition-colors flex items-center gap-2"
        >
          ← Discard Changes
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto px-12 py-5 bg-gradient-to-br from-[#035b9d] to-[#3174b7] text-white rounded-full font-bold text-lg shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </nav>
    </div>
  );
}